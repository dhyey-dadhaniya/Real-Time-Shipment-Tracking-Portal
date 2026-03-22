import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAuth } from '@/contexts/auth-context'
import { ROUTES } from '@/constants/routes'
import { useAPI } from '@/hooks/useApi'
import type { AuthResponseDto, UserRole } from '@/types'

export function useRegisterPage() {
  const navigate = useNavigate()
  const { applyAuthResponse } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('SHIPPER')

  const { execute, loading } = useAPI<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    immediate: false,
    showToastOnError: true,
    onSuccess: (data) => {
      applyAuthResponse(data)
      navigate(ROUTES.DASHBOARD, { replace: true })
    },
  })

  const submit = useCallback(() => {
    void execute({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    })
  }, [email, execute, name, password, role])

  return {
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
  }
}
