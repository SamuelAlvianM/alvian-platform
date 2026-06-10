<template>
  <div class="space-y-5">
    <div id="bahan-header" class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Bahan Baku</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kelola inventori dan harga bahan baku</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton id="btn-tambah-bahan" icon="i-heroicons-plus" @click="openTambah">Tambah Bahan</UButton>
      </div>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div v-if="pending" class="p-12 text-center text-gray-400">Memuat data...</div>
      <div v-else-if="!data?.length" class="p-12 text-center">
        <div class="text-4xl mb-3">🧂</div>
        <p class="font-semibold text-gray-500">Belum ada bahan baku</p>
        <p class="text-sm text-gray-400 mt-1">Klik <strong>"Tambah Bahan"</strong> untuk memulai</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Nama Bahan</th>
            <th>Satuan</th>
            <th>Harga / Satuan</th>
            <th>Stok</th>
            <th>Nilai Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in data" :key="b.id">
            <td class="font-semibold">{{ b.nama }}</td>
            <td><UBadge :label="b.satuan" color="sky" variant="subtle" /></td>
            <td>{{ formatRupiah(b.hargaPerSatuan) }}</td>
            <td>
              <UBadge
                :label="`${formatAngka(b.stok)} ${b.satuan}`"
                :color="b.stok <= 0 ? 'red' : b.stok < 10 ? 'yellow' : 'green'"
                variant="subtle"
              />
            </td>
            <td class="font-semibold text-sky-700">{{ formatRupiah(b.hargaPerSatuan * b.stok) }}</td>
            <td>
              <div class="flex gap-2">
                <UButton size="xs" color="neutral" variant="outline" icon="i-heroicons-pencil-square" @click="openEdit(b)">Edit</UButton>
                <UButton size="xs" color="red" variant="soft" icon="i-heroicons-trash" @click="hapus(b.id)">Hapus</UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Modal -->
    <UModal v-model:open="showModal" :title="editItem ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="simpan">
          <UFormField id="form-nama-bahan" label="Nama Bahan" required>
            <UInput v-model="form.nama" placeholder="cth: Tepung Terigu" class="w-full" autofocus />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField id="form-satuan-bahan" label="Satuan" required>
              <USelectMenu v-model="form.satuan" :items="satuanOptions" placeholder="Pilih satuan" class="w-full" />
            </UFormField>
            <UFormField id="form-stok-bahan" label="Stok Saat Ini">
              <UInput v-model="form.stok" type="number" min="0" step="0.001" placeholder="0" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Harga per Satuan (Rp)" required>
            <UInput v-model="form.hargaPerSatuan" type="number" min="0" step="1" placeholder="cth: 15000" class="w-full">
              <template #leading><span class="text-gray-400 text-sm">Rp</span></template>
            </UInput>
          </UFormField>
          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton id="btn-simpan-bahan" type="submit" :loading="loading">
              {{ editItem ? 'Simpan Perubahan' : 'Tambah Bahan' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { formatRupiah, formatAngka } = useFormat()
const { data, pending, refresh } = await useFetch('/api/bahan-baku')
const { autoStartIfNew } = useAppTour()
onMounted(autoStartIfNew)

const satuanOptions = ['gram', 'kg', 'ml', 'liter', 'buah', 'butir', 'sdm', 'sdt', 'sachet', 'lembar']
const showModal = ref(false)
const loading = ref(false)
const editItem = ref<any>(null)
const form = reactive({ nama: '', satuan: '', hargaPerSatuan: 0, stok: 0 })

function openTambah() {
  editItem.value = null
  Object.assign(form, { nama: '', satuan: '', hargaPerSatuan: 0, stok: 0 })
  showModal.value = true
}
function openEdit(item: any) {
  editItem.value = item
  Object.assign(form, { nama: item.nama, satuan: item.satuan, hargaPerSatuan: item.hargaPerSatuan, stok: item.stok })
  showModal.value = true
}
async function simpan() {
  loading.value = true
  try {
    if (editItem.value) {
      await $fetch(`/api/bahan-baku/${editItem.value.id}`, { method: 'PUT', body: form })
    } else {
      await $fetch('/api/bahan-baku', { method: 'POST', body: form })
    }
    showModal.value = false
    await refresh()
  } finally { loading.value = false }
}
async function hapus(id: number) {
  if (!confirm('Hapus bahan baku ini?')) return
  await $fetch(`/api/bahan-baku/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
