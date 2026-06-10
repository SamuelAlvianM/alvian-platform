import { useDB } from '../../db/index'
import { klien } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { nama, alamat, telepon, catatan } = await readBody(event)
  if (!nama) throw createError({ statusCode: 400, message: 'Nama klien wajib diisi' })
  const db = useDB()
  const [item] = await db.insert(klien).values({ nama, alamat: alamat ?? null, telepon: telepon ?? null, catatan: catatan ?? null }).returning()
  return item
})
