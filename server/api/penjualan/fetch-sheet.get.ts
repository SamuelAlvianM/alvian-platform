// Fetch Google Sheets sebagai CSV via server (menghindari CORS di browser)
export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  if (!url || typeof url !== 'string')
    throw createError({ statusCode: 400, message: 'URL tidak boleh kosong' })

  // Ekstrak spreadsheet ID dari berbagai format URL Google Sheets
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (!match) throw createError({ statusCode: 400, message: 'URL Google Sheets tidak valid' })

  const spreadsheetId = match[1]
  // Ekstrak gid (sheet tab) kalau ada
  const gidMatch = url.match(/[#&?]gid=(\d+)/)
  const gid = gidMatch ? gidMatch[1] : '0'

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`

  try {
    const res = await fetch(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const csv = await res.text()
    if (csv.includes('<!DOCTYPE') || csv.includes('<html'))
      throw createError({ statusCode: 403, message: 'Spreadsheet belum diset "Anyone with link can view". Buka Google Sheets → Share → ubah ke "Anyone with the link".' })
    return { csv }
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 502, message: 'Gagal mengakses spreadsheet. Pastikan link sudah public.' })
  }
})
