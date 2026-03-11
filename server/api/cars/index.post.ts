import { prisma } from '~/server/utils/prisma'
import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  plateNumber: z.string().min(1),
  year: z.number().int().min(1990).max(2030),
  fuelType: z.enum(['DIESEL', 'GASOLINE', 'GAS', 'ELECTRIC']),
  tankCapacity: z.number().positive(),
  fuelBalance: z.number().min(0).default(0),
  totalMileage: z.number().int().min(0).default(0),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  const body = await readBody(event)
  const data = schema.parse(body)
  const car = await prisma.car.create({ data })
  return car
})
