<template>
  <aside class="fixed left-0 top-0 bottom-0 flex flex-col z-20" style="width:240px; background:#4ED7F1;">
    <!-- Logo -->
    <div class="flex items-center justify-center py-4 px-3" style="border-bottom:1px solid rgba(15,38,53,0.1);">
      <img
        v-if="logoExist"
        :src="logoSrc"
        alt="Alvian's Kitchen"
        class="h-20 w-20 object-contain rounded-full"
        style="background:#0a0a3e;"
        @error="logoExist = false"
      />
      <div v-else class="h-20 w-20 rounded-full flex items-center justify-center" style="background:#0a0a3e; border:2px solid #A8F1FF;">
        <span style="font-size:1.8rem;">🍽️</span>
      </div>
    </div>

    <!-- Brand text -->
    <div class="text-center py-2 px-3" style="border-bottom:1px solid rgba(15,38,53,0.1);">
      <div class="font-brand text-sm font-semibold" style="color:#0f2635;">Alvian's Kitchen</div>
      <div class="text-xs" style="color:#1a4a5c; font-family:var(--font-outfit);">Toko Kue & Masakan · Since 1999</div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-3 flex flex-col gap-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 no-underline"
        :style="route.path === item.to
          ? 'background:#A8F1FF; color:#0f2635; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.08);'
          : 'color:#0f3a4a; font-weight:500;'"
        :class="route.path !== item.to ? 'hover:bg-black/10' : ''"
      >
        <!-- Icon dengan bg kuning -->
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style="background:#FFFA8D;"
        >{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-3 text-center" style="border-top:1px solid rgba(15,38,53,0.1); color:#1a4a5c; font-size:0.7rem;">
      v1.0.0 · Nuxt 4 + NuxtUI
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const logoSrc = '/logo.png'
const logoExist = ref(true)

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/bahan-baku', icon: '🧂', label: 'Bahan Baku' },
  { to: '/resep', icon: '🍽️', label: 'Resep & Menu' },
  { to: '/penjualan', icon: '🛒', label: 'Penjualan' },
  { to: '/hpp', icon: '📊', label: 'Analisis HPP' },
]
</script>
