import { Badge } from '@/components/ui/Badge'
import type { ShipmentStatusApi } from '@/types'

function tone(status: ShipmentStatusApi) {
  switch (status) {
    case 'DELIVERED':
      return 'success' as const
    case 'IN_TRANSIT':
      return 'info' as const
    case 'AWAITING_PICKUP':
      return 'warning' as const
    case 'POSTED':
      return 'info' as const
    default:
      return 'neutral' as const
  }
}

interface ShipmentStatusBadgeProps {
  status: ShipmentStatusApi
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return <Badge tone={tone(status)}>{status}</Badge>
}
