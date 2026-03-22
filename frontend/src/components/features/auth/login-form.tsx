import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface LoginFormProps {
  email: string
  password: string
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
}: LoginFormProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Sign in" subtitle="Use your shipper or carrier account" />
      <CardBody>
        <div className="space-y-3">
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
            <div className="mb-1 text-xs text-[rgb(var(--muted))]">Password</div>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </div>
          <Button variant="primary" className="w-full" isLoading={loading} onClick={onSubmit}>
            Sign in
          </Button>
          <p className="text-center text-sm text-[rgb(var(--muted))]">
            No account?{' '}
            <Link className="text-[rgb(var(--primary-2))] underline" to={ROUTES.REGISTER}>
              Register
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
