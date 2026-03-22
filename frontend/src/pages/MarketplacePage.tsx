import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TBody, TD, TH, THead } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { ShipmentStatusBadge } from '@/components/features/dashboard'
import { useMarketplacePage } from '@/hooks/marketplace/useMarketplacePage'
import type { BidStatusApi } from '@/types'

function bidTone(b: BidStatusApi) {
  if (b === 'ACCEPTED') return 'success' as const
  if (b === 'REJECTED') return 'danger' as const
  return 'neutral' as const
}

export function MarketplacePage() {
  const m = useMarketplacePage()

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Marketplace</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Shippers post loads; carriers browse open work and submit bids. Accept a bid when you are ready to
          assign a carrier.
        </div>
      </div>

      {!m.isCarrier && !m.isShipper ? (
        <p className="text-sm text-[rgb(var(--muted))]">Unable to determine role.</p>
      ) : null}

      {m.isShipper ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Post a shipment" subtitle="Add a new load to the marketplace" />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-[rgb(var(--muted))]">Origin</div>
                  <Input
                    placeholder="e.g. Bengaluru"
                    value={m.loadForm.origin}
                    onChange={(e) => m.setLoadForm((f) => ({ ...f, origin: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[rgb(var(--muted))]">Destination</div>
                  <Input
                    placeholder="e.g. Hyderabad"
                    value={m.loadForm.destination}
                    onChange={(e) => m.setLoadForm((f) => ({ ...f, destination: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-[rgb(var(--muted))]">Weight (kg)</div>
                  <Input
                    placeholder="950"
                    value={m.loadForm.weightKg}
                    onChange={(e) => m.setLoadForm((f) => ({ ...f, weightKg: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => m.onCreateLoad()}
                    isLoading={m.createLoading}
                  >
                    Post shipment
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bids on selected shipment" subtitle="Review offers on the shipment you selected" />
            <CardBody>
              <p className="text-sm text-[rgb(var(--muted))]">
                The first shipment in <strong>Your shipments</strong> is selected automatically. Click
                another row to switch. Pending bids appear in the <strong>Bids</strong> panel below — accept
                one there.
              </p>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {m.isCarrier ? (
        <Card>
          <CardHeader title="Place a bid" subtitle="Offer your price on the selected shipment" />
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Amount (₹)</div>
                <Input
                  placeholder="39900"
                  value={m.bidAmount}
                  onChange={(e) => m.setBidAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => m.onCreateBid()}
                  isLoading={m.placeBidLoading}
                  disabled={m.selectedShipmentId == null}
                >
                  Place bid
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {m.isCarrier && m.myBids.data.length > 0 ? (
        <Card>
          <CardHeader title="My bids" subtitle="Bids you have already submitted" />
          <CardBody>
            <div className="space-y-2">
              {m.myBids.data.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[rgb(var(--border))] p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">Shipment #{b.shipmentId}</span>
                    <Badge tone={bidTone(b.status)}>{b.status}</Badge>
                  </div>
                  <div className="mt-1 text-[rgb(var(--muted))]">
                    ₹{Number(b.amount).toLocaleString()} • {new Date(b.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Card>
          <CardHeader
            title={m.isCarrier ? 'Open shipments' : 'Your shipments'}
            subtitle={
              m.isCarrier ? 'Shipments open for bidding' : 'Shipments you have posted'
            }
            right={
              <Button size="sm" variant="secondary" onClick={() => m.refreshBoard()} isLoading={m.boardLoading}>
                Refresh
              </Button>
            }
          />
          <CardBody>
            {m.boardError ? (
              <div className="mb-3 text-sm text-rose-600 dark:text-rose-300">{m.boardError}</div>
            ) : null}
            <Table>
              <THead>
                <tr>
                  <TH>ID</TH>
                  <TH>Route</TH>
                  <TH>Weight</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {m.boardRows.map((row) => {
                  const active = row.id === m.selectedShipmentId
                  return (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      aria-selected={active}
                      className={[
                        'cursor-pointer',
                        active
                          ? 'bg-[rgb(var(--primary-2))]/10 ring-2 ring-inset ring-[rgb(var(--primary-2))]/40'
                          : 'hover:bg-black/5 dark:hover:bg-white/5',
                      ].join(' ')}
                      onClick={() => m.setSelectedShipmentId(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          m.setSelectedShipmentId(row.id)
                        }
                      }}
                    >
                      <TD className="font-medium">{row.id}</TD>
                      <TD className="text-[rgb(var(--muted))]">
                        {row.origin} → {row.destination}
                      </TD>
                      <TD>{row.weightKg} kg</TD>
                      <TD>
                        <ShipmentStatusBadge status={row.status} />
                      </TD>
                    </tr>
                  )
                })}
                {m.boardLoading ? (
                  <tr>
                    <TD colSpan={4} className="text-[rgb(var(--muted))]">
                      Loading…
                    </TD>
                  </tr>
                ) : null}
                {!m.boardLoading && m.boardRows.length === 0 ? (
                  <tr>
                    <TD colSpan={4} className="text-[rgb(var(--muted))]">
                      No rows.
                    </TD>
                  </tr>
                ) : null}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        {m.isShipper ? (
          <Card>
            <CardHeader
              title="Bids"
              subtitle={
                m.selectedShipmentId != null ? `Shipment #${m.selectedShipmentId}` : 'Select a shipment'
              }
              right={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => m.refreshBids()}
                  isLoading={m.bidsState.loading}
                  disabled={m.selectedShipmentId == null}
                >
                  Refresh
                </Button>
              }
            />
            <CardBody>
              {m.selectedShipmentId == null ? (
                <div className="text-sm text-[rgb(var(--muted))]">Select a shipment to load bids.</div>
              ) : m.bidsState.loading ? (
                <div className="text-sm text-[rgb(var(--muted))]">Loading bids…</div>
              ) : (
                <div className="space-y-2">
                  {m.bidsState.data.map((b) => (
                    <div key={b.id} className="rounded-2xl border border-[rgb(var(--border))] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">Carrier #{b.carrierId}</div>
                          <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                            Bid {b.id} • {new Date(b.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge tone={bidTone(b.status)}>{b.status}</Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        Amount:{' '}
                        <span className="font-semibold">₹{Number(b.amount).toLocaleString()}</span>
                      </div>
                      {b.status === 'PENDING' ? (
                        <Button
                          className="mt-3 w-full"
                          size="sm"
                          variant="primary"
                          isLoading={m.acceptLoading}
                          onClick={() => m.onAcceptBid(b.id)}
                        >
                          Accept bid
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  {m.bidsState.data.length === 0 ? (
                    <div className="text-sm text-[rgb(var(--muted))]">No bids yet.</div>
                  ) : null}
                </div>
              )}
              {m.bidsState.error ? (
                <div className="mt-2 text-sm text-rose-600 dark:text-rose-300">{m.bidsState.error}</div>
              ) : null}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Hint" />
            <CardBody>
              <p className="text-sm text-[rgb(var(--muted))]">
                Select an open shipment on the left, enter an amount, and place a bid.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
