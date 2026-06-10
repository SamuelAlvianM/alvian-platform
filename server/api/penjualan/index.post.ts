import { useDB } from '../../db/index'
import { penjualan } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { resepId, klienId, pesanan, jumlah, hargaJual, tanggal, catatan } = body

  if (!resepId || !jumlah || hargaJual == null || !tanggal) {
    throw createError({ statusCode: 400, message: 'resepId, jumlah, hargaJual, dan tanggal wajib diisi' })
  }

  const db = useDB()
  const totalHarga = Number(hargaJual) * Number(jumlah)
  const pesananVal = pesanan ? Number(pesanan) : Number(jumlah)

  const [item] = await db.insert(penjualan).values({
    resepId: Number(resepId),
    klienId: klienId ? Number(klienId) : null,
    pesanan: pesananVal,
    jumlah: Number(jumlah),
    hargaJual: Number(hargaJual),
    totalHarga,
    tanggal,
    catatan: catatan ?? null,
  }).returning()

  return item
})
