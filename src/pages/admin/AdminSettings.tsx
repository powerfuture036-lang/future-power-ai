import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'

export default function AdminSettings() {
  const { siteSettings, refreshSiteSettings } = useApp()
  const [form, setForm] = useState({
    site_name: 'Future Power AI',
    tagline: '',
    seo_title: '',
    seo_description: '',
    maintenance_mode: false,
    allow_guest_chat: true
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (siteSettings) {
      setForm({
        site_name: siteSettings.site_name || 'Future Power AI',
        tagline: siteSettings.tagline || '',
        seo_title: siteSettings.seo_title || '',
        seo_description: siteSettings.seo_description || '',
        maintenance_mode: siteSettings.maintenance_mode || false,
        allow_guest_chat: siteSettings.allow_guest_chat !== false
      })
    }
  }, [siteSettings])

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    if (siteSettings?.id) {
      await supabase.from('settings').update(payload).eq('id', siteSettings.id)
    } else {
      await supabase.from('settings').insert(payload)
    }
    await refreshSiteSettings()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <SEO title="Site Settings" />
      <h1 className="text-2xl font-semibold mb-6">Site Settings</h1>
      <div className="max-w-lg space-y-3">
        <div>
          <label className="text-xs text-muted">Site Name</label>
          <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted">Tagline</label>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted">SEO Title</label>
          <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted">SEO Description</label>
          <textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.allow_guest_chat} onChange={(e) => setForm({ ...form, allow_guest_chat: e.target.checked })} />
          Allow guest chat
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.maintenance_mode} onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })} />
          Maintenance mode
        </label>
        <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </AdminLayout>
  )
}
