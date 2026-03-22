/**
 * Data router (reference: sikh-gurus-admin-panel-frontend 1 / router.tsx).
 */
import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { HomeRedirect } from '@/components/layout/home-redirect'
import { AppLayout } from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/auth-layout'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import { DashboardPage } from '@/pages/DashboardPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CarrierManagementPage } from '@/pages/CarrierManagementPage'
import { PublicTrackEntryPage } from '@/pages/PublicTrackEntryPage'

/** Map + STOMP pages are lazy so Leaflet and `@stomp/stompjs` sit in separate chunks (smaller first paint). */
const ShipmentTrackingPage = lazy(() =>
  import('@/pages/ShipmentTrackingPage').then((m) => ({ default: m.ShipmentTrackingPage })),
)
const RealtimeTrackingPage = lazy(() =>
  import('@/pages/RealtimeTrackingPage').then((m) => ({ default: m.RealtimeTrackingPage })),
)
const PublicTrackPage = lazy(() =>
  import('@/pages/PublicTrackPage').then((m) => ({ default: m.PublicTrackPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[rgb(var(--muted))]">
      Loading…
    </div>
  )
}

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
    path: ROUTES.PUBLIC_TRACK,
    element: <PublicTrackEntryPage />,
  },
  {
    path: `${ROUTES.PUBLIC_TRACK}/:trackingId`,
    element: (
      <Suspense fallback={<RouteFallback />}>
        <PublicTrackPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            path: 'tracking',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ShipmentTrackingPage />
              </Suspense>
            ),
          },
          { path: 'marketplace', element: <MarketplacePage /> },
          { path: 'carriers', element: <CarrierManagementPage /> },
          {
            path: 'realtime',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <RealtimeTrackingPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <HomeRedirect /> },
])
