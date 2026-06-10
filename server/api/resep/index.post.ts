import { useDB } from '../../db/index'
import { resep, resepBahan } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nama, kategori, deskripsi, hargaJual, gambar, bahan } = body

  if (!nama || hargaJual == null) {
    throw createError({ statusCode: 400, message: 'nama dan hargaJual wajib diisi' })
  }

  const db = useDB()

  const [newResep] = await db.insert(resep).values({
    nama,
    kategori: kategori ?? 'kue',
    deskripsi: deskripsi ?? null,
    gambar: gambar ?? null,
    hargaJual: Number(hargaJual),
  }).returning()

  if (bahan && Array.isArray(bahan) && bahan.length > 0) {
    await db.insert(resepBahan).values(
      bahan.map((b: { bahanBakuId: number; jumlah: number }) => ({
        resepId: newResep.id,
        bahanBakuId: Number(b.bahanBakuId),
        jumlah: Number(b.jumlah),
      }))
    )
  }

  return newResep
})
