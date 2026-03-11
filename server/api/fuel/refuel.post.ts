import { prisma } from '~/server/utils/prisma'
import { requireRole, DISPATCH_ROLES } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  carId: z.string().uuid(),
  amount: z.number().positive(),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireRole(event, DISPATCH_ROLES)
  const body = await readBody(event)
  const { carId, amount, notes } = schema.parse(body)

  const car = await prisma.car.findUnique({ where: { id: carId } })
  if (!car) throw createError({ statusCode: 404, message: 'Автомобиль не найден' })
  if (car.fuelBalance + amount > car.tankCapacity) {
    throw createError({ statusCode: 400, message: `Превышен объём бака (${car.tankCapacity} л). Макс. заправка: ${(car.tankCapacity - car.fuelBalance).toFixed(1)} л` })
  }

  const newBalance = car.fuelBalance + amount
  await prisma.$transaction([
    prisma.car.update({ where: { id: carId }, data: { fuelBalance: newBalance } }),
    prisma.fuelOperation.create({
      data: { carId, type: 'REFUEL', amount, balanceBefore: car.fuelBalance, balanceAfter: newBalance, operatorId: user.id, notes }
    }),
  ])

  return { balance: newBalance }
})
