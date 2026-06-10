import { createHmac } from 'node:crypto'
import type { H3Event } from 'h3'
import { useDB } from '../db/index'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

const SECRET = () => process.env.AUTH_SECRET ?? 'alvian-kitchen-secret-2024'

export function signToken(username: string): string {
  const payload = `${username}.${Date.now()}`
  const sig = createHmac('sha256', SECRET()).update(payload).digest('hex')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastDot = decoded.lastIndexOf('.')
    if (lastDot === -1) return null
    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)
    const expected = createHmac('sha256', SECRET()).update(payload).digest('hex')
    if (sig !== expected) return null
    return payload.split('.')[0]
  } catch { return null }
}

export function getAuthUser(event: H3Event): string | null {
  const token = getCookie(event, 'auth_token')
  if (!token) return null
  return verifyToken(token)
}

export async function getAuthUserFull(event: H3Event) {
  const username = getAuthUser(event)
  if (!username) return null
  const db = useDB()
  const [user] = await db.select().from(users).where(eq(users.username, username))
  return user ?? null
}

export async function requireAdmin(event: H3Event) {
  const user = await getAuthUserFull(event)
  if (!user || !user.isAdmin) throw createError({ statusCode: 403, message: 'Akses ditolak' })
  return user
}
