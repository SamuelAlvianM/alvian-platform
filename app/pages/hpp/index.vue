<template>
  <div class="space-y-5">
    <div id="hpp-header">
      <h1 class="text-xl font-bold text-gray-800">Analisis HPP</h1>
      <p class="text-sm text-gray-500 mt-0.5">Harga Pokok Produksi per produk beserta rincian bahan</p>
    </div>

    <div v-if="pending" class="p-12 text-center text-gray-400">Memuat data...</div>
    <div v-else-if="!data?.length" class="p-12 text-center">
      <div class="text-4xl mb-3">📊</div>
      <p class="font-semibold text-gray-500">Belum ada resep untuk dianalisis</p>
      <NuxtLink to="/resep"><UButton class="mt-3" variant="soft">Tambah menu dulu →</UButton></NuxtLink>
    </div>

    <template v-else>
      <UCard id="hpp-table" :ui="{ body: 'p-0' }">
        <template #header>
          <h3 class="font-bold text-gray-800">Ringkasan Semua Produk</h3>
        </template>
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>HPP</th>
              <th>Harga Jual</th>
              <th>Keuntungan / pcs</th>
              <th id="hpp-margin-info">Margin</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data" :key="r.id">
              <td>
                <div class="font-semibold">{{ r.nama }}</div>
                <UBadge :label="r.kategori ?? 'kue'" color="sky" variant="subtle" size="xs" class="mt-0.5" />
              </td>
              <td class="font-semibold text-red-500">{{ formatRupiah(r.hpp) }}</td>
              <td class="font-semibold">{{ formatRupiah(r.hargaJual) }}</td>
              <td class="font-bold text-green-600">{{ formatRupiah(r.keuntungan) }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" style="min-width:60px">
                    <div :style="{ width: Math.min(r.margin, 100) + '%' }" class="h-full rounded-full transition-all" :class="r.margin >= 30 ? 'bg-green-400' : r.margin >= 15 ? 'bg-yellow-400' : 'bg-red-400'" />
                  </div>
                  <span class="font-semibold text-sm">{{ r.margin.toFixed(1) }}%</span>
                </div>
              </td>
              <td>
                <UBadge :label="r.margin >= 30 ? 'Bagus' : r.margin >= 15 ? 'Cukup' : 'Rendah'" :color="r.margin >= 30 ? 'green' : r.margin >= 15 ? 'yellow' : 'red'" variant="subtle" />
              </td>
              <td>
                <UButton id="hpp-detail-btn" size="xs" color="sky" variant="ghost" @click="selected = selected === r.id ? null : r.id">
                  {{ selected === r.id ? 'Tutup' : 'Rincian' }}
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>

      <template v-for="r in data" :key="'detail-' + r.id">
        <UCard v-if="selected === r.id" class="border-2 border-sky-300">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-800">📋 Rincian HPP — {{ r.nama }}</h3>
              <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="selected = null">Tutup</UButton>
            </div>
          </template>
          <table class="mb-4">
            <thead>
              <tr>
                <th>Bahan</th><th>Jumlah</th><th>Satuan</th><th>Harga / Satuan</th><th>Subtotal</th><th>% dari HPP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in r.bahan" :key="b.id">
                <td class="font-medium">{{ b.namaBahan }}</td>
                <td>{{ b.jumlah }}</td>
                <td><UBadge :label="b.satuan" color="sky" variant="subtle" size="xs" /></td>
                <td>{{ formatRupiah(b.hargaPerSatuan) }}</td>
                <td class="font-semibold text-red-500">{{ formatRupiah(b.subtotal) }}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" style="min-width:50px">
                      <div class="h-full bg-sky-400 rounded-full" :style="{ width: (r.hpp > 0 ? b.subtotal/r.hpp*100 : 0).toFixed(0) + '%' }" />
                    </div>
                    <span class="text-xs text-gray-400">{{ r.hpp > 0 ? (b.subtotal/r.hpp*100).toFixed(1) : 0 }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="grid grid-cols-4 gap-3">
            <div class="rounded-lg p-3 text-center border border-red-100 bg-red-50">
              <div class="text-xs font-bold text-red-400 mb-1">HPP TOTAL</div>
              <div class="text-lg font-bold text-red-500">{{ formatRupiah(r.hpp) }}</div>
            </div>
            <div class="rounded-lg p-3 text-center border border-green-100 bg-green-50">
              <div class="text-xs font-bold text-green-400 mb-1">HARGA JUAL</div>
              <div class="text-lg font-bold text-green-600">{{ formatRupiah(r.hargaJual) }}</div>
            </div>
            <div class="rounded-lg p-3 text-center border border-sky-100 bg-sky-50">
              <div class="text-xs font-bold text-sky-400 mb-1">KEUNTUNGAN</div>
              <div class="text-lg font-bold text-sky-600">{{ formatRupiah(r.keuntungan) }}</div>
            </div>
            <div class="rounded-lg p-3 text-center" style="background:#FFFA8D30;border:1.5px solid #FFFA8D">
              <div class="text-xs font-bold mb-1" style="color:#78350f;">MARGIN</div>
              <div class="text-lg font-bold" style="color:#78350f;">{{ r.margin.toFixed(1) }}%</div>
            </div>
          </div>
        </UCard>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
const { formatRupiah } = useFormat()
const { data, pending } = await useFetch('/api/hpp')
const { autoStartIfNew } = useAppTour()
const selected = ref<number | null>(null)
onMounted(autoStartIfNew)
</script>
