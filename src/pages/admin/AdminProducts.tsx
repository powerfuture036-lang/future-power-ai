import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { slugify, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

const emptyForm = {
  name: '', description: '', price: '', status: 'available' as const, brand: '', power: '', fuel: '', voltage: '', frequency: '', category_id: ''
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('products').select('*, images:product_images(*)').order('sort_order').then(({ data }) => {
      if (data) setProducts(data as Product[])
    })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price?.toString() || '',
      status: p.status as typeof emptyForm.status,
      brand: p.brand || '',
      power: p.power || '',
      fuel: p.fuel || '',
      voltage: p.voltage || '',
      frequency: p.frequency || '',
      category_id: p.category_id || ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      brand: form.brand || null,
      power: form.power || null,
      fuel: form.fuel || null,
      voltage: form.voltage || null,
      frequency: form.frequency || null,
      updated_at: new Date().toISOString()
    }

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert({ ...payload, currency: 'USD', is_featured: false, sort_order: 0 })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <SEO title="Manage Products" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl glass border border-border/40">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted">{formatPrice(p.price, p.currency)} · {p.status}</p>
            </div>
            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/5"><Edit2 className="h-4 w-4" /></button>
            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-danger/20 text-danger"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {products.length === 0 && <p className="text-muted text-sm text-center py-12">No products yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-border p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {(['name', 'description', 'price', 'brand', 'power', 'fuel', 'voltage', 'frequency'] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs text-muted capitalize">{field}</label>
                  {field === 'description' ? (
                    <textarea
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none"
                      rows={3}
                    />
                  ) : (
                    <input
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="text-xs text-muted">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm outline-none"
                >
                  {['available', 'unavailable', 'coming_soon', 'limited', 'sold', 'rental'].map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
