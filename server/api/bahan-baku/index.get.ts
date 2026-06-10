import { useDB } from '../../db/index'
import { bahanBaku } from '../../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  const data = await db.select().from(bahanBaku).orderBy(asc(bahanBaku.nama))
  return data
})
