/**
 * Data router (reference: sikh-gurus-admin-panel-frontend 1 / router.tsx).
 */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { AppLayout } from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/auth-layout'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import { DashboardPage } from '@/pages/DashboardPage'
import { ShipmentTrackingPage } from '@/pages/ShipmentTrackingPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CarrierManagementPage } from '@/pages/CarrierManagementPage'
import { RealtimeTrackingPage } from '@/pages/RealtimeTrackingPage'

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: ROUTES.REGISTER,
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'tracking', element: <ShipmentTrackingPage /> },
          { path: 'marketplace', element: <MarketplacePage /> },
          { path: 'carriers', element: <CarrierManagementPage /> },
          { path: 'realtime', element: <RealtimeTrackingPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
])
