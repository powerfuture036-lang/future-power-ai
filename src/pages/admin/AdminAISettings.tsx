import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/openrouter'

export default function AdminAISettings() {
  const { aiSettings, refreshAISettings } = useApp()
  const [form, setForm] = useState({
    api_key: '',
    default_model: 'openai/gpt-4o-mini',
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    temperature: 0.7,
    max_tokens: 2048,
    enable_suggestions: true,
    enable_memory: true
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (aiSettings) {
      setForm({
        api_key: '',
        default_model: aiSettings.default_model || 'openai/gpt-4o-mini',
        system_prompt: aiSettings.system_prompt || DEFAULT_SYSTEM_PROMPT,
        temperature: aiSettings.temperature ?? 0.7,
        max_tokens: aiSettings.max_tokens ?? 2048,
        enable_suggestions: aiSettings.enable_suggestions !== false,
        enable_memory: aiSettings.enable_memory !== false
      })
    }
  }, [aiSettings])

  const handleSave = async () => {
    setSaving(true)
    const payload: Record<string, unknown> = {
      default_model: form.default_model,
      system_prompt: form.system_prompt,
      temperature: form.temperature,
      max_tokens: form.max_tokens,
      enable_suggestions: form.enable_suggestions,
      enable_memory: form.enable_memory,
      updated_at: new Date().toISOString()
    }
    // Store API key (in production use encryption / vault)
    if (form.api_key.trim()) {
      payload.api_key_encrypted = form.api_key.trim()
    }

    if (aiSettings?.id && aiSettings.id !== 'default') {
      await supabase.from('ai_settings').update(payload).eq('id', aiSettings.id)
    } else {
      await supabase.from('ai_settings').insert(payload)
    }
    await refreshAISettings()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <SEO title="AI Settings" />
      <h1 className="text-2xl font-semibold mb-6">AI Settings</h1>
      <div className="max-w-lg space-y-4">
        <div>
          <label className="text-xs text-muted">OpenRouter API Key</label>
          <input
            type="password"
            value={form.api_key}
            onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            placeholder={aiSettings?.api_key_encrypted ? '•••••••• (leave blank to keep)' : 'sk-or-...'}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none font-mono"
          />
          <p className="text-[11px] text-muted mt-1">Get your key at openrouter.ai — supports GPT, Claude, Gemini, DeepSeek, Qwen and more.</p>
        </div>
        <div>
          <label className="text-xs text-muted">Default Model</label>
          <input
            value={form.default_model}
            onChange={(e) => setForm({ ...form, default_model: e.target.value })}
            placeholder="openai/gpt-4o-mini"
            className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none font-mono"
          />
          <p className="text-[11px] text-muted mt-1">Examples: openai/gpt-4o, anthropic/claude-3.5-sonnet, google/gemini-2.0-flash, deepseek/deepseek-chat, qwen/qwen-2.5-72b-instruct</p>
        </div>
        <div>
          <label className="text-xs text-muted">System Prompt</label>
          <textarea
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            rows={8}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none font-mono"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted">Temperature ({form.temperature})</label>
            <input type="range" min="0" max="2" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} className="w-full mt-2" />
          </div>
          <div>
            <label className="text-xs text-muted">Max Tokens</label>
            <input type="number" value={form.max_tokens} onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enable_suggestions} onChange={(e) => setForm({ ...form, enable_suggestions: e.target.checked })} />
          Enable suggested questions
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enable_memory} onChange={(e) => setForm({ ...form, enable_memory: e.target.checked })} />
          Enable conversation memory
        </label>
        <button onClick={handleSave} disabled={saving} className="w-full mt-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>
    </AdminLayout>
  )
}
