import { useDB } from '../../db/index'
import { klien } from '../../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  return db.select().from(klien).orderBy(asc(klien.nama))
})
