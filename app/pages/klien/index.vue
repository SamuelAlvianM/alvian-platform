<template>
  <div class="space-y-5">
    <div id="klien-header" class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Klien & Toko</h1>
        <p class="text-sm text-gray-500 mt-0.5">Daftar toko dan klien yang memesan produk Alvian's Kitchen</p>
      </div>
      <UButton id="btn-tambah-klien" icon="i-heroicons-plus" @click="openTambah">Tambah Klien</UButton>
    </div>

    <div v-if="pending" class="grid grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="rounded-xl border border-gray-100 p-4 space-y-3" style="background:#fff;">
        <div class="flex items-start justify-between">
          <USkeleton class="h-11 w-11 rounded-full" />
          <div class="flex gap-1"><USkeleton class="h-7 w-7 rounded-lg" /><USkeleton class="h-7 w-7 rounded-lg" /></div>
        </div>
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-1/2" />
        <USkeleton class="h-3 w-2/3" />
      </div>
    </div>
    <div v-else-if="!data?.length" class="p-12 text-center">
      <div class="text-5xl mb-3">🏪</div>
      <p class="font-semibold text-gray-500">Belum ada klien terdaftar</p>
      <p class="text-sm text-gray-400 mt-1">Klik <strong>"Tambah Klien"</strong> untuk mendaftarkan toko pertama</p>
    </div>
    <div v-else class="grid grid-cols-3 gap-4">
      <UCard v-for="k in data" :key="k.id">
        <div class="flex items-start justify-between mb-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0" style="background:#FFFA8D;">🏪</div>
          <div class="flex gap-1">
            <UButton size="xs" color="sky" variant="soft" icon="i-heroicons-pencil-square" @click="openEdit(k)" />
            <UButton size="xs" color="red" variant="soft" icon="i-heroicons-trash" @click="hapus(k.id)" />
          </div>
        </div>
        <div class="font-bold text-gray-800 text-base">{{ k.nama }}</div>
        <div v-if="k.telepon" class="text-sm text-gray-500 mt-0.5 flex items-center gap-1"><span>📞</span> {{ k.telepon }}</div>
        <div v-if="k.alamat" class="text-sm text-gray-400 mt-0.5 flex items-start gap-1"><span class="flex-shrink-0">📍</span> {{ k.alamat }}</div>
        <div v-if="k.catatan" class="mt-2 text-xs text-gray-400 italic border-t border-gray-100 pt-2">{{ k.catatan }}</div>
      </UCard>
    </div>

    <UModal v-model:open="showModal" :title="editId ? 'Edit Klien' : 'Tambah Klien Baru'">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="simpan">
          <UFormField id="form-nama-klien" label="Nama Toko / Klien" required>
            <UInput v-model="form.nama" placeholder="Contoh: Toko Bu Sari, Warung Pak Budi..." class="w-full" autofocus />
          </UFormField>
          <div id="form-kontak-klien" class="grid grid-cols-2 gap-3">
            <UFormField label="No. Telepon">
              <UInput v-model="form.telepon" placeholder="08xx-xxxx-xxxx" class="w-full" />
            </UFormField>
            <UFormField label="Alamat">
              <UInput v-model="form.alamat" placeholder="Alamat toko..." class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Catatan">
            <UTextarea v-model="form.catatan" placeholder="Info tambahan (opsional)" :rows="2" class="w-full" />
          </UFormField>
          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton id="btn-simpan-klien" type="submit" :loading="loading">{{ editId ? 'Simpan Perubahan' : 'Tambah Klien' }}</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { data, pending, refresh } = useFetch('/api/klien', { lazy: true })
const { autoStartIfNew } = useAppTour()
onMounted(autoStartIfNew)

const showModal = ref(false)
const loading = ref(false)
const editId = ref<number | null>(null)
const form = reactive({ nama: '', telepon: '', alamat: '', catatan: '' })

function openTambah() {
  editId.value = null
  Object.assign(form, { nama: '', telepon: '', alamat: '', catatan: '' })
  showModal.value = true
}
function openEdit(k: any) {
  editId.value = k.id
  Object.assign(form, { nama: k.nama, telepon: k.telepon ?? '', alamat: k.alamat ?? '', catatan: k.catatan ?? '' })
  showModal.value = true
}
async function simpan() {
  if (!form.nama) return
  loading.value = true
  try {
    if (editId.value) {
      await $fetch(`/api/klien/${editId.value}`, { method: 'PUT', body: { ...form } })
    } else {
      await $fetch('/api/klien', { method: 'POST', body: { ...form } })
    }
    showModal.value = false
    await refresh()
  } finally { loading.value = false }
}
async function hapus(id: number) {
  if (!confirm('Hapus klien ini?')) return
  await $fetch(`/api/klien/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
