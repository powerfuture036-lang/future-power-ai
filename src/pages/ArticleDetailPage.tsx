import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SEO from '@/components/common/SEO'
import { supabase } from '@/lib/supabase'
import type { Article } from '@/types'

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setArticle(data as Article)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12"><div className="h-96 rounded-2xl glass animate-pulse" /></div>
  if (!article) return <div className="text-center py-20 text-muted">Article not found</div>

  return (
    <>
      <SEO title={article.seo_title || article.title} description={article.seo_description || article.excerpt || ''} image={article.cover_image || undefined} path={`/articles/${article.slug}`} type="article" />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/articles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Articles
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {article.cover_image && (
            <img src={article.cover_image} alt="" className="w-full aspect-video object-cover rounded-2xl mb-8 border border-border/40" />
          )}
          <h1 className="text-3xl font-semibold mb-3">{article.title}</h1>
          <p className="text-sm text-muted mb-8">
            {article.published_at && new Date(article.published_at).toLocaleDateString()}
            {article.author && ` · ${article.author}`}
          </p>
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </div>
        </motion.div>
      </article>
    </>
  )
}
