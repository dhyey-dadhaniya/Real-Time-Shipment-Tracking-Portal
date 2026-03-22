import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '@/api/endpoints'
import { useAuth } from '@/contexts/auth-context'
import { ROUTES } from '@/constants/routes'
import { useAPI } from '@/hooks/useApi'
import type { AuthResponseDto } from '@/types'

export function useLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD
  const { applyAuthResponse } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { execute, loading } = useAPI<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    immediate: false,
    showToastOnError: true,
    onSuccess: (data) => {
      applyAuthResponse(data)
      navigate(from, { replace: true })
    },
  })

  const submit = useCallback(() => {
    void execute({ email: email.trim(), password })
  }, [email, password, execute])

  return {
    email,
    password,
    setEmail,
    setPassword,
    submit,
    loading,
  }
}
