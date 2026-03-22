import { Package, Waves } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { DashboardKpiView } from '@/utils/dashboard-derive'

interface DashboardKpiCardsProps {
  kpis: DashboardKpiView | undefined
  loading: boolean
}

export function DashboardKpiCards({ kpis, loading }: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader
          title="Total shipments"
          subtitle={loading ? 'Loading…' : 'From your account'}
          right={<Package size={18} className="text-[rgb(var(--muted))]" />}
        />
        <CardBody>
          <div className="text-2xl font-semibold">{kpis ? kpis.totalShipments : '—'}</div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Active shipments"
          subtitle="Not delivered"
          right={<Waves size={18} className="text-[rgb(var(--muted))]" />}
        />
        <CardBody>
          <div className="text-2xl font-semibold">{kpis ? kpis.activeShipments : '—'}</div>
        </CardBody>
      </Card>
    </div>
  )
}
