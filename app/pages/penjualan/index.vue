<template>
  <div class="space-y-5">
    <!-- Header -->
    <div id="penjualan-header" class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Penjualan</h1>
        <p class="text-sm text-gray-500 mt-0.5">Catat transaksi dan lihat laporan per klien</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton v-if="activeTab === 'laporan'" icon="i-heroicons-arrow-down-tray" color="emerald" variant="soft" @click="downloadExcel" :disabled="!report?.klienList?.length">
          Download Excel
        </UButton>
        <UButton id="btn-catat-penjualan" v-if="activeTab === 'transaksi'" icon="i-heroicons-plus" @click="openTambah">Catat Penjualan</UButton>
      </div>
    </div>

    <!-- Tabs -->
    <div id="tabs-penjualan" class="flex gap-2 p-1 rounded-xl w-fit" style="background:#e0f4fa; border:1.5px solid #A8F1FF;">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
        :style="activeTab === tab.value
          ? 'background:#FFFA8D; color:#78350f; box-shadow:0 2px 8px rgba(0,0,0,0.10);'
          : 'background:transparent; color:#0f4a5c;'"
      >
        <UIcon :name="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Filter (shared) -->
    <UCard id="filter-penjualan">
      <div class="flex items-end gap-3 flex-wrap">
        <UFormField label="Dari Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-44 justify-start">
              {{ filterDari ? formatTanggal(filterDari) : 'Pilih tanggal' }}
            </UButton>
            <template #content>
              <UCalendar v-model="filterDariDate" class="p-2" @update:model-value="d => filterDari = toStr(d)" />
            </template>
          </UPopover>
        </UFormField>
        <UFormField label="Sampai Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-44 justify-start">
              {{ filterSampai ? formatTanggal(filterSampai) : 'Pilih tanggal' }}
            </UButton>
            <template #content>
              <UCalendar v-model="filterSampaiDate" class="p-2" @update:model-value="d => filterSampai = toStr(d)" />
            </template>
          </UPopover>
        </UFormField>
        <UFormField label="Filter Klien">
          <USelectMenu
            v-model="filterKlien"
            :items="klienFilterOpts"
            value-key="id"
            label-key="label"
            placeholder="Semua klien"
            class="w-48"
          />
        </UFormField>
        <div class="flex gap-2">
          <UButton @click="terapkanFilter" icon="i-heroicons-magnifying-glass">Terapkan</UButton>
          <UButton color="neutral" variant="outline" icon="i-heroicons-x-mark" @click="resetFilter">Reset</UButton>
        </div>
      </div>
    </UCard>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB: TRANSAKSI                              -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'transaksi'">
      <!-- Summary Cards -->
      <div v-if="penjualanData?.length" class="grid grid-cols-4 gap-4">
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Transaksi</div>
          <div class="text-3xl font-bold text-gray-800">{{ penjualanData.length }}</div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Terjual</div>
          <div class="text-3xl font-bold text-gray-800">{{ totalUnit }} <span class="text-base font-normal text-gray-400">pcs</span></div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Sisa</div>
          <div class="text-3xl font-bold text-orange-500">{{ totalSisa }} <span class="text-base font-normal text-gray-400">pcs</span></div>
        </UCard>
        <UCard :ui="{ base: 'bg-gradient-to-br from-sky-400 to-sky-200' }">
          <div class="text-xs font-semibold text-sky-800 uppercase tracking-wide mb-1">Total Pemasukan</div>
          <div class="text-2xl font-bold text-sky-900">{{ formatRupiah(totalPemasukan) }}</div>
        </UCard>
      </div>

      <UCard :ui="{ body: 'p-0' }">
        <div v-if="penjualanPending" class="p-4 space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-3">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-28" />
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-6 w-16 rounded-full" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-7 w-7 rounded-lg" />
          </div>
        </div>
        <div v-else-if="!penjualanData?.length" class="p-12 text-center">
          <div class="text-4xl mb-3">🛒</div>
          <p class="font-semibold text-gray-500">Belum ada data penjualan</p>
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Klien / Toko</th>
              <th>Produk</th>
              <th class="text-right">Pesanan</th>
              <th class="text-right">Terjual</th>
              <th class="text-right">Sisa</th>
              <th class="text-right">Harga/pcs</th>
              <th class="text-right">Total</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in penjualanData" :key="p.id">
              <td class="whitespace-nowrap text-sm">{{ formatTanggal(p.tanggal) }}</td>
              <td>
                <span v-if="p.namaKlien" class="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                  <span>🏪</span> {{ p.namaKlien }}
                </span>
                <span v-else class="text-gray-400 text-sm">—</span>
              </td>
              <td class="font-semibold">{{ p.namaResep }}</td>
              <td class="text-right">{{ p.pesanan }}</td>
              <td class="text-right"><UBadge :label="`${p.jumlah} pcs`" color="sky" variant="subtle" /></td>
              <td class="text-right">
                <span :class="(p.pesanan - p.jumlah) > 0 ? 'text-orange-500 font-semibold' : 'text-gray-400'">
                  {{ p.pesanan - p.jumlah }}
                </span>
              </td>
              <td class="text-right text-sm">{{ formatRupiah(p.hargaJual) }}</td>
              <td class="text-right font-bold text-green-600">{{ formatRupiah(p.totalHarga) }}</td>
              <td class="text-gray-400 text-sm">{{ p.catatan ?? '—' }}</td>
              <td>
                <UButton size="xs" color="red" variant="soft" icon="i-heroicons-trash" @click="hapus(p.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB: LAPORAN                                -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'laporan'">
      <!-- Grand Total Cards -->
      <div v-if="report?.grandTotal && report.klienList?.length" class="grid grid-cols-6 gap-3">
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Pesanan</div>
          <div class="text-2xl font-bold text-gray-800">{{ report.grandTotal.totalPesanan }} <span class="text-xs font-normal text-gray-400">pcs</span></div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Terjual</div>
          <div class="text-2xl font-bold text-green-600">{{ report.grandTotal.totalTerjual }} <span class="text-xs font-normal text-gray-400">pcs</span></div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Sisa</div>
          <div class="text-2xl font-bold text-orange-500">{{ report.grandTotal.totalSisa }} <span class="text-xs font-normal text-gray-400">pcs</span></div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Pendapatan</div>
          <div class="text-lg font-bold text-sky-700">{{ formatRupiah(report.grandTotal.totalPendapatan) }}</div>
        </UCard>
        <UCard>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total HPP</div>
          <div class="text-lg font-bold text-red-500">{{ formatRupiah(report.grandTotal.totalHPP) }}</div>
        </UCard>
        <UCard :ui="{ base: 'bg-gradient-to-br from-emerald-400 to-emerald-200' }">
          <div class="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">Laba Bersih</div>
          <div class="text-lg font-bold text-emerald-900">{{ formatRupiah(report.grandTotal.totalLabaBersih) }}</div>
        </UCard>
      </div>

      <div id="tab-laporan-info" v-if="reportPending" class="p-12 text-center text-gray-400">Memuat laporan...</div>
      <div v-else-if="!report?.klienList?.length && !reportPending" id="tab-laporan-info" class="p-8 text-center text-gray-400">
        <div class="text-4xl mb-2">📊</div>Belum ada data laporan
      </div>
      <div v-else-if="!report?.klienList?.length" class="p-12 text-center">
        <div class="text-5xl mb-3">📊</div>
        <p class="font-semibold text-gray-500">Tidak ada data untuk filter ini</p>
      </div>

      <div v-else class="space-y-5">
        <UCard v-for="k in report.klienList" :key="k.klienId ?? 'umum'" :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">🏪</span>
                <div>
                  <div class="font-bold text-gray-800">{{ k.namaKlien }}</div>
                  <div class="text-xs text-gray-400">{{ k.produk.length }} item transaksi</div>
                </div>
              </div>
              <div class="flex gap-5 text-sm">
                <div class="text-center">
                  <div class="font-bold text-gray-700">{{ k.totalTerjual }}</div>
                  <div class="text-xs text-gray-400">Terjual</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-orange-500">{{ k.totalSisa }}</div>
                  <div class="text-xs text-gray-400">Sisa</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-sky-700">{{ formatRupiah(k.totalPendapatan) }}</div>
                  <div class="text-xs text-gray-400">Pendapatan</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-red-500">{{ formatRupiah(k.totalHPP) }}</div>
                  <div class="text-xs text-gray-400">HPP</div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-emerald-600">{{ formatRupiah(k.totalLabaBersih) }}</div>
                  <div class="text-xs text-gray-400">Laba</div>
                </div>
              </div>
            </div>
          </template>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th class="text-right">Pesanan</th>
                <th class="text-right">Terjual</th>
                <th class="text-right">Sisa</th>
                <th class="text-right">Harga/pcs</th>
                <th class="text-right">Total Pendapatan</th>
                <th class="text-right">HPP/pcs</th>
                <th class="text-right">Total HPP</th>
                <th class="text-right">Laba Bersih</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in k.produk" :key="p.penjualanId">
                <td class="whitespace-nowrap text-sm">{{ formatTanggal(p.tanggal) }}</td>
                <td class="font-semibold">{{ p.namaResep }}</td>
                <td><UBadge :label="p.kategori ?? 'kue'" color="sky" variant="subtle" size="xs" /></td>
                <td class="text-right">{{ p.pesanan }}</td>
                <td class="text-right text-green-600 font-semibold">{{ p.terjual }}</td>
                <td class="text-right">
                  <span :class="p.sisa > 0 ? 'text-orange-500 font-semibold' : 'text-gray-400'">{{ p.sisa }}</span>
                </td>
                <td class="text-right text-sm">{{ formatRupiah(p.hargaJual) }}</td>
                <td class="text-right font-bold text-sky-700">{{ formatRupiah(p.totalPendapatan) }}</td>
                <td class="text-right text-sm text-red-400">{{ formatRupiah(p.hppPerUnit) }}</td>
                <td class="text-right text-red-500">{{ formatRupiah(p.totalHPP) }}</td>
                <td class="text-right font-bold" :class="p.labaBersih >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatRupiah(p.labaBersih) }}
                </td>
                <td class="text-gray-400 text-sm">{{ p.catatan ?? '—' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background:#f0fbff; border-top:2px solid #A8F1FF;">
                <td colspan="3" class="font-bold text-gray-600 px-4 py-2">Subtotal {{ k.namaKlien }}</td>
                <td class="text-right font-bold px-4 py-2">{{ k.totalPesanan }}</td>
                <td class="text-right font-bold text-green-600 px-4 py-2">{{ k.totalTerjual }}</td>
                <td class="text-right font-bold text-orange-500 px-4 py-2">{{ k.totalSisa }}</td>
                <td></td>
                <td class="text-right font-bold text-sky-700 px-4 py-2">{{ formatRupiah(k.totalPendapatan) }}</td>
                <td></td>
                <td class="text-right font-bold text-red-500 px-4 py-2">{{ formatRupiah(k.totalHPP) }}</td>
                <td class="text-right font-bold text-emerald-600 px-4 py-2">{{ formatRupiah(k.totalLabaBersih) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </UCard>
      </div>
    </template>

    <!-- Modal Catat Penjualan -->
    <UModal v-model:open="showModal" title="Catat Penjualan Baru">
      <template #body>
        <UForm :state="form" class="space-y-4" @submit="simpan">
          <UFormField label="Tanggal Penjualan" required>
            <UPopover v-model:open="datePickerOpen">
              <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" block class="justify-start font-normal" :class="!form.tanggal ? 'text-gray-400' : ''">
                {{ form.tanggal ? formatTanggal(form.tanggal) : 'Pilih tanggal transaksi' }}
              </UButton>
              <template #content>
                <div class="p-3">
                  <UCalendar v-model="selectedDate" @update:model-value="onDateSelect" />
                </div>
              </template>
            </UPopover>
          </UFormField>

          <UFormField label="Klien / Toko">
            <USelectMenu
              v-model="selectedKlien"
              :items="klienOptions"
              value-key="id"
              label-key="label"
              placeholder="Pilih klien (opsional)"
              class="w-full"
              @update:model-value="val => form.klienId = val?.id ?? null"
            />
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

          <div class="grid grid-cols-3 gap-3">
            <UFormField label="Jumlah Pesanan">
              <UInput v-model="form.pesanan" type="number" min="0" step="1" class="w-full" placeholder="0" />
            </UFormField>
            <UFormField label="Jumlah Terjual" required>
              <UInput v-model="form.jumlah" type="number" min="1" step="1" class="w-full" />
            </UFormField>
            <UFormField label="Harga Jual / pcs" required>
              <UInput v-model="form.hargaJual" type="number" min="0" step="1" class="w-full">
                <template #leading><span class="text-gray-400 text-sm">Rp</span></template>
              </UInput>
            </UFormField>
          </div>

          <div id="info-sisa-pesanan" v-if="form.jumlah" class="rounded-xl p-3 flex gap-4" style="background:#FFF9E6; border:1.5px solid #FFFA8D;">
            <div class="flex-1">
              <div class="text-xs text-yellow-700 font-semibold">SISA PRODUK</div>
              <div class="font-bold text-yellow-800 text-xl">{{ Math.max(0, Number(form.pesanan) - Number(form.jumlah)) }} pcs</div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-sky-600 font-semibold">TOTAL PEMASUKAN</div>
              <div class="font-bold text-sky-800 text-xl">{{ formatRupiah(Number(form.jumlah) * Number(form.hargaJual)) }}</div>
            </div>
          </div>

          <UFormField label="Catatan">
            <UTextarea v-model="form.catatan" placeholder="Keterangan tambahan (opsional)" :rows="2" class="w-full" />
          </UFormField>

          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showModal = false">Batal</UButton>
            <UButton type="submit" :loading="loading" :disabled="!form.tanggal || !form.resepId">Catat Penjualan</UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { today, getLocalTimeZone } from '@internationalized/date'
import * as XLSX from 'xlsx'

const { formatRupiah, formatTanggal } = useFormat()

const activeTab = ref('transaksi')
const tabs = [
  { value: 'transaksi', label: 'Transaksi', icon: 'i-heroicons-list-bullet' },
  { value: 'laporan', label: 'Laporan per Klien', icon: 'i-heroicons-chart-bar' },
]

// Filter state (shared)
const filterDari = ref('')
const filterSampai = ref('')
const filterDariDate = ref()
const filterSampaiDate = ref()
const filterKlien = ref<any>(null)
const queryParams = ref<Record<string, any>>({})

function toStr(d: any): string {
  if (!d) return ''
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

// Data fetches
const { autoStartIfNew } = useAppTour()
onMounted(autoStartIfNew)

const { data: penjualanData, pending: penjualanPending, refresh: refreshPenjualan } = useFetch('/api/penjualan', { query: queryParams, lazy: true })
const { data: report, pending: reportPending, refresh: refreshReport } = useFetch('/api/report/penjualan', { query: queryParams, lazy: true })
const { data: resepList } = useFetch('/api/resep', { lazy: true })
const { data: klienList } = useFetch('/api/klien', { lazy: true })

const resepOptions = computed(() =>
  (resepList.value as any[] ?? []).map((r: any) => ({
    id: r.id,
    label: `${r.nama} — ${formatRupiah(r.hargaJual)}`,
    hargaJual: r.hargaJual,
  }))
)

const klienOptions = computed(() => [
  { id: null, label: '— Tanpa Klien —' },
  ...((klienList.value as any[]) ?? []).map((k: any) => ({ id: k.id, label: k.nama })),
])

const klienFilterOpts = computed(() => [
  { id: null, label: 'Semua Klien' },
  ...((klienList.value as any[]) ?? []).map((k: any) => ({ id: k.id, label: k.nama })),
])

// Computed totals
const totalPemasukan = computed(() => (penjualanData.value ?? []).reduce((s: number, p: any) => s + p.totalHarga, 0))
const totalUnit = computed(() => (penjualanData.value ?? []).reduce((s: number, p: any) => s + p.jumlah, 0))
const totalSisa = computed(() => (penjualanData.value ?? []).reduce((s: number, p: any) => s + Math.max(0, p.pesanan - p.jumlah), 0))

function terapkanFilter() {
  queryParams.value = {
    dari: filterDari.value || undefined,
    sampai: filterSampai.value || undefined,
    klienId: filterKlien.value?.id || undefined,
  }
  refreshPenjualan()
  refreshReport()
}

function resetFilter() {
  filterDari.value = ''
  filterSampai.value = ''
  filterDariDate.value = undefined
  filterSampaiDate.value = undefined
  filterKlien.value = null
  queryParams.value = {}
  refreshPenjualan()
  refreshReport()
}

// Modal
const showModal = ref(false)
const loading = ref(false)
const datePickerOpen = ref(false)
const selectedResep = ref<any>(null)
const selectedKlien = ref<any>(null)
const selectedDate = ref()

const form = reactive({
  resepId: 0,
  klienId: null as number | null,
  pesanan: 0,
  jumlah: 1,
  hargaJual: 0,
  tanggal: '',
  catatan: '',
})

function openTambah() {
  selectedResep.value = null
  selectedKlien.value = null
  const t = today(getLocalTimeZone())
  selectedDate.value = t
  form.tanggal = toStr(t)
  Object.assign(form, { resepId: 0, klienId: null, pesanan: 0, jumlah: 1, hargaJual: 0, catatan: '' })
  showModal.value = true
}

function onDateSelect(d: any) {
  form.tanggal = toStr(d)
  datePickerOpen.value = false
}

function onResepChange(val: any) {
  if (val) { form.resepId = val.id; form.hargaJual = val.hargaJual }
}

async function simpan() {
  if (!form.tanggal || !form.resepId) return
  loading.value = true
  try {
    await $fetch('/api/penjualan', { method: 'POST', body: { ...form } })
    showModal.value = false
    refreshPenjualan()
    refreshReport()
  } finally { loading.value = false }
}

async function hapus(id: number) {
  if (!confirm('Hapus data penjualan ini?')) return
  await $fetch(`/api/penjualan/${id}`, { method: 'DELETE' })
  refreshPenjualan()
  refreshReport()
}

// Excel download
function downloadExcel() {
  if (!report.value?.klienList?.length) return
  const wb = XLSX.utils.book_new()

  const ringkasanRows = [
    ["Laporan Penjualan - Alvian's Kitchen"],
    ['Digenerate pada:', new Date().toLocaleString('id-ID')],
    [],
    ['Klien', 'Total Pesanan', 'Total Terjual', 'Total Sisa', 'Total Pendapatan (Rp)', 'Total HPP (Rp)', 'Laba Bersih (Rp)'],
    ...(report.value.klienList as any[]).map((k: any) => [k.namaKlien, k.totalPesanan, k.totalTerjual, k.totalSisa, k.totalPendapatan, k.totalHPP, k.totalLabaBersih]),
    [],
    ['GRAND TOTAL', report.value.grandTotal.totalPesanan, report.value.grandTotal.totalTerjual, report.value.grandTotal.totalSisa, report.value.grandTotal.totalPendapatan, report.value.grandTotal.totalHPP, report.value.grandTotal.totalLabaBersih],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ringkasanRows), 'Ringkasan')

  const detailRows = [
    ['Tanggal', 'Klien', 'Produk', 'Kategori', 'Pesanan', 'Terjual', 'Sisa', 'Harga/pcs (Rp)', 'Total Pendapatan (Rp)', 'HPP/pcs (Rp)', 'Total HPP (Rp)', 'Laba Bersih (Rp)', 'Catatan'],
  ]
  for (const k of (report.value.klienList as any[])) {
    for (const p of k.produk) {
      detailRows.push([p.tanggal, k.namaKlien, p.namaResep, p.kategori, p.pesanan, p.terjual, p.sisa, p.hargaJual, p.totalPendapatan, p.hppPerUnit, p.totalHPP, p.labaBersih, p.catatan ?? ''])
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailRows), 'Detail Transaksi')

  XLSX.writeFile(wb, `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`)
}
</script>
