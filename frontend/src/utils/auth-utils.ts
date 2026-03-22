import type { AuthResponseDto, LoginResponse, StoredAuthUser, UserRole } from '@/types'

export const ACCESS_TOKEN_KEY = 'accessToken'
export const AUTH_USER_KEY = 'authUser'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function logout(): void {
  removeAccessToken()
}

export function getStoredAuthUser(): StoredAuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    const u = JSON.parse(raw) as StoredAuthUser
    if (u?.email && u?.role && typeof u.userId === 'number') return u
    return null
  } catch {
    return null
  }
}

export function setStoredAuthUser(user: StoredAuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function extractTokenFromLoginResponse(data: LoginResponse): string | null {
  if (!data) return null
  return (
    data.token ??
    data.accessToken ??
    data.access_token ??
    data.data?.token ??
    null
  )
}

export function authUserFromResponse(res: AuthResponseDto): StoredAuthUser {
  const role = res.role === 'CARRIER' || res.role === 'SHIPPER' ? res.role : 'SHIPPER'
  return {
    email: res.email,
    role: role as UserRole,
    userId: res.userId,
  }
}
