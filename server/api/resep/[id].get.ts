import { useDB } from '../../db/index'
import { resep, resepBahan, bahanBaku } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDB()

  const [r] = await db.select().from(resep).where(eq(resep.id, id))
  if (!r) throw createError({ statusCode: 404, message: 'Resep tidak ditemukan' })

  const bahan = await db
    .select({
      id: resepBahan.id,
      bahanBakuId: resepBahan.bahanBakuId,
      jumlah: resepBahan.jumlah,
      namaBahan: bahanBaku.nama,
      satuan: bahanBaku.satuan,
      hargaPerSatuan: bahanBaku.hargaPerSatuan,
    })
    .from(resepBahan)
    .innerJoin(bahanBaku, eq(resepBahan.bahanBakuId, bahanBaku.id))
    .where(eq(resepBahan.resepId, id))

  const hpp = bahan.reduce((sum, b) => sum + b.jumlah * b.hargaPerSatuan, 0)
  const margin = r.hargaJual > 0 ? ((r.hargaJual - hpp) / r.hargaJual) * 100 : 0

  return { ...r, bahan, hpp, margin }
})
