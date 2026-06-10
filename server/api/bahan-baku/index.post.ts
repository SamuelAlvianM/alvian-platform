import { useDB } from '../../db/index'
import { bahanBaku } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nama, satuan, hargaPerSatuan, stok } = body

  if (!nama || !satuan || hargaPerSatuan == null) {
    throw createError({ statusCode: 400, message: 'nama, satuan, dan hargaPerSatuan wajib diisi' })
  }

  const db = useDB()
  const [item] = await db.insert(bahanBaku).values({
    nama,
    satuan,
    hargaPerSatuan: Number(hargaPerSatuan),
    stok: Number(stok ?? 0),
  }).returning()

  return item
})
