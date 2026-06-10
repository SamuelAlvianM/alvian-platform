import { pgTable, serial, varchar, text, real, integer, timestamp, date } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

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

export const penjualan = pgTable('penjualan', {
  id: serial('id').primaryKey(),
  resepId: integer('resep_id').references(() => resep.id, { onDelete: 'restrict' }).notNull(),
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

export const penjualanRelations = relations(penjualan, ({ one }) => ({
  resep: one(resep, { fields: [penjualan.resepId], references: [resep.id] }),
}))
