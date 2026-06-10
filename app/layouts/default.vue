<template>
  <div class="flex min-h-screen" style="background:#f0f9ff;">
    <NuxtLoadingIndicator color="#4ED7F1" :height="3" />

    <!-- Backdrop overlay — mobile/tablet only -->
    <Transition name="sidebar-backdrop">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/40 z-20 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <AppSidebar />

    <!-- Main content — margin only on lg+ (sidebar is overlay on smaller screens) -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-60">
      <!-- Topbar -->
      <header class="sticky top-0 z-10 bg-white flex items-center px-4 py-3 gap-3" style="border-bottom:2px solid #A8F1FF;">
        <!-- Hamburger — mobile/tablet only -->
        <button
          class="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-sky-50 flex-shrink-0"
          @click="sidebarOpen = true"
        >
          <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-600" />
        </button>

        <h2 class="font-semibold text-gray-800 text-base flex-1 truncate">{{ pageTitle }}</h2>

        <!-- Jam realtime -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0" style="background:#f0f9ff; border:1.5px solid #A8F1FF;">
          <span class="text-base">🕐</span>
          <div class="text-right">
            <div class="font-bold text-sky-700 text-sm leading-none">{{ jam }}</div>
            <div class="text-xs text-gray-400 leading-none mt-0.5 hidden md:block">{{ tanggalHari }}</div>
          </div>
        </div>
        <UBadge color="sky" variant="subtle" size="md" class="hidden sm:flex flex-shrink-0">Alvian's Kitchen</UBadge>
      </header>

      <main class="flex-1 p-3 sm:p-5 lg:p-6 w-full">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = useSidebar()

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
  if (route.path === '/' && !localStorage.getItem('alvian_tour_global_done')) {
    setTimeout(() => {
      startTour('global')
      localStorage.setItem('alvian_tour_global_done', '1')
    }, 800)
  }
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.sidebar-backdrop-enter-active,
.sidebar-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.sidebar-backdrop-enter-from,
.sidebar-backdrop-leave-to {
  opacity: 0;
}
</style>
