import {
  ChartNoAxesCombined,
  MapPinned,
  ShoppingBag,
  Truck,
  Waves,
} from 'lucide-react'
import type { UserRole } from '@/types'

export type NavItemDef = {
  to: string
  label: string
  icon: typeof ChartNoAxesCombined
  /** Who sees this link in the sidebar (each account is one role). */
  roles: readonly UserRole[]
}

export const navItems: NavItemDef[] = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartNoAxesCombined, roles: ['SHIPPER'] },
  { to: '/tracking', label: 'Shipment Tracking', icon: MapPinned, roles: ['SHIPPER'] },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['SHIPPER', 'CARRIER'] },
  { to: '/carriers', label: 'Carrier Management', icon: Truck, roles: ['CARRIER'] },
  { to: '/realtime', label: 'Real-time Tracking', icon: Waves, roles: ['CARRIER'] },
]

