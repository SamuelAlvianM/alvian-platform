import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '../../utils/password'
import { getAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const username = getAuthUser(event)
  if (!username) throw createError({ statusCode: 401, message: 'Belum login' })

  const { currentPassword, newPassword } = await readBody(event)
  if (!newPassword || newPassword.length < 6) throw createError({ statusCode: 400, message: 'Password baru minimal 6 karakter' })

  const db = useDB()
  const [user] = await db.select().from(users).where(eq(users.username, username))
  if (!user) throw createError({ statusCode: 404, message: 'User tidak ditemukan' })

  // Kalau bukan first-time change, verifikasi password lama
  if (!user.mustChangePassword && currentPassword) {
    if (!verifyPassword(currentPassword, user.password)) {
      throw createError({ statusCode: 401, message: 'Password lama salah' })
    }
  }

  await db.update(users).set({
    password: hashPassword(newPassword),
    mustChangePassword: 0,
  }).where(eq(users.username, username))

  return { ok: true }
})
