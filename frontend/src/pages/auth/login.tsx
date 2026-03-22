import { LoginForm } from '@/components/features/auth'
import { useLoginPage } from '@/hooks/auth/useLoginPage'

/** Thin page + AuthLayout (reference: pages/auth/sign-in.tsx pattern). */
export default function LoginPage() {
  const { email, password, setEmail, setPassword, submit, loading } = useLoginPage()

  return (
    <LoginForm
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      loading={loading}
    />
  )
}
