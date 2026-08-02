import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/contexts/AppContext'

export default function AdminContact() {
  const { contact, refreshContact } = useApp()
  const [form, setForm] = useState({
    company_name: '', phone: '', whatsapp: '', email: '', address: '', google_maps_url: '',
    facebook: '', instagram: '', tiktok: '', youtube: '', working_hours: '', logo_url: '', cover_image_url: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (contact) {
      setForm({
        company_name: contact.company_name || '',
        phone: contact.phone || '',
        whatsapp: contact.whatsapp || '',
        email: contact.email || '',
        address: contact.address || '',
        google_maps_url: contact.google_maps_url || '',
        facebook: contact.facebook || '',
        instagram: contact.instagram || '',
        tiktok: contact.tiktok || '',
        youtube: contact.youtube || '',
        working_hours: contact.working_hours || '',
        logo_url: contact.logo_url || '',
        cover_image_url: contact.cover_image_url || ''
      })
    }
  }, [contact])

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    if (contact?.id) {
      await supabase.from('contacts').update(payload).eq('id', contact.id)
    } else {
      await supabase.from('contacts').insert(payload)
    }
    await refreshContact()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <SEO title="Contact Info" />
      <h1 className="text-2xl font-semibold mb-6">Contact Information</h1>
      <div className="max-w-lg space-y-3">
        {(Object.keys(form) as (keyof typeof form)[]).map((key) => (
          <div key={key}>
            <label className="text-xs text-muted capitalize">{key.replace(/_/g, ' ')}</label>
            <input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none"
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </AdminLayout>
  )
}
