import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Table, TBody, TD, TH, THead } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useDataStore } from '../store/dataStore'
import type { OrderStatus } from '../models'

function tone(status: OrderStatus) {
  switch (status) {
    case 'DELIVERED':
      return 'success' as const
    case 'IN_TRANSIT':
      return 'info' as const
    case 'PENDING':
      return 'warning' as const
    case 'CANCELLED':
      return 'danger' as const
  }
}

export function OrderManagementPage() {
  const orders = useDataStore((s) => s.orders)
  const loadOrders = useDataStore((s) => s.loadOrders)

  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.data.filter((o) => {
      const matchesStatus = status === 'ALL' ? true : o.status === status
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.shipmentId.toLowerCase().includes(q)

      const created = new Date(o.createdAt).getTime()
      const fromOk = fromDate ? created >= new Date(fromDate).getTime() : true
      const toOk = toDate ? created <= new Date(toDate).getTime() : true
      return matchesStatus && matchesQuery && fromOk && toOk
    })
  }, [fromDate, orders.data, query, status, toDate])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Order Management</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Orders table with filters and status badges (dummy data).
        </div>
      </div>

      <Card>
        <CardHeader
          title="Orders"
          subtitle="Filter by status, date, and search"
          right={
            <Button size="sm" variant="secondary" onClick={() => void loadOrders()} isLoading={orders.loading}>
              Refresh
            </Button>
          }
        />
        <CardBody>
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div>
              <div className="mb-1 text-xs text-[rgb(var(--muted))]">Search</div>
              <Input
                placeholder="Order, customer, shipment…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-[rgb(var(--muted))]">Status</div>
              <select
                className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-sm focus-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus | 'ALL')}
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-[rgb(var(--muted))]">From</div>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-[rgb(var(--muted))]">To</div>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {orders.error ? (
            <div className="mb-3 text-sm text-rose-600 dark:text-rose-300">{orders.error}</div>
          ) : null}

          <Table>
            <THead>
              <tr>
                <TH>Order</TH>
                <TH>Customer</TH>
                <TH>Shipment</TH>
                <TH>Value</TH>
                <TH>Status</TH>
                <TH>Date</TH>
              </tr>
            </THead>
            <TBody>
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <TD className="font-medium">{o.id}</TD>
                  <TD>{o.customer}</TD>
                  <TD className="text-[rgb(var(--muted))]">{o.shipmentId}</TD>
                  <TD>₹{o.value.toLocaleString()}</TD>
                  <TD>
                    <Badge tone={tone(o.status)}>{o.status}</Badge>
                  </TD>
                  <TD className="text-[rgb(var(--muted))]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TD>
                </tr>
              ))}
              {orders.loading ? (
                <tr>
                  <TD className="text-[rgb(var(--muted))]">Loading…</TD>
                  <TD />
                  <TD />
                  <TD />
                  <TD />
                  <TD />
                </tr>
              ) : null}
            </TBody>
          </Table>

          <div className="mt-3 text-xs text-[rgb(var(--muted))]">
            Showing {filtered.length} of {orders.data.length}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

