import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/types'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(*)')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProduct(data as Product)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12"><div className="h-96 rounded-2xl glass animate-pulse" /></div>
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">Product not found</p>
        <Link to="/products" className="text-primary text-sm">Back to products</Link>
      </div>
    )
  }

  const primaryImg = product.images?.find((i) => i.is_primary) || product.images?.[0]

  return (
    <>
      <SEO title={product.name} description={product.short_description || product.description?.slice(0, 160)} image={primaryImg?.url} path={`/products/${product.slug}`} type="product" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden glass border border-border/40">
              {primaryImg ? (
                <img src={primaryImg.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-muted">⚡</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img) => (
                  <img key={img.id} src={img.url} alt="" className="h-16 w-16 rounded-lg object-cover border border-border/40 shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted mb-1">{product.brand} {product.category?.name && `· ${product.category.name}`}</p>
            <h1 className="text-2xl font-semibold mb-3">{product.name}</h1>
            <p className="text-xl font-semibold text-primary mb-4">{formatPrice(product.price, product.currency)}</p>
            <span className={cn('text-xs px-2.5 py-1 rounded-full capitalize', 
              product.status === 'available' ? 'bg-success/15 text-success' : 'bg-muted/20 text-muted'
            )}>
              {product.status.replace('_', ' ')}
            </span>

            <div className="mt-6 space-y-3 text-sm">
              {product.power && <div className="flex justify-between border-b border-border/30 pb-2"><span className="text-muted">Power</span><span>{product.power}</span></div>}
              {product.fuel && <div className="flex justify-between border-b border-border/30 pb-2"><span className="text-muted">Fuel</span><span>{product.fuel}</span></div>}
              {product.voltage && <div className="flex justify-between border-b border-border/30 pb-2"><span className="text-muted">Voltage</span><span>{product.voltage}</span></div>}
              {product.frequency && <div className="flex justify-between border-b border-border/30 pb-2"><span className="text-muted">Frequency</span><span>{product.frequency}</span></div>}
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Specifications</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-border/30 pb-2">
                      <span className="text-muted">{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 prose-chat text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Ask AI about this product
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
