import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const drivers = await prisma.driver.findMany({
    orderBy: { name: 'asc' },
    include: { user: { select: { email: true, role: true } } }
  })
  return drivers
})
