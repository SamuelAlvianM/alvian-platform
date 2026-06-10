import { useDB } from '../../db/index'
import { resep } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()

  const [item] = await db.delete(resep).where(eq(resep.id, id)).returning()
  if (!item) throw createError({ statusCode: 404, message: 'Resep tidak ditemukan' })
  return { success: true }
})
