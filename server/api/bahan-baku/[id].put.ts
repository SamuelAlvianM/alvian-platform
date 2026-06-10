import { useDB } from '../../db/index'
import { bahanBaku } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { nama, satuan, hargaPerSatuan, stok } = body

  if (!nama || !satuan || hargaPerSatuan == null) {
    throw createError({ statusCode: 400, message: 'nama, satuan, dan hargaPerSatuan wajib diisi' })
  }

  const db = useDB()
  const [item] = await db.update(bahanBaku)
    .set({ nama, satuan, hargaPerSatuan: Number(hargaPerSatuan), stok: Number(stok ?? 0), updatedAt: new Date() })
    .where(eq(bahanBaku.id, id))
    .returning()

  if (!item) throw createError({ statusCode: 404, message: 'Bahan baku tidak ditemukan' })
  return item
})
