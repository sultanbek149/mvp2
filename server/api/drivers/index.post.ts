import { prisma } from '~/server/utils/prisma'
import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().default('B'),
  licenseExpiry: z.string(),
  name: z.string().min(1),
  phone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  const body = await readBody(event)
  const data = schema.parse(body)
  const driver = await prisma.driver.create({
    data: { ...data, licenseExpiry: new Date(data.licenseExpiry) }
  })
  return driver
})
