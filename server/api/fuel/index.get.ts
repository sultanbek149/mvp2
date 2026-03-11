import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event)
  const where: any = {}
  if (query.carId) where.carId = query.carId

  const ops = await prisma.fuelOperation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      car: { select: { brand: true, model: true, plateNumber: true } },
      operator: { select: { name: true } },
      waybill: { select: { number: true } },
    }
  })
  return ops
})
