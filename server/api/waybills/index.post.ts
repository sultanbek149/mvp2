import { prisma } from '~/server/utils/prisma'
import { requireRole, DISPATCH_ROLES } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  carId: z.string().uuid(),
  driverId: z.string().uuid(),
  date: z.string(),
  fuelAdded: z.number().min(0).default(0),
  routeStart: z.string().optional(),
  routeEnd: z.string().optional(),
  startLat: z.number().optional(),
  startLng: z.number().optional(),
  endLat: z.number().optional(),
  endLng: z.number().optional(),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireRole(event, DISPATCH_ROLES)
  const body = await readBody(event)
  const data = schema.parse(body)

  const car = await prisma.car.findUnique({ where: { id: data.carId } })
  if (!car) throw createError({ statusCode: 404, message: 'Автомобиль не найден' })
  if (car.status !== 'ACTIVE') throw createError({ statusCode: 400, message: 'Автомобиль не активен' })

  // Auto-fill from car state
  const fuelStart = car.fuelBalance
  const startMileage = car.totalMileage

  // Validate fuel
  if (data.fuelAdded + fuelStart > car.tankCapacity) {
    throw createError({ statusCode: 400, message: `Превышен объём бака (${car.tankCapacity} л)` })
  }

  // Generate number
  const count = await prisma.waybill.count()
  const number = `ПЛ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

  const waybill = await prisma.$transaction(async (tx) => {
    const wb = await tx.waybill.create({
      data: {
        number,
        carId: data.carId,
        driverId: data.driverId,
        createdById: user.id,
        date: new Date(data.date),
        startMileage,
        fuelStart,
        fuelAdded: data.fuelAdded,
        routeStart: data.routeStart,
        routeEnd: data.routeEnd,
        startLat: data.startLat,
        startLng: data.startLng,
        endLat: data.endLat,
        endLng: data.endLng,
        notes: data.notes,
        status: 'ACTIVE',
      }
    })

    // Update car fuel if refueled
    if (data.fuelAdded > 0) {
      await tx.car.update({
        where: { id: data.carId },
        data: { fuelBalance: fuelStart + data.fuelAdded }
      })
      await tx.fuelOperation.create({
        data: {
          carId: data.carId,
          waybillId: wb.id,
          type: 'REFUEL',
          amount: data.fuelAdded,
          balanceBefore: fuelStart,
          balanceAfter: fuelStart + data.fuelAdded,
          operatorId: user.id,
        }
      })
    }

    return wb
  })

  return waybill
})
