import { useDB } from '../../db/index'
import { bahanBaku } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()

  const [item] = await db.delete(bahanBaku).where(eq(bahanBaku.id, id)).returning()
  if (!item) throw createError({ statusCode: 404, message: 'Bahan baku tidak ditemukan' })
  return { success: true }
})
