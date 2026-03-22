import { RegisterForm } from '@/components/features/auth'
import { useRegisterPage } from '@/hooks/auth/useRegisterPage'

export default function RegisterPage() {
  const {
    name,
    email,
    password,
    role,
    setName,
    setEmail,
    setPassword,
    setRole,
    submit,
    loading,
  } = useRegisterPage()

  return (
    <RegisterForm
      name={name}
      email={email}
      password={password}
      role={role}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onRoleChange={setRole}
      onSubmit={submit}
      loading={loading}
    />
  )
}
