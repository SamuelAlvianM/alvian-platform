import { useDB } from '../db/index'
import { users } from '../db/schema'
import { hashPassword } from '../utils/password'
import { eq } from 'drizzle-orm'

export default defineNitroPlugin(async () => {
  try {
    const db = useDB()
    const existing = await db.select().from(users).where(eq(users.username, 'samuel'))
    if (!existing.length) {
      await db.insert(users).values({
        username: 'samuel',
        password: hashPassword('12345678'),
        isAdmin: 1,
        mustChangePassword: 0,
      })
      console.log('[seed] User samuel dibuat')
    }
  } catch (e) {
    console.error('[seed] Error:', e)
  }
})
