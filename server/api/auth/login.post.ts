import { prisma } from '~/server/utils/prisma'
import { comparePassword, signToken } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Неверные данные' })

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !user.isActive) throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return {
    user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone }
  }
})
