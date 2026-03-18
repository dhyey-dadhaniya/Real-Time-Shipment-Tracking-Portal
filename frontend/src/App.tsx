import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ShipmentTrackingPage } from './pages/ShipmentTrackingPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { CarrierManagementPage } from './pages/CarrierManagementPage'
import { OrderManagementPage } from './pages/OrderManagementPage'
import { RealtimeTrackingPage } from './pages/RealtimeTrackingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracking" element={<ShipmentTrackingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/carriers" element={<CarrierManagementPage />} />
        <Route path="/orders" element={<OrderManagementPage />} />
        <Route path="/realtime" element={<RealtimeTrackingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
