import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'

export function PublicTrackEntryPage() {
  const [id, setId] = useState('')
  const navigate = useNavigate()

  function submit() {
    const t = id.trim()
    if (!t) return
    navigate(`${ROUTES.PUBLIC_TRACK}/${encodeURIComponent(t)}`, { replace: false })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--surface-1))] px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Track a shipment"
          subtitle="Enter the tracking ID you received (for example TRK-…). No account required."
        />
        <CardBody>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-[rgb(var(--muted))]">Tracking ID</div>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="TRK-..."
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <Button variant="primary" className="w-full" onClick={submit} disabled={!id.trim()}>
              View on map
            </Button>
            <p className="text-center text-sm text-[rgb(var(--muted))]">
              Carrier or shipper?{' '}
              <Link className="text-[rgb(var(--primary-2))] underline" to={ROUTES.LOGIN}>
                Sign in
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
