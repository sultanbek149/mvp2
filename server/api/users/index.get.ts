import { prisma } from '~/server/utils/prisma'
import { requireRole, ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, [ROLES.SUPER_ADMIN])
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  })
  return users
})
