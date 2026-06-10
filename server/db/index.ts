import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL tidak ditemukan')
  const client = postgres(url, { ssl: 'require', max: 1 })
  _db = drizzle(client, { schema })
  return _db
}
