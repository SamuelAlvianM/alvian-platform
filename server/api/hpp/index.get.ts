import { useDB } from '../../db/index'
import { resep, resepBahan, bahanBaku } from '../../db/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()

  const resepList = await db.select().from(resep).orderBy(asc(resep.nama))

  const result = await Promise.all(resepList.map(async (r) => {
    const bahan = await db
      .select({
        id: resepBahan.id,
        namaBahan: bahanBaku.nama,
        satuan: bahanBaku.satuan,
        hargaPerSatuan: bahanBaku.hargaPerSatuan,
        jumlah: resepBahan.jumlah,
      })
      .from(resepBahan)
      .innerJoin(bahanBaku, eq(resepBahan.bahanBakuId, bahanBaku.id))
      .where(eq(resepBahan.resepId, r.id))

    const hpp = bahan.reduce((sum, b) => sum + b.jumlah * b.hargaPerSatuan, 0)
    const margin = r.hargaJual > 0 ? ((r.hargaJual - hpp) / r.hargaJual) * 100 : 0
    const keuntungan = r.hargaJual - hpp

    return {
      id: r.id,
      nama: r.nama,
      hargaJual: r.hargaJual,
      hpp,
      keuntungan,
      margin,
      bahan: bahan.map(b => ({
        ...b,
        subtotal: b.jumlah * b.hargaPerSatuan,
      })),
    }
  }))

  return result
})
