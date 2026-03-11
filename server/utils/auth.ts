import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

export function getJwtSecret(): string {
  const config = useRuntimeConfig()
  return config.jwtSecret as string
}

export function signToken(payload: object): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' })
}

export function verifyToken(token: string): any {
  return jwt.verify(token, getJwtSecret())
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromEvent(event: H3Event): string | null {
  const cookie = getCookie(event, 'auth_token')
  if (cookie) return cookie
  const auth = getHeader(event, 'authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export function requireAuth(event: H3Event) {
  const token = getTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, message: 'Требуется авторизация' })
  try {
    return verifyToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Недействительный токен' })
  }
}

export function requireRole(event: H3Event, roles: string[]) {
  const user = requireAuth(event)
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Недостаточно прав доступа' })
  }
  return user
}

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  DRIVER: 'DRIVER',
} as const

export const MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
export const DISPATCH_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DISPATCHER]
export const ALL_ROLES = Object.values(ROLES)
