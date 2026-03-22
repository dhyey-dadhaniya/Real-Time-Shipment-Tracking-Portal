/**
 * Auth shell (reference: sikh-gurus-admin-panel-frontend 1 / layouts/auth-layout).
 * Centers child routes (login, register).
 */
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--bg))] p-4">
      <Outlet />
    </div>
  )
}
