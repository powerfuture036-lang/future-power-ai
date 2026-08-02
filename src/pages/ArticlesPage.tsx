import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/types'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        if (data) setArticles(data as Article[])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <SEO title="Articles" description="Technical articles about generators, solar energy and power solutions." />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold mb-8">
          Articles
        </motion.h1>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl glass animate-pulse" />)}</div>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted py-20">No articles yet.</p>
        ) : (
          <div className="space-y-4">
            {articles.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/articles/${a.slug}`} className="flex gap-4 p-4 rounded-2xl glass border border-border/40 hover:border-primary/30 transition-all group">
                  {a.cover_image && (
                    <img src={a.cover_image} alt="" className="h-24 w-32 rounded-xl object-cover shrink-0 hidden sm:block" />
                  )}
                  <div className="flex-1 min-w-0">
                    {a.is_featured && <span className="text-[10px] text-primary font-medium">FEATURED</span>}
                    <h2 className="font-medium group-hover:text-primary transition-colors line-clamp-2">{a.title}</h2>
                    {a.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.excerpt}</p>}
                    <p className="text-xs text-muted mt-2">{a.published_at ? new Date(a.published_at).toLocaleDateString() : ''}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
