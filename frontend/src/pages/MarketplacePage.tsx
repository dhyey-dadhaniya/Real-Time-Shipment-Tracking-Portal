import { useEffect, useMemo, useState } from 'react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Table, TBody, TD, TH, THead } from '../components/ui/Table'
import { Badge } from '../components/ui/Badge'
import { useDataStore } from '../store/dataStore'
import type { Bid, Load } from '../models'

export function MarketplacePage() {
  const loads = useDataStore((s) => s.loads)
  const bidsByLoadId = useDataStore((s) => s.bidsByLoadId)
  const loadLoads = useDataStore((s) => s.loadLoads)
  const loadBidsForLoad = useDataStore((s) => s.loadBidsForLoad)
  const submitLoad = useDataStore((s) => s.submitLoad)
  const submitBid = useDataStore((s) => s.submitBid)

  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null)

  const [loadForm, setLoadForm] = useState({
    shipperName: 'Acme Ecom',
    originCity: '',
    destinationCity: '',
    weightKg: '',
  })

  const [bidForm, setBidForm] = useState({
    carrierId: 'CAR-1',
    carrierName: 'NorthStar Logistics',
    amount: '',
  })

  useEffect(() => {
    void loadLoads()
  }, [loadLoads])

  useEffect(() => {
    const first = loads.data[0]?.id
    if (!selectedLoadId && first) setSelectedLoadId(first)
  }, [loads.data, selectedLoadId])

  useEffect(() => {
    if (!selectedLoadId) return
    void loadBidsForLoad(selectedLoadId)
  }, [loadBidsForLoad, selectedLoadId])

  const selectedLoad = useMemo<Load | null>(() => {
    if (!selectedLoadId) return null
    return loads.data.find((l) => l.id === selectedLoadId) ?? null
  }, [loads.data, selectedLoadId])

  const bidsState = selectedLoadId ? bidsByLoadId[selectedLoadId] : undefined

  const onCreateLoad = async () => {
    await submitLoad({
      shipperName: loadForm.shipperName.trim(),
      originCity: loadForm.originCity.trim(),
      destinationCity: loadForm.destinationCity.trim(),
      weightKg: Number(loadForm.weightKg),
    })
    setLoadForm((f) => ({ ...f, originCity: '', destinationCity: '', weightKg: '' }))
  }

  const onCreateBid = async () => {
    if (!selectedLoadId) return
    await submitBid({
      loadId: selectedLoadId,
      carrierId: bidForm.carrierId,
      carrierName: bidForm.carrierName,
      amount: Number(bidForm.amount),
    })
    setBidForm((f) => ({ ...f, amount: '' }))
  }

  const bidTone = (b: Bid) => {
    if (b.status === 'ACCEPTED') return 'success' as const
    if (b.status === 'REJECTED') return 'danger' as const
    return 'neutral' as const
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <div className="text-xl font-semibold">Marketplace</div>
        <div className="mt-1 text-sm text-[rgb(var(--muted))]">
          Shipper posts loads, carriers bid (mocked API).
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Post a Load (Shipper)" subtitle="Creates a new load in the board" />
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Shipper</div>
                <Input
                  value={loadForm.shipperName}
                  onChange={(e) => setLoadForm((f) => ({ ...f, shipperName: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Origin City</div>
                <Input
                  placeholder="e.g., Bengaluru"
                  value={loadForm.originCity}
                  onChange={(e) => setLoadForm((f) => ({ ...f, originCity: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Destination City</div>
                <Input
                  placeholder="e.g., Hyderabad"
                  value={loadForm.destinationCity}
                  onChange={(e) => setLoadForm((f) => ({ ...f, destinationCity: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Weight (kg)</div>
                <Input
                  placeholder="e.g., 950"
                  value={loadForm.weightKg}
                  onChange={(e) => setLoadForm((f) => ({ ...f, weightKg: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => void onCreateLoad()}
                  isLoading={loads.loading}
                >
                  Post Load
                </Button>
              </div>
            </div>
            {loads.error ? (
              <div className="mt-3 text-sm text-rose-600 dark:text-rose-300">
                {loads.error}
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bid (Carrier)" subtitle="Place bid on the selected load" />
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Carrier Name</div>
                <Input
                  value={bidForm.carrierName}
                  onChange={(e) => setBidForm((f) => ({ ...f, carrierName: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Carrier ID</div>
                <Input
                  value={bidForm.carrierId}
                  onChange={(e) => setBidForm((f) => ({ ...f, carrierId: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-[rgb(var(--muted))]">Amount (₹)</div>
                <Input
                  placeholder="e.g., 39900"
                  value={bidForm.amount}
                  onChange={(e) => setBidForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => void onCreateBid()}
                  isLoading={!!(selectedLoadId && bidsState?.loading)}
                  disabled={!selectedLoadId}
                >
                  Place Bid
                </Button>
              </div>
            </div>
            {selectedLoadId && bidsState?.error ? (
              <div className="mt-3 text-sm text-rose-600 dark:text-rose-300">
                {bidsState.error}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        <Card>
          <CardHeader
            title="Load Board"
            subtitle="Select a load to see bids"
            right={
              <Button size="sm" variant="secondary" onClick={() => void loadLoads()} isLoading={loads.loading}>
                Refresh
              </Button>
            }
          />
          <CardBody>
            <Table>
              <THead>
                <tr>
                  <TH>Load</TH>
                  <TH>Route</TH>
                  <TH>Weight</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <TBody>
                {loads.data.map((l) => {
                  const active = l.id === selectedLoadId
                  return (
                    <tr
                      key={l.id}
                      className={[
                        'cursor-pointer',
                        active ? 'bg-[rgb(var(--primary-2))]/5' : 'hover:bg-black/5 dark:hover:bg-white/5',
                      ].join(' ')}
                      onClick={() => setSelectedLoadId(l.id)}
                    >
                      <TD className="font-medium">{l.id}</TD>
                      <TD className="text-[rgb(var(--muted))]">
                        {l.originCity} → {l.destinationCity}
                      </TD>
                      <TD>{l.weightKg} kg</TD>
                      <TD>
                        <Badge tone={l.status === 'OPEN' ? 'info' : 'success'}>{l.status}</Badge>
                      </TD>
                    </tr>
                  )
                })}
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Bids"
            subtitle={selectedLoad ? `For ${selectedLoad.id}` : 'Select a load'}
            right={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => selectedLoadId && void loadBidsForLoad(selectedLoadId)}
                isLoading={!!(selectedLoadId && bidsState?.loading)}
                disabled={!selectedLoadId}
              >
                Refresh
              </Button>
            }
          />
          <CardBody>
            {!selectedLoadId ? (
              <div className="text-sm text-[rgb(var(--muted))]">No load selected.</div>
            ) : bidsState?.loading ? (
              <div className="text-sm text-[rgb(var(--muted))]">Loading bids…</div>
            ) : (
              <div className="space-y-2">
                {(bidsState?.data ?? []).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-[rgb(var(--border))] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{b.carrierName}</div>
                        <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                          {b.id} • {new Date(b.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge tone={bidTone(b)}>{b.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      Bid Amount:{' '}
                      <span className="font-semibold">₹{b.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {(bidsState?.data?.length ?? 0) === 0 ? (
                  <div className="text-sm text-[rgb(var(--muted))]">
                    No bids yet.
                  </div>
                ) : null}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

