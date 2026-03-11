import { prisma } from '~/server/utils/prisma'
import { requireRole, ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, [ROLES.SUPER_ADMIN])
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { name, phone, role, isActive } = body
  const user = await prisma.user.update({
    where: { id },
    data: { name, phone, role, isActive },
    select: { id: true, email: true, role: true, name: true, phone: true, isActive: true }
  })
  return user
})
