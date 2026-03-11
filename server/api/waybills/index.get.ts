import { prisma } from '~/server/utils/prisma'
import { requireAuth, ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  const where: any = {}
  if (query.status) where.status = query.status
  if (query.carId) where.carId = query.carId
  if (query.driverId) where.driverId = query.driverId
  if (query.dateFrom || query.dateTo) {
    where.date = {}
    if (query.dateFrom) where.date.gte = new Date(query.dateFrom as string)
    if (query.dateTo) where.date.lte = new Date(query.dateTo as string)
  }

  // Drivers see only their own waybills
  if (user.role === ROLES.DRIVER) {
    const driver = await prisma.driver.findFirst({ where: { userId: user.id } })
    if (driver) where.driverId = driver.id
    else return []
  }

  const waybills = await prisma.waybill.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      car: { select: { brand: true, model: true, plateNumber: true } },
      driver: { select: { name: true } },
      createdBy: { select: { name: true } },
    }
  })
  return waybills
})
