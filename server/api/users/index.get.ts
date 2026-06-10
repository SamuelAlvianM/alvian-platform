import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDB()
  const list = await db.select({
    id: users.id,
    username: users.username,
    isAdmin: users.isAdmin,
    mustChangePassword: users.mustChangePassword,
    createdAt: users.createdAt,
  }).from(users).orderBy(asc(users.createdAt))
  return list
})
