<template>
  <div class="space-y-5">
    <!-- Stat Cards -->
    <div class="grid grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Bahan Baku</span>
          <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">🧂</span>
        </div>
        <div class="text-3xl font-bold text-gray-800">{{ stats?.totalBahan ?? '—' }}</div>
        <div class="text-xs text-gray-400 mt-1">jenis bahan tersedia</div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Menu</span>
          <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">🍽️</span>
        </div>
        <div class="text-3xl font-bold text-gray-800">{{ stats?.totalResep ?? '—' }}</div>
        <div class="text-xs text-gray-400 mt-1">kue & masakan aktif</div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Penjualan</span>
          <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">🛒</span>
        </div>
        <div class="text-3xl font-bold text-gray-800">{{ stats?.penjualanBulanIni ?? '—' }}</div>
        <div class="text-xs text-gray-400 mt-1">transaksi bulan ini</div>
      </UCard>

      <UCard :ui="{ base: 'bg-gradient-to-br from-sky-400 to-sky-200' }">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-sky-800 uppercase tracking-wide">Pemasukan</span>
          <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg" style="background:#FFFA8D;">💰</span>
        </div>
        <div class="text-xl font-bold text-sky-900">{{ formatRupiah(stats?.pemasukanBulanIni ?? 0) }}</div>
        <div class="text-xs text-sky-700 mt-1">total bulan ini</div>
      </UCard>
    </div>

    <!-- Menu Per Kategori -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-gray-800">Menu per Kategori</h3>
          <NuxtLink to="/resep">
            <UButton color="sky" variant="ghost" size="xs" trailing-icon="i-heroicons-arrow-right">Kelola Menu</UButton>
          </NuxtLink>
        </div>
      </template>
      <div class="grid grid-cols-5 gap-3">
        <NuxtLink
          v-for="k in kategoriList"
          :key="k.key"
          :to="`/resep`"
          class="no-underline"
        >
          <div
            class="rounded-2xl p-4 text-center cursor-pointer transition-all hover:scale-105"
            :style="`background:${k.bg}; border:2px solid ${k.border};`"
          >
            <div class="text-3xl mb-2">{{ k.emoji }}</div>
            <div class="font-bold text-2xl" :style="`color:${k.textColor};`">
              {{ stats?.menuPerKategori?.[k.key] ?? 0 }}
            </div>
            <div class="text-xs font-semibold mt-1" :style="`color:${k.textColor};`">{{ k.label }}</div>
          </div>
        </NuxtLink>
      </div>
    </UCard>

    <!-- Quick Links + Recent Penjualan -->
    <div class="grid grid-cols-3 gap-5">
      <UCard class="col-span-1">
        <template #header>
          <h3 class="font-bold text-gray-800">Menu Cepat</h3>
        </template>
        <div class="space-y-2">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 p-3 rounded-xl no-underline transition-colors hover:bg-sky-50"
            style="border:1.5px solid #A8F1FF; color:#1a2332;"
          >
            <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0" style="background:#FFFA8D;">{{ link.icon }}</span>
            <div>
              <div class="font-semibold text-sm">{{ link.title }}</div>
              <div class="text-xs text-gray-400">{{ link.sub }}</div>
            </div>
          </NuxtLink>
        </div>
      </UCard>

      <UCard class="col-span-2" :ui="{ body: 'p-0' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-800">Penjualan Terbaru</h3>
            <NuxtLink to="/penjualan">
              <UButton color="sky" variant="ghost" size="xs" trailing-icon="i-heroicons-arrow-right">Lihat Semua</UButton>
            </NuxtLink>
          </div>
        </template>
        <div v-if="!stats?.recentPenjualan?.length" class="p-8 text-center text-gray-400">
          <div class="text-3xl mb-2">🛒</div>
          Belum ada data penjualan
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jumlah</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in stats.recentPenjualan" :key="p.id">
              <td>{{ formatTanggal(p.tanggal) }}</td>
              <td>{{ p.jumlah }} pcs</td>
              <td class="font-bold text-sky-700">{{ formatRupiah(p.totalHarga) }}</td>
            </tr>
          </tbody>
        </table>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatRupiah, formatTanggal } = useFormat()
const { data: stats } = await useFetch('/api/dashboard/stats')

const kategoriList = [
  { key: 'kue',      emoji: '🍰', label: 'Kue',      bg: '#FFF9E6', border: '#FFFA8D', textColor: '#78350f' },
  { key: 'masakan',  emoji: '🍛', label: 'Masakan',  bg: '#FFF0E6', border: '#FDBA74', textColor: '#7c2d12' },
  { key: 'minuman',  emoji: '🥤', label: 'Minuman',  bg: '#E6F9FF', border: '#A8F1FF', textColor: '#0f4a5c' },
  { key: 'snack',    emoji: '🍿', label: 'Snack',    bg: '#F0FFF4', border: '#86EFAC', textColor: '#14532d' },
  { key: 'lainnya',  emoji: '🍽️', label: 'Lainnya',  bg: '#F5F0FF', border: '#C4B5FD', textColor: '#4c1d95' },
]

const quickLinks = [
  { to: '/bahan-baku', icon: '🧂', title: 'Tambah Bahan Baku', sub: 'Kelola inventori bahan' },
  { to: '/resep',      icon: '🍽️', title: 'Tambah Menu',       sub: 'Kue, masakan, minuman' },
  { to: '/penjualan',  icon: '🛒', title: 'Catat Penjualan',   sub: 'Input transaksi hari ini' },
  { to: '/hpp',        icon: '📊', title: 'Lihat Analisis HPP', sub: 'Cek margin per produk' },
]
</script>
