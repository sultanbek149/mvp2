import { prisma } from '~/server/utils/prisma'
import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  const query = getQuery(event)
  const type = query.type as string || 'summary'

  const dateFrom = query.dateFrom ? new Date(query.dateFrom as string) : new Date(new Date().setMonth(new Date().getMonth() - 1))
  const dateTo = query.dateTo ? new Date(query.dateTo as string) : new Date()

  if (type === 'fuel') {
    const ops = await prisma.fuelOperation.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      include: {
        car: { select: { brand: true, model: true, plateNumber: true } },
        operator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    })
    return ops
  }

  if (type === 'mileage') {
    const waybills = await prisma.waybill.findMany({
      where: { status: 'CLOSED', date: { gte: dateFrom, lte: dateTo } },
      include: { car: { select: { brand: true, model: true, plateNumber: true } }, driver: { select: { name: true } } },
      orderBy: { date: 'desc' }
    })
    return waybills
  }

  // Summary
  const [totalCars, activeCars, totalWaybills, activeWaybills, fuelOpsToday] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: 'ACTIVE' } }),
    prisma.waybill.count(),
    prisma.waybill.count({ where: { status: 'ACTIVE' } }),
    prisma.fuelOperation.aggregate({
      where: { type: 'REFUEL', createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      _sum: { amount: true }
    }),
  ])

  return { totalCars, activeCars, totalWaybills, activeWaybills, fuelRefueledToday: fuelOpsToday._sum.amount || 0 }
})
