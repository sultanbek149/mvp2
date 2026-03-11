import { prisma } from '~/server/utils/prisma'
import { requireRole, DISPATCH_ROLES } from '~/server/utils/auth'
import { checkMaintenanceAlerts } from '~/server/utils/maintenance'
import { z } from 'zod'

const schema = z.object({
  endMileage: z.number().int().positive(),
  fuelEnd: z.number().min(0),
})

export default defineEventHandler(async (event) => {
  const user = requireRole(event, DISPATCH_ROLES)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { endMileage, fuelEnd } = schema.parse(body)

  const wb = await prisma.waybill.findUnique({ where: { id }, include: { car: true } })
  if (!wb) throw createError({ statusCode: 404, message: 'Путевой лист не найден' })
  if (wb.status !== 'ACTIVE') throw createError({ statusCode: 400, message: 'Нельзя закрыть: статус не ACTIVE' })

  if (endMileage < wb.startMileage) throw createError({ statusCode: 400, message: 'Конечный пробег не может быть меньше начального' })

  const totalFuel = wb.fuelStart + wb.fuelAdded
  if (fuelEnd > totalFuel) throw createError({ statusCode: 400, message: `Остаток не может быть больше ${totalFuel} л` })

  const fuelConsumed = totalFuel - fuelEnd
  const newMileage = endMileage

  const result = await prisma.$transaction(async (tx) => {
    const closed = await tx.waybill.update({
      where: { id },
      data: { endMileage, fuelEnd, fuelConsumed, status: 'CLOSED' }
    })

    // Update car
    const updatedCar = await tx.car.update({
      where: { id: wb.carId },
      data: { fuelBalance: fuelEnd, totalMileage: newMileage }
    })

    // Fuel consumption record
    await tx.fuelOperation.create({
      data: {
        carId: wb.carId,
        waybillId: id,
        type: 'CONSUMPTION',
        amount: fuelConsumed,
        balanceBefore: totalFuel,
        balanceAfter: fuelEnd,
        operatorId: user.id,
      }
    })

    const alerts = checkMaintenanceAlerts(updatedCar)
    return { waybill: closed, maintenanceAlerts: alerts }
  })

  return result
})
