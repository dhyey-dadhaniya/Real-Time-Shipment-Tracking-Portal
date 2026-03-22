import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getAccessToken,
  getStoredAuthUser,
  logout as clearAuth,
  setAccessToken,
  setStoredAuthUser,
  authUserFromResponse,
} from '@/utils/auth-utils'
import type { AuthResponseDto, StoredAuthUser, UserRole } from '@/types'

interface AuthContextValue {
  user: StoredAuthUser | null
  token: string | null
  isAuthenticated: boolean
  /** Call after successful login/register */
  applyAuthResponse: (res: AuthResponseDto) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getAccessToken())
  const [user, setUser] = useState<StoredAuthUser | null>(() => getStoredAuthUser())

  const applyAuthResponse = useCallback((res: AuthResponseDto) => {
    setAccessToken(res.token)
    const u = authUserFromResponse(res)
    setStoredAuthUser(u)
    setTokenState(res.token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setTokenState(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: UserRole) => {
      return user?.role === role
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      applyAuthResponse,
      logout,
      hasRole,
    }),
    [user, token, applyAuthResponse, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
