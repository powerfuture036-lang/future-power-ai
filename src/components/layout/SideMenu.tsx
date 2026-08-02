import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MessageSquare, Package, FileText, Info, Phone, Shield, FileCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const links = [
  { to: '/', label: 'AI Chat', icon: MessageSquare },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/articles', label: 'Articles', icon: FileText },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/privacy', label: 'Privacy Policy', icon: Shield },
  { to: '/terms', label: 'Terms of Service', icon: FileCheck }
]

export default function SideMenu({ open, onClose }: Props) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-[min(320px,85vw)] glass-strong border-l border-border shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="font-semibold text-sm text-muted-foreground">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {links.map((link, i) => {
                const active = location.pathname === link.to
                const Icon = link.icon
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      to={link.to}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border/50 text-xs text-muted text-center">
              Future Power AI © {new Date().getFullYear()}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
