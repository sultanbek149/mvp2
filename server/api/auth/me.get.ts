import { requireAuth } from '~/server/utils/auth'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event)
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, name: true, phone: true, isActive: true }
  })
  if (!user || !user.isActive) throw createError({ statusCode: 401, message: 'Пользователь не найден' })
  return { user }
})
