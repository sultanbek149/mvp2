import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { checkMaintenanceAlerts } from '~/server/utils/maintenance'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event)

  if (query.alerts === 'true') {
    const cars = await prisma.car.findMany({ where: { status: 'ACTIVE' } })
    const result = cars
      .map(car => ({ car, alerts: checkMaintenanceAlerts(car) }))
      .filter(item => item.alerts.length > 0)
    return result
  }

  const where: any = {}
  if (query.carId) where.carId = query.carId

  const records = await prisma.maintenance.findMany({
    where,
    orderBy: { serviceDate: 'desc' },
    include: {
      car: { select: { brand: true, model: true, plateNumber: true } },
      performedBy: { select: { name: true } },
    }
  })
  return records
})
