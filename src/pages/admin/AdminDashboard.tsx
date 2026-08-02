import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, FileText, MessageSquare, Bot } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import SEO from '@/components/common/SEO'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, articles: 0, conversations: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true })
    ]).then(([p, a, c]) => {
      setStats({
        products: p.count || 0,
        articles: a.count || 0,
        conversations: c.count || 0
      })
    })
  }, [])

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, to: '/admin/products' },
    { label: 'Articles', value: stats.articles, icon: FileText, to: '/admin/articles' },
    { label: 'Conversations', value: stats.conversations, icon: MessageSquare, to: '/' },
    { label: 'AI Settings', value: 'Configure', icon: Bot, to: '/admin/ai' }
  ]

  return (
    <AdminLayout>
      <SEO title="Admin Dashboard" />
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Link key={c.label} to={c.to} className="p-5 rounded-2xl glass border border-border/40 hover:border-primary/30 transition-all">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="text-xs text-muted mt-1">{c.label}</p>
            </Link>
          )
        })}
      </div>
      <p className="text-sm text-muted mt-10">
        Welcome to Future Power AI admin. Manage products, articles, contact info and AI configuration from the sidebar.
      </p>
    </AdminLayout>
  )
}
