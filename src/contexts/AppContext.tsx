import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContactInfo, AISettings, SiteSettings } from '@/types'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/openrouter'

interface AppContextValue {
  contact: ContactInfo | null
  aiSettings: AISettings | null
  siteSettings: SiteSettings | null
  loading: boolean
  refreshContact: () => Promise<void>
  refreshAISettings: () => Promise<void>
  refreshSiteSettings: () => Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const defaultAI: AISettings = {
  id: 'default',
  api_key_encrypted: null,
  default_model: 'openai/gpt-4o-mini',
  system_prompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  max_tokens: 2048,
  model_routing: null,
  enable_suggestions: true,
  enable_memory: true,
  updated_at: new Date().toISOString()
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [aiSettings, setAISettings] = useState<AISettings | null>(defaultAI)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshContact = async () => {
    const { data } = await supabase.from('contacts').select('*').limit(1).maybeSingle()
    if (data) setContact(data as ContactInfo)
  }

  const refreshAISettings = async () => {
    const { data } = await supabase.from('ai_settings').select('*').limit(1).maybeSingle()
    if (data) setAISettings(data as AISettings)
  }

  const refreshSiteSettings = async () => {
    const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle()
    if (data) setSiteSettings(data as SiteSettings)
  }

  useEffect(() => {
    Promise.all([refreshContact(), refreshAISettings(), refreshSiteSettings()])
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppContext.Provider
      value={{
        contact,
        aiSettings,
        siteSettings,
        loading,
        refreshContact,
        refreshAISettings,
        refreshSiteSettings
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
