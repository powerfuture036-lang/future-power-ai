import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import SEO from '@/components/common/SEO'

export default function AdminLoginPage() {
  const { isAdmin, loading, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, loading, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      const result = await signIn(email.trim(), password)

      if (result.error) {
        setError(result.error)
        return
      }

      navigate('/admin', { replace: true })
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEO title="Admin Login" />

      <div className="min-h-dvh flex items-center justify-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass-strong rounded-2xl border border-border p-8"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto mb-6 flex items-center justify-center text-xl">
            ⚡
          </div>

          <h1 className="text-lg font-semibold mb-1 text-center">
            Owner Access
          </h1>

          <p className="text-sm text-muted-foreground mb-8 text-center">
            Sign in with your owner email and password
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  )
}
