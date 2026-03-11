import { prisma } from '~/server/utils/prisma'
import { requireRole, DISPATCH_ROLES } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  carId: z.string().uuid(),
  type: z.enum(['TO1', 'TO2', 'TO3', 'REPAIR', 'OTHER']),
  mileageAtService: z.number().int().positive(),
  nextServiceMileage: z.number().int().positive(),
  serviceDate: z.string(),
  cost: z.number().optional(),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireRole(event, DISPATCH_ROLES)
  const body = await readBody(event)
  const data = schema.parse(body)

  const record = await prisma.$transaction(async (tx) => {
    const m = await tx.maintenance.create({
      data: { ...data, serviceDate: new Date(data.serviceDate), performedById: user.id }
    })

    // Update car last TO mileage
    const updateData: any = {}
    if (data.type === 'TO1') updateData.lastTo1Mileage = data.mileageAtService
    if (data.type === 'TO2') updateData.lastTo2Mileage = data.mileageAtService
    if (data.type === 'TO3') updateData.lastTo3Mileage = data.mileageAtService
    if (Object.keys(updateData).length) {
      await tx.car.update({ where: { id: data.carId }, data: updateData })
    }
    return m
  })

  return record
})
