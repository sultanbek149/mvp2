import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const wb = await prisma.waybill.findUnique({
    where: { id },
    include: {
      car: true,
      driver: true,
      createdBy: { select: { name: true, email: true } },
      fuelOps: { include: { operator: { select: { name: true } } } },
    }
  })
  if (!wb) throw createError({ statusCode: 404, message: 'Путевой лист не найден' })
  return wb
})
