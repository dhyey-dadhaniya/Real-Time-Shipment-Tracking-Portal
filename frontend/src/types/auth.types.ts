export type UserRole = 'SHIPPER' | 'CARRIER'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  name: string
  email: string
  password: string
  role: UserRole
}

/** Backend AuthResponse */
export interface AuthResponseDto {
  token: string
  email: string
  role: string
  userId: number
}

export interface StoredAuthUser {
  email: string
  role: UserRole
  userId: number
}

export type LoginResponse = AuthResponseDto & {
  accessToken?: string
  access_token?: string
  data?: Partial<AuthResponseDto>
}
