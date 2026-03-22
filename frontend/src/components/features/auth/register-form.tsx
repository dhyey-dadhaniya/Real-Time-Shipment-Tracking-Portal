import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import type { UserRole } from '@/types'

interface RegisterFormProps {
  name: string
  email: string
  password: string
  role: UserRole
  onNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onRoleChange: (v: UserRole) => void
  onSubmit: () => void
  loading: boolean
}

export function RegisterForm({
  name,
  email,
  password,
  role,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
  loading,
}: RegisterFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Create account" subtitle="Choose shipper or carrier role" />
      <CardBody>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-[rgb(var(--muted))]">Name</div>
            <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
          </div>
          <div>
            <div className="mb-1 text-xs text-[rgb(var(--muted))]">Email</div>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-[rgb(var(--muted))]">Password (min 6)</div>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-[rgb(var(--muted))]">Role</div>
            <select
              className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-sm focus-ring"
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
            >
              <option value="SHIPPER">Shipper</option>
              <option value="CARRIER">Carrier</option>
            </select>
          </div>
          <Button variant="primary" className="w-full" isLoading={loading} onClick={onSubmit}>
            Register
          </Button>
          <p className="text-center text-sm text-[rgb(var(--muted))]">
            Already have an account?{' '}
            <Link className="text-[rgb(var(--primary-2))] underline" to={ROUTES.LOGIN}>
              Sign in
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
