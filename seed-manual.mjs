import { createHash, randomBytes } from 'node:crypto'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core'

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  isAdmin: integer('is_admin').default(0).notNull(),
  mustChangePassword: integer('must_change_password').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hash}`
}

const url = process.env.DATABASE_URL
if (!url) { console.error('DATABASE_URL tidak ada di env'); process.exit(1) }

const client = postgres(url, { ssl: 'require', max: 1 })
const db = drizzle(client)

const existing = await db.select().from(users)
console.log('Users saat ini:', existing.map(u => u.username))

if (!existing.find(u => u.username === 'samuel')) {
  await db.insert(users).values({
    username: 'samuel',
    password: hashPassword('12345678'),
    isAdmin: 1,
    mustChangePassword: 0,
  })
  console.log('✅ User samuel berhasil dibuat')
} else {
  console.log('ℹ️  User samuel sudah ada')
}

await client.end()
