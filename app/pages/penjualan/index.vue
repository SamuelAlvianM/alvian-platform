<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Data Penjualan</h1>
        <p class="text-sm text-gray-500 mt-0.5">Catat dan pantau semua transaksi penjualan</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openTambah">Catat Penjualan</UButton>
    </div>

    <!-- Filter -->
    <UCard>
      <div class="flex items-end gap-3 flex-wrap">
        <UFormField label="Dari Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-44 justify-start">
              {{ filterDari ? formatTanggal(filterDari) : 'Pilih tanggal' }}
            </UButton>
            <template #content>
              <UCalendar v-model="filterDariDate" class="p-2" @update:model-value="onDariChange" />
            </template>
          </UPopover>
        </UFormField>
        <UFormField label="Sampai Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-44 justify-start">
              {{ filterSampai ? formatTanggal(filterSampai) : 'Pilih tanggal' }}
            </UButton>
            <template #content>
              <UCalendar v-model="filterSampaiDate" class="p-2" @update:model-value="onSampaiChange" />
            </template>
          </UPopover>
        </UFormField>
        <div class="flex gap-2">
          <UButton @click="terapkanFilter" icon="i-heroicons-magnifying-glass">Terapkan</UButton>
          <UButton color="neutral" variant="outline" icon="i-heroicons-x-mark" @click="resetFilter">Reset</UButton>
        </div>
      </div>
    </UCard>

    <!-- Summary Cards -->
    <div v-if="data?.length" class="grid grid-cols-3 gap-4">
      <UCard>
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Transaksi</div>
        <div class="text-3xl font-bold text-gray-800">{{ data.length }}</div>
      </UCard>
      <UCard>
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Unit Terjual</div>
        <div class="text-3xl font-bold text-gray-800">{{ totalUnit }} <span class="text-base font-normal text-gray-400">pcs</span></div>
      </UCard>
      <UCard :ui="{ base: 'bg-gradient-to-br from-sky-400 to-sky-200' }">
        <div class="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1">Total Pemasukan</div>
        <div class="text-2xl font-bold text-sky-900">{{ formatRupiah(totalPemasukan) }}</div>
      </UCard>
    </div>

    <!-- Table -->
    <UCard :ui="{ body: 'p-0' }">
      <div v-if="pending" class="p-12 text-center text-gray-400">Memuat data...</div>
      <div v-else-if="!data?.length" class="p-12 text-center">
        <div class="text-4xl mb-3">🛒</div>
        <p class="font-semibold text-gray-500">Belum ada data penjualan</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Harga Jual</th>
            <th>Total</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in data" :key="p.id">
            <td class="whitespace-nowrap text-sm">{{ formatTanggal(p.tanggal) }}</td>
            <td class="font-semibold">{{ p.namaResep }}</td>
            <td><UBadge :label="`${p.jumlah} pcs`" color="sky" variant="subtle" /></td>
            <td>{{ formatRupiah(p.hargaJual) }}</td>
            <td class="font-bold text-green-600">{{ formatRupiah(p.totalHarga) }}</td>
            <td class="text-gray-400 text-sm">{{ p.catatan ?? '—' }}</td>
            <td>
              <UButton size="xs" color="red" variant="soft" icon="i-heroicons-trash" @click="hapus(p.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Modal Catat Penjualan -->
    <UModal v-model:open="showModal" title="Catat Penjualan Baru">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="simpan">

          <!-- Tanggal — DatePicker NuxtUI -->
          <UFormField label="Tanggal Penjualan" required>
            <UPopover v-model:open="datePickerOpen">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-calendar-days"
                block
                class="justify-start font-normal"
                :class="!form.tanggal ? 'text-gray-400' : ''"
              >
                {{ form.tanggal ? formatTanggal(form.tanggal) : 'Pilih tanggal transaksi' }}
              </UButton>
              <template #content>
                <div class="p-3">
                  <UCalendar v-model="selectedDate" @update:model-value="onDateSelect" />
                </div>
              </template>
            </UPopover>
          </UFormField>

          <UFormField label="Produk" required>
            <USelectMenu
              v-model="selectedResep"
              :items="resepOptions"
              value-key="id"
              label-key="label"
              placeholder="Pilih produk / menu"
              class="w-full"
              @update:model-value="onResepChange"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Jumlah (pcs)" required>
              <UInput v-model="form.jumlah" type="number" min="1" step="1" class="w-full" />
            </UFormField>
            <UFormField label="Harga Jual / pcs (Rp)" required>
              <UInput v-model="form.hargaJual" type="number" min="0" step="1" class="w-full">
                <template #leading><span class="text-gray-400 text-sm">Rp</span></template>
              </UInput>
            </UFormField>
          </div>

          <!-- Total preview -->
          <div v-if="form.jumlah && form.hargaJual" class="rounded-xl p-3 flex justify-between items-center" style="background:#A8F1FF20; border:1.5px solid #4ED7F1;">
            <div>
              <div class="text-xs text-sky-600 font-semibold">TOTAL PEMASUKAN</div>
              <div class="font-bold text-sky-800 text-xl">{{ formatRupiah(Number(form.jumlah) * Number(form.hargaJual)) }}</div>
            </div>
            <span class="text-2xl">💰</span>
          </div>

          <UFormField label="Catatan">
            <UTextarea v-model="form.catatan" placeholder="Keterangan tambahan (opsional)" :rows="2" class="w-full" />
          </UFormField>

          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton type="submit" :loading="loading" :disabled="!form.tanggal">Catat Penjualan</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

const { formatRupiah, formatTanggal } = useFormat()

const filterDari = ref('')
const filterSampai = ref('')
const filterDariDate = ref()
const filterSampaiDate = ref()
const queryParams = ref({})

const { data, pending, refresh } = await useFetch('/api/penjualan', { query: queryParams })
const { data: resepList } = await useFetch('/api/resep')

const resepOptions = computed(() =>
  (resepList.value as any[] ?? []).map((r: any) => ({
    id: r.id,
    label: `${r.nama} — ${formatRupiah(r.hargaJual)}`,
    hargaJual: r.hargaJual,
  }))
)

const totalPemasukan = computed(() => (data.value ?? []).reduce((s: number, p: any) => s + p.totalHarga, 0))
const totalUnit = computed(() => (data.value ?? []).reduce((s: number, p: any) => s + p.jumlah, 0))

function calendarDateToString(d: any): string {
  if (!d) return ''
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

function onDariChange(d: any) { filterDari.value = calendarDateToString(d) }
function onSampaiChange(d: any) { filterSampai.value = calendarDateToString(d) }

function terapkanFilter() {
  queryParams.value = { dari: filterDari.value || undefined, sampai: filterSampai.value || undefined }
  refresh()
}
function resetFilter() {
  filterDari.value = ''
  filterSampai.value = ''
  filterDariDate.value = undefined
  filterSampaiDate.value = undefined
  queryParams.value = {}
  refresh()
}

// Modal state
const showModal = ref(false)
const loading = ref(false)
const datePickerOpen = ref(false)
const selectedResep = ref<any>(null)
const selectedDate = ref()

const form = reactive({
  resepId: 0,
  jumlah: 1,
  hargaJual: 0,
  tanggal: '',
  catatan: '',
})

function openTambah() {
  selectedResep.value = null
  const t = today(getLocalTimeZone())
  selectedDate.value = t
  form.tanggal = calendarDateToString(t)
  Object.assign(form, { resepId: 0, jumlah: 1, hargaJual: 0, catatan: '' })
  showModal.value = true
}

function onDateSelect(d: any) {
  form.tanggal = calendarDateToString(d)
  datePickerOpen.value = false
}

function onResepChange(val: any) {
  if (val) {
    form.resepId = val.id
    form.hargaJual = val.hargaJual
  }
}

async function simpan() {
  if (!form.tanggal || !form.resepId) return
  loading.value = true
  try {
    await $fetch('/api/penjualan', { method: 'POST', body: { ...form } })
    showModal.value = false
    await refresh()
  } finally { loading.value = false }
}

async function hapus(id: number) {
  if (!confirm('Hapus data penjualan ini?')) return
  await $fetch(`/api/penjualan/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
