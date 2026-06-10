import { useDB } from '../../db/index'
import { penjualan, resep, klien, resepBahan, bahanBaku } from '../../db/schema'
import { eq, gte, lte, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDB()

  const conditions = []
  if (query.dari) conditions.push(gte(penjualan.tanggal, String(query.dari)))
  if (query.sampai) conditions.push(lte(penjualan.tanggal, String(query.sampai)))
  if (query.klienId) conditions.push(eq(penjualan.klienId, Number(query.klienId)))

  // Ambil semua data penjualan
  const rows = await db
    .select({
      penjualanId: penjualan.id,
      tanggal: penjualan.tanggal,
      klienId: penjualan.klienId,
      namaKlien: klien.nama,
      resepId: penjualan.resepId,
      namaResep: resep.nama,
      kategoriResep: resep.kategori,
      pesanan: penjualan.pesanan,
      jumlahTerjual: penjualan.jumlah,
      hargaJual: penjualan.hargaJual,
      totalHarga: penjualan.totalHarga,
      catatan: penjualan.catatan,
    })
    .from(penjualan)
    .innerJoin(resep, eq(penjualan.resepId, resep.id))
    .leftJoin(klien, eq(penjualan.klienId, klien.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(penjualan.tanggal, klien.nama, resep.nama)

  // Ambil HPP per resep (sum harga bahan)
  const hppRows = await db
    .select({
      resepId: resepBahan.resepId,
      hpp: sql<number>`sum(${resepBahan.jumlah} * ${bahanBaku.hargaPerSatuan})`,
    })
    .from(resepBahan)
    .innerJoin(bahanBaku, eq(resepBahan.bahanBakuId, bahanBaku.id))
    .groupBy(resepBahan.resepId)

  const hppMap: Record<number, number> = {}
  hppRows.forEach(r => { hppMap[r.resepId] = Number(r.hpp) || 0 })

  // Group by klien
  const klienMap: Record<string, any> = {}

  for (const row of rows) {
    const klienKey = row.klienId ? String(row.klienId) : 'umum'
    const namaKlien = row.namaKlien ?? 'Umum / Tanpa Klien'

    if (!klienMap[klienKey]) {
      klienMap[klienKey] = {
        klienId: row.klienId,
        namaKlien,
        produk: [],
        totalPesanan: 0,
        totalTerjual: 0,
        totalSisa: 0,
        totalPendapatan: 0,
        totalHPP: 0,
        totalLabaBersih: 0,
      }
    }

    const hppPerUnit = hppMap[row.resepId] ?? 0
    const sisa = row.pesanan - row.jumlahTerjual
    const hpp = hppPerUnit * row.jumlahTerjual
    const labaBersih = row.totalHarga - hpp

    klienMap[klienKey].produk.push({
      penjualanId: row.penjualanId,
      tanggal: row.tanggal,
      resepId: row.resepId,
      namaResep: row.namaResep,
      kategori: row.kategoriResep,
      pesanan: row.pesanan,
      terjual: row.jumlahTerjual,
      sisa: sisa < 0 ? 0 : sisa,
      hargaJual: row.hargaJual,
      totalPendapatan: row.totalHarga,
      hppPerUnit,
      totalHPP: hpp,
      labaBersih,
      catatan: row.catatan,
    })

    klienMap[klienKey].totalPesanan += row.pesanan
    klienMap[klienKey].totalTerjual += row.jumlahTerjual
    klienMap[klienKey].totalSisa += sisa < 0 ? 0 : sisa
    klienMap[klienKey].totalPendapatan += row.totalHarga
    klienMap[klienKey].totalHPP += hpp
    klienMap[klienKey].totalLabaBersih += labaBersih
  }

  const klienList = Object.values(klienMap)

  // Grand total
  const grandTotal = {
    totalPesanan: klienList.reduce((s, k) => s + k.totalPesanan, 0),
    totalTerjual: klienList.reduce((s, k) => s + k.totalTerjual, 0),
    totalSisa: klienList.reduce((s, k) => s + k.totalSisa, 0),
    totalPendapatan: klienList.reduce((s, k) => s + k.totalPendapatan, 0),
    totalHPP: klienList.reduce((s, k) => s + k.totalHPP, 0),
    totalLabaBersih: klienList.reduce((s, k) => s + k.totalLabaBersih, 0),
  }

  return { klienList, grandTotal }
})
