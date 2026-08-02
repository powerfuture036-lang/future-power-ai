import { Link } from 'react-router-dom'
import { Menu, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/contexts/AppContext'

interface Props {
  onMenuOpen: () => void
}

export default function Header({ onMenuOpen }: Props) {
  const { contact } = useApp()

  return (
    <header className="sticky top-0 z-40 safe-top glass-strong border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {contact?.logo_url ? (
            <img src={contact.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="font-semibold tracking-tight text-sm sm:text-base group-hover:text-primary transition-colors">
            {contact?.company_name || 'Future Power AI'}
          </span>
        </Link>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuOpen}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>
    </header>
  )
}
