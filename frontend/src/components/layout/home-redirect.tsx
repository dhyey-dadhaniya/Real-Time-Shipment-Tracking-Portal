import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { ROUTES } from '@/constants/routes'

/** Default landing page after login: role-appropriate first screen. */
export function HomeRedirect() {
  const { user } = useAuth()
  if (user?.role === 'CARRIER') {
    return <Navigate to={ROUTES.MARKETPLACE} replace />
  }
  return <Navigate to={ROUTES.DASHBOARD} replace />
}
