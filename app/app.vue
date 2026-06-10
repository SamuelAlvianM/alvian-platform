<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Paksa light mode — app ini tidak support dark mode
const colorMode = useColorMode()
colorMode.preference = 'light'
colorMode.value = 'light'
</script>
