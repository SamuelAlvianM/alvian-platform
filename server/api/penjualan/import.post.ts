import { useDB } from '../../db/index'
import { penjualan, resep, klien } from '../../db/schema'
import { requireAdmin } from '../../utils/auth'

interface ImportRow {
  tanggal: string
  namaKlien?: string
  namaResep: string
  pesanan: number
  jumlah: number
  hargaJual: number
  catatan?: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDB()
  const rows: ImportRow[] = await readBody(event)

  if (!Array.isArray(rows) || rows.length === 0)
    throw createError({ statusCode: 400, message: 'Data kosong' })
  if (rows.length > 2000)
    throw createError({ statusCode: 400, message: 'Maksimal 2000 baris per import' })

  const allResep = await db.select().from(resep)
  const allKlien = await db.select().from(klien)

  // Normalize: lowercase + trim untuk matching fleksibel
  const resepMap = new Map(allResep.map(r => [r.nama.toLowerCase().trim(), r.id]))
  const klienMap = new Map(allKlien.map(k => [k.nama.toLowerCase().trim(), k.id]))

  const toInsert: typeof penjualan.$inferInsert[] = []
  const skipped: { row: number; alasan: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const rowNum = i + 2 // baris 1 = header

    // Validasi tanggal
    if (!r.tanggal || !/^\d{4}-\d{2}-\d{2}$/.test(r.tanggal)) {
      skipped.push({ row: rowNum, alasan: `Tanggal tidak valid: "${r.tanggal}" — gunakan format YYYY-MM-DD atau DD/MM/YYYY` })
      continue
    }

    // Cari resep — ADAPTIVE: skip kalau tidak ada, jangan error
    const resepKey = r.namaResep?.toLowerCase()?.trim() ?? ''
    const resepId = resepMap.get(resepKey)
    if (!resepId) {
      skipped.push({ row: rowNum, alasan: `Produk "${r.namaResep}" belum ada di sistem — tambahkan dulu di halaman Resep` })
      continue
    }

    // Cari klien — ADAPTIVE: kalau tidak ada, tetap import dengan klienId null
    let klienId: number | null = null
    if (r.namaKlien && r.namaKlien.trim()) {
      const found = klienMap.get(r.namaKlien.toLowerCase().trim())
      if (!found) {
        // Tidak error — tetap import, tapi klien kosong, dan catat di skipped sebagai warning
        skipped.push({ row: rowNum, alasan: `⚠️ Klien "${r.namaKlien}" tidak ditemukan — diimport tanpa klien (bisa edit manual nanti)` })
        // Tetap lanjut import (tidak `continue`)
      } else {
        klienId = found
      }
    }

    const jumlah = Number(r.jumlah)
    const pesanan = Number(r.pesanan) || jumlah
    const hargaJual = Number(r.hargaJual)

    if (!jumlah || jumlah <= 0) {
      skipped.push({ row: rowNum, alasan: `Jumlah terjual 0 atau kosong` })
      continue
    }
    if (!hargaJual || hargaJual <= 0) {
      skipped.push({ row: rowNum, alasan: `Harga jual 0 atau kosong` })
      continue
    }

    toInsert.push({
      tanggal: r.tanggal,
      klienId,
      resepId,
      pesanan,
      jumlah,
      hargaJual,
      totalHarga: jumlah * hargaJual,
      catatan: r.catatan || null,
    })
  }

  if (toInsert.length === 0 && rows.length > 0)
    throw createError({ statusCode: 422, message: 'Tidak ada baris yang bisa diimport.\n' + skipped.map(s => `Baris ${s.row}: ${s.alasan}`).join('\n') })

  // Bulk insert batch 100
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += 100) {
    await db.insert(penjualan).values(toInsert.slice(i, i + 100))
    inserted += Math.min(100, toInsert.length - i)
  }

  return { inserted, skipped, total: rows.length }
})
