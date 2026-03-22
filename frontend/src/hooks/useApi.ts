/**
 * Single hook for API requests — pass API_ENDPOINTS.* and options.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface UseApiOptions<T = unknown> {
  method?: HttpMethod
  params?: Record<string, string | number | boolean>
  immediate?: boolean
  key?: unknown
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  showToastOnError?: boolean
  showToastOnSuccess?: boolean
  successMessage?: string
}

export interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (body?: unknown) => Promise<void>
  refetch: () => Promise<void>
}

export function useAPI<T = unknown>(
  endpoint: string | (() => string),
  options: UseApiOptions<T> = {},
): UseApiResult<T> {
  const {
    method = 'GET',
    params,
    immediate = method === 'GET',
    key,
    onSuccess,
    onError,
    showToastOnError = true,
    showToastOnSuccess = false,
    successMessage = 'Success',
  } = options

  const { toast } = useToast()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const paramsRef = useRef(params)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError
  paramsRef.current = params

  const resolveUrl = useCallback(() => {
    return typeof endpoint === 'function' ? endpoint() : endpoint
  }, [endpoint])

  const run = useCallback(
    async (body?: unknown) => {
      const url = resolveUrl()
      const currentParams = paramsRef.current
      setLoading(true)
      setError(null)
      try {
        let response
        if (method === 'GET') {
          response = await apiClient.get<T>(url, { params: currentParams })
        } else if (method === 'POST') {
          response = await apiClient.post<T>(url, body ?? {}, { params: currentParams })
        } else if (method === 'PUT') {
          response = await apiClient.put<T>(url, body ?? {}, { params: currentParams })
        } else if (method === 'PATCH') {
          response = await apiClient.patch<T>(url, body ?? {}, { params: currentParams })
        } else {
          response = await apiClient.delete<T>(url, { params: currentParams })
        }
        const result = response.data as T
        setData(result)
        onSuccessRef.current?.(result)
        if (showToastOnSuccess) {
          toast({ title: successMessage, variant: 'default' })
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        onErrorRef.current?.(e)
        if (showToastOnError) {
          toast({ title: e.message, variant: 'destructive' })
        }
      } finally {
        setLoading(false)
      }
    },
    [resolveUrl, method, showToastOnError, showToastOnSuccess, successMessage, toast],
  )

  const execute = useCallback((body?: unknown) => run(body), [run])
  const refetch = useCallback(() => run(undefined), [run])

  useEffect(() => {
    if (immediate && method === 'GET') {
      void run()
    }
  }, [immediate, method, run, key])

  return { data, loading, error, execute, refetch }
}
