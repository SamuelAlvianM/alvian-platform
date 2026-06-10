import { useDB } from '../../db/index'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '../../utils/password'
import { signToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  if (!username || !password) throw createError({ statusCode: 400, message: 'Username dan password wajib diisi' })

  const db = useDB()
  const [user] = await db.select().from(users).where(eq(users.username, username))

  if (!user || !verifyPassword(password, user.password)) {
    throw createError({ statusCode: 401, message: 'Username atau password salah' })
  }

  const token = signToken(username)
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return { ok: true, username, mustChangePassword: user.mustChangePassword === 1 }
})
