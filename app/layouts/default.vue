<template>
  <div class="flex min-h-screen" style="background:#f0f9ff;">
    <AppSidebar />
    <div class="flex-1 flex flex-col" style="margin-left:240px;">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-3" style="border-bottom:2px solid #A8F1FF;">
        <h2 class="font-semibold text-gray-800 text-base">{{ pageTitle }}</h2>
        <div class="flex items-center gap-3">
          <!-- Jam realtime -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background:#f0f9ff; border:1.5px solid #A8F1FF;">
            <span class="text-base">🕐</span>
            <div class="text-right">
              <div class="font-bold text-sky-700 text-sm leading-none">{{ jam }}</div>
              <div class="text-xs text-gray-400 leading-none mt-0.5">{{ tanggalHari }}</div>
            </div>
          </div>
          <UBadge color="sky" variant="subtle" size="md">Alvian's Kitchen</UBadge>
        </div>
      </header>
      <main class="flex-1 p-6 w-full">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/bahan-baku': 'Bahan Baku',
  '/resep': 'Resep & Menu',
  '/klien': 'Klien & Toko',
  '/penjualan': 'Penjualan & Laporan',
  '/admin/users': 'Kelola User',
  '/hpp': 'Analisis HPP',
}
const pageTitle = computed(() => titles[route.path] ?? "Alvian's Kitchen")

const jam = ref('')
const tanggalHari = ref('')

function updateWaktu() {
  const now = new Date()
  jam.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  tanggalHari.value = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const { startTour } = useAppTour()

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  updateWaktu()
  timer = setInterval(updateWaktu, 1000)
  // Auto-start global tour hanya di dashboard, pertama kali saja
  if (route.path === '/' && !localStorage.getItem('alvian_tour_global_done')) {
    setTimeout(() => {
      startTour('global')
      localStorage.setItem('alvian_tour_global_done', '1')
    }, 800)
  }
})
onUnmounted(() => clearInterval(timer))
</script>
