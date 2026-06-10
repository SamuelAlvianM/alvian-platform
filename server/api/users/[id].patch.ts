import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { hashPassword } from '../../utils/password'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const { newPassword } = await readBody(event)
  if (!newPassword || newPassword.length < 6)
    throw createError({ statusCode: 400, message: 'Password minimal 6 karakter' })

  const db = useDB()
  const [updated] = await db
    .update(users)
    .set({ password: hashPassword(newPassword), mustChangePassword: 1 })
    .where(eq(users.id, id))
    .returning({ id: users.id, username: users.username })

  if (!updated) throw createError({ statusCode: 404, message: 'User tidak ditemukan' })
  return { ok: true, username: updated.username }
})
