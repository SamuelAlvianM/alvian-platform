import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (admin.id === id) throw createError({ statusCode: 400, message: 'Tidak bisa hapus akun sendiri' })

  const db = useDB()
  await db.delete(users).where(and(eq(users.id, id), ne(users.isAdmin, 1)))
  return { ok: true }
})
