import { useDB } from '../../db/index'
import { klien } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()
  await db.delete(klien).where(eq(klien.id, id))
  return { ok: true }
})
