import { useDB } from '../../db/index'
import { resep, resepBahan } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { nama, kategori, deskripsi, hargaJual, gambar, bahan } = body

  if (!nama || hargaJual == null) {
    throw createError({ statusCode: 400, message: 'nama dan hargaJual wajib diisi' })
  }

  const db = useDB()

  const [updated] = await db.update(resep)
    .set({
      nama,
      kategori: kategori ?? 'kue',
      deskripsi: deskripsi ?? null,
      gambar: gambar ?? null,
      hargaJual: Number(hargaJual),
      updatedAt: new Date(),
    })
    .where(eq(resep.id, id))
    .returning()

  if (!updated) throw createError({ statusCode: 404, message: 'Resep tidak ditemukan' })

  await db.delete(resepBahan).where(eq(resepBahan.resepId, id))

  if (bahan && Array.isArray(bahan) && bahan.length > 0) {
    await db.insert(resepBahan).values(
      bahan.map((b: { bahanBakuId: number; jumlah: number }) => ({
        resepId: id,
        bahanBakuId: Number(b.bahanBakuId),
        jumlah: Number(b.jumlah),
      }))
    )
  }

  return updated
})
