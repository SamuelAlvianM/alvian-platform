import { useDB } from '../../db/index'
import { klien } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const { nama, alamat, telepon, catatan } = await readBody(event)
  if (!nama) throw createError({ statusCode: 400, message: 'Nama wajib diisi' })
  const db = useDB()
  const [item] = await db.update(klien).set({ nama, alamat: alamat ?? null, telepon: telepon ?? null, catatan: catatan ?? null }).where(eq(klien.id, id)).returning()
  return item
})
