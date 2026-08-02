import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, FileText, Phone, Bot, Settings, LogOut, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/articles', label: 'Articles', icon: FileText },
  { to: '/admin/contact', label: 'Contact', icon: Phone },
  { to: '/admin/ai', label: 'AI Settings', icon: Bot },
  { to: '/admin/settings', label: 'Settings', icon: Settings }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex bg-background">
      <aside className="hidden md:flex w-56 flex-col border-r border-border glass-strong">
        <div className="p-4 border-b border-border/50">
          <p className="font-semibold text-sm">Future Power</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors',
                  active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-border/50 space-y-0.5">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-white/5">
            <ArrowLeft className="h-4 w-4" /> View site
          </Link>
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border safe-bottom">
        <div className="flex justify-around py-2">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} className={cn('p-2 rounded-lg', active ? 'text-primary' : 'text-muted')}>
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  )
}
