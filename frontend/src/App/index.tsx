/**
 * Root: providers and router (reference: sikh-gurus-admin-panel-frontend 1 / App/index.tsx).
 */
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/hooks/useToast'
import { router } from '@/router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  )
}
