import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import PageLoader from './PageLoader'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!isAdmin) return <Navigate to="/fp-admin-login" replace />

  return <>{children}</>
}
