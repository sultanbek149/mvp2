import { prisma } from '~/server/utils/prisma'
import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { brand, model, plateNumber, year, fuelType, tankCapacity, fuelBalance, totalMileage, status, notes } = body

  const car = await prisma.car.update({
    where: { id },
    data: { brand, model, plateNumber, year, fuelType, tankCapacity, fuelBalance, totalMileage, status, notes },
  })
  return car
})
