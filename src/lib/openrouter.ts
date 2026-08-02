import type { Message, AISettings } from '@/types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export interface StreamChunk {
  content: string
  done: boolean
  model?: string
  error?: string
}

export const DEFAULT_SYSTEM_PROMPT = `You are Future Power AI, an expert technical assistant specialized exclusively in:

- Diesel & Gasoline Generators (sizing, installation, maintenance, troubleshooting, fuel consumption)
- Solar Energy Systems (panels, charge controllers, inverters, batteries, hybrid systems)
- Inverters (off-grid, on-grid, hybrid)
- Batteries (lead-acid, AGM, Gel, Lithium LiFePO4)
- ATS (Automatic Transfer Switches)
- AVR (Automatic Voltage Regulators)
- Electrical Protection & Power Quality
- Energy calculations, load assessment and system design
- Installation best practices and safety

You provide accurate, professional, practical and safety-conscious answers.
When recommending products, be honest about requirements and limitations.
If a question is outside your domain, politely redirect to power & energy topics.
Always answer in the same language the user is using.
Be concise but complete. Use bullet points and tables when helpful.
Never invent product prices or claim to sell products yourself — you only provide technical knowledge.
The company manages products and contact information separately.`

export async function* streamChatCompletion({
  messages,
  settings,
  apiKey,
  model,
  onError
}: {
  messages: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }[]
  settings: Pick<AISettings, 'temperature' | 'max_tokens' | 'system_prompt'>
  apiKey: string
  model: string
  onError?: (err: string) => void
}): AsyncGenerator<StreamChunk> {
  if (!apiKey) {
    yield { content: '', done: true, error: 'OpenRouter API key is not configured. Please set it in the Admin Dashboard.' }
    return
  }

  const systemMessage = {
    role: 'system',
    content: settings.system_prompt || DEFAULT_SYSTEM_PROMPT
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://futurepower.ai',
        'X-Title': 'Future Power AI'
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature: settings.temperature ?? 0.7,
        max_tokens: settings.max_tokens ?? 2048,
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      let message = `OpenRouter error: ${response.status}`
      try {
        const parsed = JSON.parse(errText)
        message = parsed.error?.message || message
      } catch {
        // ignore
      }
      yield { content: '', done: true, error: message }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield { content: '', done: true, error: 'No response stream' }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let usedModel = model

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          yield { content: '', done: true, model: usedModel }
          return
        }
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (parsed.model) usedModel = parsed.model
          if (delta) {
            yield { content: delta, done: false, model: usedModel }
          }
        } catch {
          // skip malformed
        }
      }
    }

    yield { content: '', done: true, model: usedModel }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    onError?.(message)
    yield { content: '', done: true, error: message }
  }
}

export async function fetchAvailableModels(apiKey: string): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map((m: { id: string; name: string }) => ({
      id: m.id,
      name: m.name || m.id
    }))
  } catch {
    return []
  }
}

export function buildMessagesForAPI(
  history: Message[],
  newUserContent: string,
  attachments?: { type: string; url: string }[]
) {
  const msgs = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: m.content as string
    }))

  if (attachments && attachments.length > 0) {
    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: newUserContent }
    ]
    for (const att of attachments) {
      if (att.type === 'image') {
        contentParts.push({
          type: 'image_url',
          image_url: { url: att.url }
        })
      } else {
        contentParts[0].text += `\n\n[Attached ${att.type}: ${att.url}]`
      }
    }
    msgs.push({ role: 'user', content: contentParts as unknown as string })
  } else {
    msgs.push({ role: 'user', content: newUserContent })
  }

  return msgs
}
