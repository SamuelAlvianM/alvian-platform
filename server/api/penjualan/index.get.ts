import { useDB } from '../../db/index'
import { penjualan, resep, klien } from '../../db/schema'
import { eq, desc, gte, lte, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDB()

  const conditions = []
  if (query.dari) conditions.push(gte(penjualan.tanggal, String(query.dari)))
  if (query.sampai) conditions.push(lte(penjualan.tanggal, String(query.sampai)))
  if (query.klienId) conditions.push(eq(penjualan.klienId, Number(query.klienId)))

  const data = await db
    .select({
      id: penjualan.id,
      resepId: penjualan.resepId,
      namaResep: resep.nama,
      kategoriResep: resep.kategori,
      klienId: penjualan.klienId,
      namaKlien: klien.nama,
      pesanan: penjualan.pesanan,
      jumlah: penjualan.jumlah,
      hargaJual: penjualan.hargaJual,
      totalHarga: penjualan.totalHarga,
      tanggal: penjualan.tanggal,
      catatan: penjualan.catatan,
      createdAt: penjualan.createdAt,
    })
    .from(penjualan)
    .innerJoin(resep, eq(penjualan.resepId, resep.id))
    .leftJoin(klien, eq(penjualan.klienId, klien.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(penjualan.tanggal), desc(penjualan.createdAt))

  return data
})
