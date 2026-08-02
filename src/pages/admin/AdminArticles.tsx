import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Article } from '@/types'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', is_published: true })
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('articles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setArticles(data as Article[])
    })
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.title),
      content: form.content,
      excerpt: form.excerpt || null,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
    if (editing) {
      await supabase.from('articles').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('articles').insert({ ...payload, is_featured: false })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete article?')) return
    await supabase.from('articles').delete().eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <SEO title="Manage Articles" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', content: '', excerpt: '', is_published: true }); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl glass border border-border/40">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.title}</p>
              <p className="text-xs text-muted">{a.is_published ? 'Published' : 'Draft'}</p>
            </div>
            <button onClick={() => { setEditing(a); setForm({ title: a.title, content: a.content, excerpt: a.excerpt || '', is_published: a.is_published }); setShowForm(true) }} className="p-2 rounded-lg hover:bg-white/5"><Edit2 className="h-4 w-4" /></button>
            <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-danger/20 text-danger"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {articles.length === 0 && <p className="text-muted text-sm text-center py-12">No articles yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-border p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">{editing ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted">Excerpt</label>
                <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted">Content (Markdown)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none font-mono" rows={10} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                Published
              </label>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full mt-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
