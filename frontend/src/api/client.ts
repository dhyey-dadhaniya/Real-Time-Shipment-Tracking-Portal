/**
 * Axios instance: auth header, normalized errors, 401 → logout redirect.
 */
import axios, { type AxiosError } from 'axios'
import { config } from '@/config/env'
import { getAccessToken, removeAccessToken } from '@/utils/auth-utils'

const baseURL = config.apiUrl || undefined

function normalizeError(error: unknown): Error {
  const e = new Error('Something went wrong. Please try again.') as Error & {
    status?: number
    data?: unknown
  }
  const axiosError = error as AxiosError<{ message?: string; errors?: { msg?: string }[] }>

  if (axiosError.response) {
    const { data, status, statusText } = axiosError.response
    const responseData = data as
      | string
      | { message?: string; errors?: { msg?: string }[] | string[] }
      | undefined
    if (typeof responseData === 'string' && responseData.trim() !== '') {
      e.message = responseData
    } else if (responseData && typeof responseData === 'object') {
      if (typeof responseData.message === 'string') {
        e.message = responseData.message
      } else if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const first = responseData.errors[0]
        if (typeof first === 'string') e.message = first
        else if (first && typeof first.msg === 'string') e.message = first.msg
      }
    } else if (statusText) {
      e.message = statusText
    }
    e.status = status
    e.data = data
  } else if (axiosError.request) {
    e.message = 'Unable to reach the server. Please check your connection.'
  } else if (axiosError.message) {
    e.message = axiosError.message
  }
  return e
}

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  /** Match reference client (sikh-gurus-admin-panel-frontend 1) for cookie-backed APIs if needed. */
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((cfg) => {
  const token = getAccessToken()
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
    cfg.headers['access-token'] = token
  }
  return cfg
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String((error as AxiosError).config?.url ?? '')
    const isAuthRoute =
      reqUrl.includes('/api/auth/login') || reqUrl.includes('/api/auth/register')
    if (error.response?.status === 401 && !isAuthRoute) {
      removeAccessToken()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(normalizeError(error))
  },
)

export default apiClient
