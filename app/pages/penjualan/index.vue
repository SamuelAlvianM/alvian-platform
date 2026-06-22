<template>
  <div class="space-y-5">
    <!-- Header -->
    <div id="penjualan-header" class="flex items-start sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Penjualan</h1>
        <p class="text-sm text-gray-500 mt-0.5">Catat transaksi dan lihat laporan per klien</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <UButton v-if="activeTab === 'laporan'" icon="i-heroicons-arrow-down-tray" color="emerald" variant="soft" @click="downloadExcel" :disabled="!report?.klienList?.length">
          Download Excel
        </UButton>
        <UButton v-if="activeTab === 'transaksi'" icon="i-heroicons-arrow-up-tray" color="violet" variant="soft" @click="openImport">
          Import Excel
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
      <div class="flex items-end gap-2 flex-wrap">
        <UFormField label="Dari Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-full sm:w-44 justify-start">
              {{ filterDari ? formatTanggal(filterDari) : 'Pilih tanggal' }}
            </UButton>
            <template #content>
              <UCalendar v-model="filterDariDate" class="p-2" @update:model-value="d => filterDari = toStr(d)" />
            </template>
          </UPopover>
        </UFormField>
        <UFormField label="Sampai Tanggal">
          <UPopover>
            <UButton color="neutral" variant="outline" icon="i-heroicons-calendar-days" class="w-full sm:w-44 justify-start">
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
            class="w-full sm:w-48"
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
      <div v-if="penjualanData?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div v-else class="overflow-x-auto">
        <table>
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
        </div>
      </UCard>
    </template>

    <!-- ═══════════════════════════════════════════ -->
    <!-- TAB: LAPORAN                                -->
    <!-- ═══════════════════════════════════════════ -->
    <template v-if="activeTab === 'laporan'">
      <!-- Grand Total Cards -->
      <div v-if="report?.grandTotal && report.klienList?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
          <div class="overflow-x-auto"><table>
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
          </table></div>
        </UCard>
      </div>
    </template>

    <!-- ── Modal Import Excel / Google Sheets ── -->
    <UModal v-model:open="showImport" title="Import Data Penjualan" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <div class="space-y-4">

          <!-- Tab sumber data -->
          <div class="flex gap-2 p-1 rounded-xl w-fit" style="background:#e0f4fa; border:1.5px solid #A8F1FF;">
            <button
              v-for="src in importSources"
              :key="src.value"
              @click="importSource = src.value; resetImportState()"
              class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              :style="importSource === src.value
                ? 'background:#FFFA8D; color:#78350f;'
                : 'background:transparent; color:#0f4a5c;'"
            >{{ src.label }}</button>
          </div>

          <!-- ── Panduan singkat ── -->
          <div class="rounded-xl p-3 text-sm" style="background:#f0f9ff; border:1.5px solid #A8F1FF;">
            <p class="font-bold text-sky-800 mb-1">📋 Tips import</p>
            <ul class="text-gray-600 space-y-0.5 list-disc list-inside text-xs">
              <li>Kolom wajib: <strong>Tanggal, Nama Produk, Jumlah Terjual, Harga Jual</strong></li>
              <li>Format tanggal: <strong>DD/MM/YYYY</strong> atau <strong>YYYY-MM-DD</strong></li>
              <li>Produk tidak ditemukan → baris dilewati, sisanya tetap diimport</li>
              <li>Klien tidak ditemukan → diimport tanpa klien, bisa diubah manual</li>
              <li>Nama kolom tidak harus persis — sistem mendeteksi otomatis</li>
            </ul>
          </div>

          <!-- ── SOURCE: FILE ── -->
          <template v-if="importSource === 'file'">
            <div class="flex items-center gap-3 flex-wrap">
              <UButton icon="i-heroicons-document-arrow-down" color="sky" variant="soft" size="sm" @click="downloadTemplate">
                Download Template
              </UButton>
              <span class="text-xs text-gray-400">Template berisi contoh & daftar produk/klien</span>
            </div>
            <div
              class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
              :style="dragOver ? 'border-color:#4ED7F1;background:#f0fdff;' : 'border-color:#d1d5db;background:#fafafa;'"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDrop"
            >
              <input ref="importFileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onImportFile" />
              <div class="text-4xl mb-2">📊</div>
              <p class="font-semibold text-gray-700">Drag & drop file Excel / CSV di sini</p>
              <p class="text-sm text-gray-400 mb-3">atau</p>
              <UButton color="neutral" variant="outline" @click="importFileInput?.click()">Pilih File</UButton>
              <p v-if="importFileName" class="mt-2 text-sm font-medium text-sky-600">📎 {{ importFileName }}</p>
            </div>
          </template>

          <!-- ── SOURCE: GOOGLE SHEETS ── -->
          <template v-else>
            <div class="rounded-xl p-4 space-y-3" style="background:#f9f9f9;border:1.5px solid #e5e7eb;">
              <p class="text-sm font-semibold text-gray-700">🔗 Paste link Google Sheets</p>
              <p class="text-xs text-gray-500">Pastikan spreadsheet sudah diset <strong>"Anyone with the link can view"</strong><br>(Share → Change → Anyone with the link)</p>
              <div class="flex gap-2">
                <UInput
                  v-model="sheetsUrl"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  class="flex-1"
                  @keyup.enter="fetchFromSheets"
                />
                <UButton icon="i-heroicons-arrow-down-tray" color="sky" :loading="sheetsFetching" @click="fetchFromSheets">
                  Ambil Data
                </UButton>
              </div>
              <p v-if="sheetsError" class="text-xs text-red-600 mt-1">{{ sheetsError }}</p>
            </div>
          </template>

          <!-- ── Preview tabel ── -->
          <div v-if="importPreview.length > 0">
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div class="font-semibold text-gray-700">Preview — {{ importPreview.length }} baris</div>
              <div class="flex gap-2">
                <UBadge :label="`${importPreview.length} baris terbaca`" color="sky" variant="subtle" />
              </div>
            </div>
            <div class="overflow-x-auto rounded-xl border border-gray-200">
              <table style="min-width:640px;">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Klien</th>
                    <th>Produk</th>
                    <th class="text-right">Pesanan</th>
                    <th class="text-right">Terjual</th>
                    <th class="text-right">Harga/pcs</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in importPreview.slice(0, 30)" :key="i">
                    <td>{{ r.tanggal }}</td>
                    <td class="text-gray-500">{{ r.namaKlien || '—' }}</td>
                    <td class="font-medium">{{ r.namaResep }}</td>
                    <td class="text-right">{{ r.pesanan }}</td>
                    <td class="text-right">{{ r.jumlah }}</td>
                    <td class="text-right">{{ formatRupiah(r.hargaJual) }}</td>
                    <td class="text-right font-semibold text-green-600">{{ formatRupiah(r.jumlah * r.hargaJual) }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="importPreview.length > 30" class="text-center py-2 text-xs text-gray-400">
                ... dan {{ importPreview.length - 30 }} baris lainnya
              </div>
            </div>
          </div>

          <!-- ── Skipped / warning (dari preview parsing) ── -->
          <div v-if="importSkipped.length && !importResult" class="rounded-xl p-3 space-y-1" style="background:#FFFBEB;border:1.5px solid #FCD34D;">
            <div class="font-semibold text-amber-700 text-sm">⚠️ {{ importSkipped.length }} baris akan dilewati:</div>
            <ul class="text-xs text-amber-700 space-y-0.5 list-disc list-inside max-h-28 overflow-y-auto">
              <li v-for="s in importSkipped" :key="s">{{ s }}</li>
            </ul>
          </div>

          <!-- ── Hasil import ── -->
          <template v-if="importResult">
            <div class="rounded-xl p-4" style="background:#D1FAE5;border:1.5px solid #6EE7B7;">
              <div class="font-bold text-emerald-800 text-base">✅ Berhasil import {{ importResult.inserted }} transaksi!</div>
              <div class="text-sm text-emerald-700 mt-0.5">dari {{ importResult.total }} baris total</div>
            </div>
            <div v-if="importResult.skipped?.length" class="rounded-xl p-3" style="background:#FFFBEB;border:1.5px solid #FCD34D;">
              <div class="font-semibold text-amber-700 text-sm mb-1">{{ importResult.skipped.length }} baris dilewati:</div>
              <ul class="text-xs text-amber-700 space-y-0.5 list-disc list-inside max-h-32 overflow-y-auto">
                <li v-for="s in importResult.skipped" :key="s.row">Baris {{ s.row }}: {{ s.alasan }}</li>
              </ul>
            </div>
          </template>

          <div class="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <UButton color="neutral" variant="outline" @click="showImport = false">Tutup</UButton>
            <UButton
              v-if="importPreview.length > 0 && !importResult"
              icon="i-heroicons-arrow-up-tray"
              color="violet"
              :loading="importLoading"
              @click="doImport"
            >
              Import {{ importPreview.length }} Baris
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

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

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

// ── Import Excel / Google Sheets ──
const showImport = ref(false)
const importSource = ref<'file' | 'sheets'>('file')
const importSources = [
  { value: 'file',   label: '📊 File Excel / CSV' },
  { value: 'sheets', label: '🟢 Google Sheets' },
]
const importFileInput = ref<HTMLInputElement | null>(null)
const importFileName = ref('')
const importPreview = ref<any[]>([])
const importSkipped = ref<string[]>([])
const importResult = ref<any>(null)
const importLoading = ref(false)
const dragOver = ref(false)

// Google Sheets
const sheetsUrl = ref('')
const sheetsFetching = ref(false)
const sheetsError = ref('')

function resetImportState() {
  importFileName.value = ''
  importPreview.value = []
  importSkipped.value = []
  importResult.value = null
  sheetsError.value = ''
  sheetsUrl.value = ''
}

function openImport() {
  importSource.value = 'file'
  resetImportState()
  showImport.value = true
}

function parseExcelDate(raw: any): string {
  if (!raw) return ''
  // Angka serial Excel
  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw)
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  const s = String(raw).trim()
  // DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return s
}

function parseRows(rows: any[][]) {
  if (rows.length < 2) { importSkipped.value = ['File/sheet kosong atau tidak ada data']; return }

  const headers = rows[0].map((h: any) => String(h).toLowerCase().trim())
  const col = (names: string[]) => names.map(n => headers.indexOf(n)).find(i => i >= 0) ?? -1

  const iDate    = col(['tanggal', 'date', 'tgl'])
  const iKlien   = col(['nama klien', 'klien', 'toko', 'client', 'nama toko'])
  const iResep   = col(['nama produk', 'produk', 'resep', 'nama menu', 'menu', 'item', 'barang'])
  const iPesanan = col(['jumlah pesanan', 'pesanan', 'order', 'total order', 'dipesan'])
  const iJumlah  = col(['jumlah terjual', 'terjual', 'jumlah', 'qty', 'quantity', 'sold', 'laku'])
  const iHarga   = col(['harga jual', 'harga/pcs', 'harga per pcs', 'harga', 'price', 'harga satuan'])
  const iCatatan = col(['catatan', 'keterangan', 'notes', 'note', 'ket'])

  if (iDate < 0 || iResep < 0 || iJumlah < 0 || iHarga < 0) {
    importSkipped.value = ['Kolom wajib tidak ditemukan. Diperlukan: Tanggal, Nama Produk, Jumlah Terjual, Harga Jual']
    return
  }

  const parsed: any[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r || r.every((c: any) => !c && c !== 0)) continue
    parsed.push({
      tanggal:   parseExcelDate(r[iDate]),
      namaKlien: iKlien >= 0 ? String(r[iKlien] ?? '').trim() : '',
      namaResep: String(r[iResep] ?? '').trim(),
      pesanan:   Number(iPesanan >= 0 ? r[iPesanan] : r[iJumlah]) || 0,
      jumlah:    Number(r[iJumlah]) || 0,
      hargaJual: Number(String(r[iHarga] ?? '').replace(/[^0-9.]/g, '')) || 0,
      catatan:   iCatatan >= 0 ? String(r[iCatatan] ?? '').trim() : '',
    })
  }
  importPreview.value = parsed
}

function parseExcelBuffer(buffer: ArrayBuffer, filename: string) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  parseRows(rows)
}

function parseCsvString(csv: string) {
  const wb = XLSX.read(csv, { type: 'string' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  parseRows(rows)
}

function parseExcelFile(file: File) {
  importFileName.value = file.name
  importPreview.value = []
  importSkipped.value = []
  importResult.value = null
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      parseExcelBuffer(e.target!.result as ArrayBuffer, file.name)
    } catch {
      importSkipped.value = ['Gagal membaca file. Pastikan format .xlsx, .xls, atau .csv']
    }
  }
  reader.readAsArrayBuffer(file)
}

async function fetchFromSheets() {
  if (!sheetsUrl.value.trim()) { sheetsError.value = 'Masukkan URL Google Sheets'; return }
  sheetsError.value = ''
  sheetsFetching.value = true
  importPreview.value = []
  importSkipped.value = []
  importResult.value = null
  try {
    const { csv } = await $fetch<{ csv: string }>('/api/penjualan/fetch-sheet', {
      query: { url: sheetsUrl.value.trim() }
    })
    parseCsvString(csv)
    if (importPreview.value.length === 0 && importSkipped.value.length === 0)
      sheetsError.value = 'Sheet kosong atau format kolom tidak dikenali'
  } catch (e: any) {
    sheetsError.value = e?.data?.message ?? 'Gagal mengakses spreadsheet'
  } finally {
    sheetsFetching.value = false
  }
}

function onImportFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) parseExcelFile(file)
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) parseExcelFile(file)
}

async function doImport() {
  importLoading.value = true
  importSkipped.value = []
  try {
    const res = await $fetch<any>('/api/penjualan/import', {
      method: 'POST',
      body: importPreview.value,
    })
    importResult.value = res
    refreshPenjualan()
    refreshReport()
  } catch (e: any) {
    const msg = e?.data?.message ?? 'Terjadi kesalahan saat import'
    importSkipped.value = msg.split('\n')
  } finally {
    importLoading.value = false
  }
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Template
  const templateRows = [
    ['Tanggal', 'Nama Klien', 'Nama Produk', 'Jumlah Pesanan', 'Jumlah Terjual', 'Harga Jual', 'Catatan'],
    ['25/12/2024', 'Toko Bu Sari', 'Kue Lapis', 50, 48, 15000, 'Stok habis 2 hari'],
    ['26/12/2024', '', 'Risoles Mayo', 30, 30, 8000, ''],
    ['27/12/2024', 'Warung Pak Budi', 'Bolu Pandan', 20, 18, 25000, 'Titip 2 buat besok'],
  ]
  const wsTemplate = XLSX.utils.aoa_to_sheet(templateRows)
  // Lebar kolom
  wsTemplate['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 25 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template Import')

  // Sheet 2: Daftar produk dari resepList
  const produkRows = [['Nama Produk (salin persis ke template)'], ...(resepList.value as any[] ?? []).map((r: any) => [r.nama])]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(produkRows), 'Daftar Produk')

  // Sheet 3: Daftar klien
  const klienRows = [['Nama Klien (salin persis ke template)'], ...(klienList.value as any[] ?? []).map((k: any) => [k.nama])]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(klienRows), 'Daftar Klien')

  XLSX.writeFile(wb, 'template-import-penjualan.xlsx')
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
