import {
  Boxes,
  ChartNoAxesCombined,
  MapPinned,
  ShoppingBag,
  Truck,
  Waves,
} from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartNoAxesCombined },
  { to: '/tracking', label: 'Shipment Tracking', icon: MapPinned },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/carriers', label: 'Carrier Management', icon: Truck },
  { to: '/orders', label: 'Order Management', icon: Boxes },
  { to: '/realtime', label: 'Real-time Tracking', icon: Waves },
] as const

