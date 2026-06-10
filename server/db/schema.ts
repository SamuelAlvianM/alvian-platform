import { pgTable, serial, varchar, text, real, integer, timestamp, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isAdmin: integer('is_admin').default(0).notNull(),
  mustChangePassword: integer('must_change_password').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bahanBaku = pgTable('bahan_baku', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  satuan: varchar('satuan', { length: 50 }).notNull(),
  hargaPerSatuan: real('harga_per_satuan').notNull(),
  stok: real('stok').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const resep = pgTable('resep', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  kategori: varchar('kategori', { length: 100 }).default('kue'),
  deskripsi: text('deskripsi'),
  gambar: varchar('gambar', { length: 500 }),
  hargaJual: real('harga_jual').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const resepBahan = pgTable('resep_bahan', {
  id: serial('id').primaryKey(),
  resepId: integer('resep_id').references(() => resep.id, { onDelete: 'cascade' }).notNull(),
  bahanBakuId: integer('bahan_baku_id').references(() => bahanBaku.id, { onDelete: 'restrict' }).notNull(),
  jumlah: real('jumlah').notNull(),
})

export const klien = pgTable('klien', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  alamat: text('alamat'),
  telepon: varchar('telepon', { length: 50 }),
  catatan: text('catatan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const penjualan = pgTable('penjualan', {
  id: serial('id').primaryKey(),
  klienId: integer('klien_id').references(() => klien.id, { onDelete: 'set null' }),
  resepId: integer('resep_id').references(() => resep.id, { onDelete: 'restrict' }).notNull(),
  pesanan: integer('pesanan').notNull().default(0),
  jumlah: integer('jumlah').notNull(),
  hargaJual: real('harga_jual').notNull(),
  totalHarga: real('total_harga').notNull(),
  tanggal: date('tanggal').notNull(),
  catatan: text('catatan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bahanBakuRelations = relations(bahanBaku, ({ many }) => ({
  resepBahan: many(resepBahan),
}))

export const resepRelations = relations(resep, ({ many }) => ({
  bahan: many(resepBahan),
  penjualan: many(penjualan),
}))

export const resepBahanRelations = relations(resepBahan, ({ one }) => ({
  resep: one(resep, { fields: [resepBahan.resepId], references: [resep.id] }),
  bahanBaku: one(bahanBaku, { fields: [resepBahan.bahanBakuId], references: [bahanBaku.id] }),
}))

export const klienRelations = relations(klien, ({ many }) => ({
  penjualan: many(penjualan),
}))

export const penjualanRelations = relations(penjualan, ({ one }) => ({
  resep: one(resep, { fields: [penjualan.resepId], references: [resep.id] }),
  klien: one(klien, { fields: [penjualan.klienId], references: [klien.id] }),
}))
