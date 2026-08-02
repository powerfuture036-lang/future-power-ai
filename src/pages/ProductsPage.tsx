import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { formatPrice, cn } from '@/lib/utils'
import type { Product, Category } from '@/types'

const statusColors: Record<string, string> = {
  available: 'bg-success/15 text-success',
  unavailable: 'bg-muted/20 text-muted',
  coming_soon: 'bg-warning/15 text-warning',
  limited: 'bg-accent/15 text-accent',
  sold: 'bg-danger/15 text-danger',
  rental: 'bg-primary/15 text-primary'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, images:product_images(*), category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order')
    ]).then(([pRes, cRes]) => {
      if (pRes.data) setProducts(pRes.data as Product[])
      if (cRes.data) setCategories(cRes.data as Category[])
      setLoading(false)
    })
  }, [])

  const filtered = products.filter((p) => {
    const matchCat = filter === 'all' || p.category_id === filter
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <SEO title="Products" description="Browse generators, solar systems, inverters, batteries and power solutions." />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold mb-6"
        >
          Products
        </motion.h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-border/50 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors',
                filter === 'all' ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors',
                  filter === c.id ? 'bg-primary text-white' : 'glass text-muted-foreground hover:text-foreground'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl glass animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted py-20">No products found. Owner can add products from the dashboard.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const primaryImg = p.images?.find((img) => img.is_primary) || p.images?.[0]
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/products/${p.slug}`}
                    className="block rounded-2xl glass border border-border/40 overflow-hidden hover:border-primary/30 transition-all group"
                  >
                    <div className="aspect-[4/3] bg-surface-elevated relative overflow-hidden">
                      {primaryImg ? (
                        <img
                          src={primaryImg.url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-4xl">⚡</div>
                      )}
                      <span
                        className={cn(
                          'absolute top-3 left-3 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize',
                          statusColors[p.status] || statusColors.available
                        )}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted mb-1">{p.brand || p.category?.name}</p>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      {p.power && <p className="text-xs text-muted-foreground mb-2">{p.power}</p>}
                      <p className="text-sm font-semibold text-primary">{formatPrice(p.price, p.currency)}</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
