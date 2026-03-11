import { prisma } from '~/server/utils/prisma'
import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { licenseNumber, licenseCategory, licenseExpiry, name, phone, isActive } = body
  const driver = await prisma.driver.update({
    where: { id },
    data: { licenseNumber, licenseCategory, licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined, name, phone, isActive },
  })
  return driver
})
