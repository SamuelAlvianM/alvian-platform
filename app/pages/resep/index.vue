<template>
  <div class="space-y-5">
    <div id="resep-header" class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Resep & Menu</h1>
        <p class="text-sm text-gray-500 mt-0.5">Kue, masakan, dan semua menu Alvian's Kitchen</p>
      </div>
      <div class="flex gap-3 items-center">
        <USelectMenu id="filter-kategori-resep" v-model="filterKategori" :items="['', ...kategoriList]" placeholder="Semua Kategori" class="w-40" />
        <UButton id="btn-tambah-resep" icon="i-heroicons-plus" @click="openTambah">Tambah Menu</UButton>
      </div>
    </div>

    <div v-if="pending" class="p-12 text-center text-gray-400">Memuat data...</div>
    <UCard v-else-if="!data?.length" class="p-12 text-center">
      <div class="text-4xl mb-3">🍽️</div>
      <p class="font-semibold text-gray-500">Belum ada menu</p>
      <p class="text-sm text-gray-400 mt-1">Pastikan sudah menambahkan bahan baku dulu, lalu klik <strong>"Tambah Menu"</strong></p>
    </UCard>
    <UCard v-else-if="filteredData.length === 0" class="p-6 text-center text-gray-400">
      Tidak ada menu di kategori "{{ filterKategori }}"
    </UCard>

    <div v-else class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));">
      <UCard v-for="r in filteredData" :key="r.id" :ui="{ body: 'p-0' }" class="overflow-hidden flex flex-col">
        <div class="relative h-40 bg-gray-100">
          <img v-if="r.gambar" :src="r.gambar" :alt="r.nama" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-5xl" style="background:linear-gradient(135deg,#A8F1FF30,#4ED7F120);">
            {{ kategoriEmoji(r.kategori) }}
          </div>
          <div class="absolute top-2 left-2">
            <UBadge :label="r.kategori ?? 'kue'" color="sky" variant="solid" size="xs" />
          </div>
        </div>
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="font-bold text-gray-800">{{ r.nama }}</div>
          <p v-if="r.deskripsi" class="text-xs text-gray-400 leading-relaxed line-clamp-2">{{ r.deskripsi }}</p>
          <div class="mt-auto pt-3 border-t border-gray-100 space-y-1.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">HPP</span>
              <span class="font-semibold text-red-500">{{ formatRupiah(r.hpp) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Harga Jual</span>
              <span class="font-bold text-green-600">{{ formatRupiah(r.hargaJual) }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-400">Margin</span>
              <UBadge :label="`${r.margin.toFixed(1)}%`" :color="r.margin >= 30 ? 'green' : r.margin >= 15 ? 'yellow' : 'red'" variant="subtle" />
            </div>
          </div>
          <div class="flex gap-2 pt-1">
            <UButton size="xs" color="neutral" variant="outline" class="flex-1" icon="i-heroicons-pencil-square" @click="openEdit(r)">Edit</UButton>
            <UButton size="xs" color="red" variant="soft" icon="i-heroicons-trash" @click="hapus(r.id)" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Modal -->
    <UModal v-model:open="showModal" :title="editItem ? 'Edit Menu' : 'Tambah Menu Baru'" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="simpan">
          <UFormField id="form-foto-resep" label="Foto Menu">
            <div class="flex gap-3 items-start">
              <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                <img v-if="form.gambar" :src="form.gambar" class="w-full h-full object-cover" />
                <span v-else class="text-2xl">📷</span>
              </div>
              <div class="flex-1 space-y-1">
                <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="onFileChange" />
                <UButton color="neutral" variant="outline" block :loading="uploadLoading" icon="i-heroicons-photo" @click="fileInput?.click()">
                  {{ uploadLoading ? 'Mengupload...' : 'Pilih Foto' }}
                </UButton>
                <p v-if="form.gambar" class="text-xs text-sky-500 truncate">{{ form.gambar }}</p>
                <p class="text-xs text-gray-400">JPG, PNG, WebP. Disimpan di /media/</p>
              </div>
            </div>
          </UFormField>

          <div id="form-nama-resep" class="grid grid-cols-2 gap-3">
            <UFormField label="Nama Menu" required>
              <UInput v-model="form.nama" placeholder="cth: Brownies Coklat" class="w-full" />
            </UFormField>
            <UFormField label="Kategori" required>
              <USelectMenu v-model="form.kategori" :items="kategoriItems" value-key="value" label-key="label" class="w-full" />
            </UFormField>
          </div>

          <UFormField id="form-harga-resep" label="Harga Jual (Rp)" required>
            <UInput v-model="form.hargaJual" type="number" min="0" step="1" placeholder="cth: 50000" class="w-full">
              <template #leading><span class="text-gray-400 text-sm">Rp</span></template>
            </UInput>
          </UFormField>

          <UFormField label="Deskripsi">
            <UTextarea v-model="form.deskripsi" placeholder="Deskripsi menu (opsional)" :rows="2" class="w-full" />
          </UFormField>

          <div id="form-bahan-resep">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-semibold text-gray-700">Bahan-bahan</label>
              <UButton size="xs" color="yellow" variant="soft" icon="i-heroicons-plus" @click="tambahBaris">Tambah Bahan</UButton>
            </div>
            <div v-if="hppPreview > 0" class="rounded-lg p-2.5 flex justify-between mb-3" style="background:#A8F1FF20;border:1.5px solid #A8F1FF;">
              <span class="text-sm text-sky-700">Estimasi HPP:</span>
              <span class="font-bold text-sky-800">{{ formatRupiah(hppPreview) }}</span>
            </div>
            <div v-if="!form.bahan.length" class="text-center p-4 bg-gray-50 rounded-lg text-gray-400 text-sm">
              Belum ada bahan — klik "Tambah Bahan" di atas
            </div>
            <div v-for="(b, i) in form.bahan" :key="i" class="flex gap-2 mb-2 items-center">
              <USelectMenu v-model="b.bahanBakuId" :items="bahanOptions" value-key="id" label-key="label" placeholder="Pilih bahan" class="flex-1" />
              <UInput v-model="b.jumlah" type="number" min="0.001" step="0.001" placeholder="Jumlah" class="w-28" />
              <UButton size="sm" color="red" variant="soft" icon="i-heroicons-x-mark" @click="hapusBaris(i)" />
            </div>
          </div>

          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton type="submit" :loading="loading || uploadLoading">
              {{ editItem ? 'Simpan Perubahan' : 'Tambah Menu' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const { formatRupiah } = useFormat()
const { data, pending, refresh } = await useFetch('/api/resep')
const { data: bahanList } = await useFetch('/api/bahan-baku')
const { autoStartIfNew } = useAppTour()
onMounted(autoStartIfNew)

const kategoriList = ['kue', 'masakan', 'minuman', 'snack', 'lainnya']
const kategoriItems = [
  { label: '🍰 Kue', value: 'kue' },
  { label: '🍛 Masakan', value: 'masakan' },
  { label: '🥤 Minuman', value: 'minuman' },
  { label: '🍿 Snack', value: 'snack' },
  { label: '🍽️ Lainnya', value: 'lainnya' },
]
function kategoriEmoji(k?: string) {
  return { kue: '🍰', masakan: '🍛', minuman: '🥤', snack: '🍿' }[k ?? ''] ?? '🍽️'
}

const filterKategori = ref('')
const filteredData = computed(() => {
  if (!data.value) return []
  if (!filterKategori.value) return data.value as any[]
  return (data.value as any[]).filter((r: any) => r.kategori === filterKategori.value)
})

const bahanOptions = computed(() =>
  (bahanList.value as any[] ?? []).map((b: any) => ({
    id: b.id,
    label: `${b.nama} (${b.satuan}) — ${formatRupiah(b.hargaPerSatuan)}`,
    hargaPerSatuan: b.hargaPerSatuan,
  }))
)

const hppPreview = computed(() => {
  if (!bahanList.value) return 0
  return form.bahan.reduce((sum, b) => {
    const bk = (bahanList.value as any[]).find((x: any) => x.id === Number(b.bahanBakuId))
    return sum + (bk ? bk.hargaPerSatuan * Number(b.jumlah) : 0)
  }, 0)
})

const showModal = ref(false)
const loading = ref(false)
const uploadLoading = ref(false)
const editItem = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  nama: '', kategori: 'kue', deskripsi: '', hargaJual: 0, gambar: '',
  bahan: [] as { bahanBakuId: number | string; jumlah: number }[],
})

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadLoading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kategori', form.kategori || 'menu')
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    form.gambar = res.url
  } finally {
    uploadLoading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function tambahBaris() { form.bahan.push({ bahanBakuId: '', jumlah: 0 }) }
function hapusBaris(i: number) { form.bahan.splice(i, 1) }

function openTambah() {
  editItem.value = null
  Object.assign(form, { nama: '', kategori: 'kue', deskripsi: '', hargaJual: 0, gambar: '', bahan: [] })
  showModal.value = true
}
function openEdit(item: any) {
  editItem.value = item
  Object.assign(form, {
    nama: item.nama, kategori: item.kategori ?? 'kue', deskripsi: item.deskripsi ?? '',
    hargaJual: item.hargaJual, gambar: item.gambar ?? '',
    bahan: item.bahan.map((b: any) => ({ bahanBakuId: b.bahanBakuId, jumlah: b.jumlah })),
  })
  showModal.value = true
}
async function simpan() {
  loading.value = true
  try {
    const body = { ...form, bahan: form.bahan.map(b => ({ bahanBakuId: Number(b.bahanBakuId), jumlah: Number(b.jumlah) })) }
    if (editItem.value) {
      await $fetch(`/api/resep/${editItem.value.id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/resep', { method: 'POST', body })
    }
    showModal.value = false
    await refresh()
  } finally { loading.value = false }
}
async function hapus(id: number) {
  if (!confirm('Hapus menu ini?')) return
  await $fetch(`/api/resep/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
