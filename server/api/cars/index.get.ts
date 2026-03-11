import { prisma } from '~/server/utils/prisma'
import { requireAuth, DISPATCH_ROLES } from '~/server/utils/auth'
import { checkMaintenanceAlerts } from '~/server/utils/maintenance'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)
  const status = query.status as string | undefined

  const cars = await prisma.car.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return cars.map(car => ({
    ...car,
    maintenanceAlerts: checkMaintenanceAlerts(car),
  }))
})
