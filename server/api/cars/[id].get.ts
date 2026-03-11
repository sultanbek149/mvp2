import { prisma } from '~/server/utils/prisma'
import { requireAuth, requireRole, MANAGE_ROLES } from '~/server/utils/auth'
import { checkMaintenanceAlerts } from '~/server/utils/maintenance'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      waybills: { orderBy: { date: 'desc' }, take: 10, include: { driver: true } },
      maintenance: { orderBy: { serviceDate: 'desc' }, take: 5 },
    }
  })
  if (!car) throw createError({ statusCode: 404, message: 'Автомобиль не найден' })

  return { ...car, maintenanceAlerts: checkMaintenanceAlerts(car) }
})
