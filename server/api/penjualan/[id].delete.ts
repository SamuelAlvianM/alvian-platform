import { useDB } from '../../db/index'
import { penjualan } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()

  const [item] = await db.delete(penjualan).where(eq(penjualan.id, id)).returning()
  if (!item) throw createError({ statusCode: 404, message: 'Data penjualan tidak ditemukan' })
  return { success: true }
})
