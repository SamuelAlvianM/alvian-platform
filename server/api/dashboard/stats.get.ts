import { useDB } from '../../db/index'
import { bahanBaku, resep, penjualan } from '../../db/schema'
import { count, sum, gte, and, lte, lt, eq, desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const bulanIni = `${y}-${String(m).padStart(2, '0')}-01`
  const nextM = m === 12 ? 1 : m + 1
  const nextY = m === 12 ? y + 1 : y
  const bulanDepan = `${nextY}-${String(nextM).padStart(2, '0')}-01`

  const [totalBahan] = await db.select({ count: count() }).from(bahanBaku)
  const [totalResep] = await db.select({ count: count() }).from(resep)

  const [penjualanBulanIni] = await db
    .select({ count: count(), total: sum(penjualan.totalHarga) })
    .from(penjualan)
    .where(and(gte(penjualan.tanggal, bulanIni), lt(penjualan.tanggal, bulanDepan)))

  const recentPenjualan = await db
    .select({
      id: penjualan.id,
      tanggal: penjualan.tanggal,
      totalHarga: penjualan.totalHarga,
      jumlah: penjualan.jumlah,
    })
    .from(penjualan)
    .orderBy(desc(penjualan.createdAt))
    .limit(5)

  // Count per kategori
  const kategoriList = ['kue', 'masakan', 'minuman', 'snack', 'lainnya']
  const menuPerKategori: Record<string, number> = {}
  for (const k of kategoriList) {
    const [res] = await db.select({ count: count() }).from(resep).where(eq(resep.kategori, k))
    menuPerKategori[k] = res.count
  }

  return {
    totalBahan: totalBahan.count,
    totalResep: totalResep.count,
    penjualanBulanIni: penjualanBulanIni.count,
    pemasukanBulanIni: Number(penjualanBulanIni.total ?? 0),
    recentPenjualan,
    menuPerKategori,
  }
})
