import { prisma } from '~/server/utils/prisma'
import { requireRole, ROLES, hashPassword } from '~/server/utils/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER']),
  name: z.string().min(1),
  phone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  requireRole(event, [ROLES.SUPER_ADMIN])
  const body = await readBody(event)
  const data = schema.parse(body)
  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: { email: data.email.toLowerCase(), passwordHash, role: data.role, name: data.name, phone: data.phone },
    select: { id: true, email: true, role: true, name: true, phone: true, isActive: true }
  })
  return user
})
