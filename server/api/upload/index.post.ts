import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form || form.length === 0) {
    throw createError({ statusCode: 400, message: 'Tidak ada file yang diupload' })
  }

  const filePart = form.find(p => p.name === 'file')
  if (!filePart?.data) {
    throw createError({ statusCode: 400, message: 'Field "file" tidak ditemukan' })
  }

  const mime = filePart.type ?? ''
  if (!mime.startsWith('image/')) {
    throw createError({ statusCode: 400, message: 'File harus berupa gambar (jpg, png, webp)' })
  }

  const kategori = form.find(p => p.name === 'kategori')?.data?.toString() ?? 'menu'
  const ext = extname(filePart.filename ?? '') || `.${mime.split('/')[1] ?? 'jpg'}`
  const filename = `${randomUUID()}${ext}`

  // Simpan ke public/media/{kategori}/
  const dir = join(process.cwd(), 'public', 'media', kategori)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), filePart.data)

  // URL publik: /media/{kategori}/{filename}
  return { url: `/media/${kategori}/${filename}` }
})
