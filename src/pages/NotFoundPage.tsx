import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '@/components/common/SEO'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="404" />
      <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-6xl font-semibold text-muted mb-4">404</p>
          <h1 className="text-xl font-medium mb-2">Page not found</h1>
          <p className="text-muted-foreground text-sm mb-8">The page you are looking for does not exist.</p>
          <Link to="/" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Back to AI Chat
          </Link>
        </motion.div>
      </div>
    </>
  )
}
