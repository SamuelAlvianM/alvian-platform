<template>
  <aside
    :class="[
      'fixed left-0 top-0 bottom-0 flex flex-col z-30 transition-transform duration-300 ease-in-out',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
    style="width:240px; background:#4ED7F1;"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between py-4 px-3" style="border-bottom:1px solid rgba(15,38,53,0.1);">
      <div class="flex items-center justify-center flex-1">
        <img v-if="logoExist" :src="logoSrc" alt="Alvian's Kitchen" class="h-16 w-16 object-contain rounded-full" style="background:#0a0a3e;" @error="logoExist = false" />
        <div v-else class="h-16 w-16 rounded-full flex items-center justify-center" style="background:#0a0a3e; border:2px solid #A8F1FF;">
          <span style="font-size:1.4rem;">🍽️</span>
        </div>
      </div>
      <!-- Close button — mobile only -->
      <button
        class="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 flex-shrink-0"
        style="color:#0f2635;"
        @click="sidebarOpen = false"
      >
        <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
      </button>
    </div>

    <!-- Brand text -->
    <div class="text-center py-2 px-3" style="border-bottom:1px solid rgba(15,38,53,0.1);">
      <div class="font-brand text-sm font-semibold" style="color:#0f2635;">Alvian's Kitchen</div>
      <div class="text-xs" style="color:#1a4a5c; font-family:var(--font-outfit);">Toko Kue & Masakan · Since 1999</div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :id="item.tourId"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 no-underline"
        :style="route.path === item.to
          ? 'background:#A8F1FF; color:#0f2635; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.08);'
          : 'color:#0f3a4a; font-weight:500;'"
        :class="route.path !== item.to ? 'hover:bg-black/10' : ''"
        @click="sidebarOpen = false"
      >
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background:#FFFA8D;">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>

      <!-- Admin only -->
      <NuxtLink
        v-if="isAdmin"
        to="/admin/users"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 no-underline"
        :style="route.path === '/admin/users'
          ? 'background:#A8F1FF; color:#0f2635; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.08);'
          : 'color:#0f3a4a; font-weight:500;'"
        :class="route.path !== '/admin/users' ? 'hover:bg-black/10' : ''"
        @click="sidebarOpen = false"
      >
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background:#FFFA8D;">👥</span>
        <span>Kelola User</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-3 space-y-2" style="border-top:1px solid rgba(15,38,53,0.1);">
      <button
        id="tour-repeat-btn"
        @click="startTour()"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-black/10"
        style="color:#0f3a4a;"
      >
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background:#FFFA8D;">📖</span>
        Tutorial Halaman Ini
      </button>
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-black/10"
        style="color:#7c2d12;"
      >
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background:#FEE2E2;">🚪</span>
        Keluar ({{ username }})
      </button>
      <div class="text-center text-xs pt-1" style="color:#1a4a5c;">v1.0.0 · Nuxt 4 + NuxtUI</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = useSidebar()
const logoSrc = '/logo.png'
const logoExist = ref(true)
const { startTour } = useAppTour()

const { data: me } = await useFetch('/api/auth/me')
const username = computed(() => (me.value as any)?.username ?? '')
const isAdmin = computed(() => (me.value as any)?.isAdmin ?? false)

const navItems = [
  { to: '/',          icon: '🏠', label: 'Dashboard',          tourId: 'tour-nav-dashboard' },
  { to: '/bahan-baku',icon: '🧂', label: 'Bahan Baku',         tourId: 'tour-nav-bahan' },
  { to: '/resep',     icon: '🍽️', label: 'Resep & Menu',        tourId: 'tour-nav-resep' },
  { to: '/klien',     icon: '🏪', label: 'Klien & Toko',        tourId: 'tour-nav-klien' },
  { to: '/penjualan', icon: '🛒', label: 'Penjualan & Laporan', tourId: 'tour-nav-penjualan' },
  { to: '/hpp',       icon: '📊', label: 'Analisis HPP',        tourId: 'tour-nav-hpp' },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>
