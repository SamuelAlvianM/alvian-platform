import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { requireAdmin } from '../../utils/auth'
import { hashPassword } from '../../utils/password'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { username, password } = await readBody(event)
  if (!username || !password) throw createError({ statusCode: 400, message: 'Username dan password wajib diisi' })
  if (password.length < 6) throw createError({ statusCode: 400, message: 'Password minimal 6 karakter' })

  const db = useDB()
  const existing = await db.select().from(users).where(eq(users.username, username))
  if (existing.length) throw createError({ statusCode: 409, message: 'Username sudah dipakai' })

  const [user] = await db.insert(users).values({
    username,
    password: hashPassword(password),
    isAdmin: 0,
    mustChangePassword: 1,
  }).returning({ id: users.id, username: users.username, mustChangePassword: users.mustChangePassword })

  return user
})
