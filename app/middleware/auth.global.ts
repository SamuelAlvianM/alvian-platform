export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/change-password') return

  try {
    // Forward cookie saat SSR (refresh browser) agar session terbaca
    const headers = useRequestHeaders(['cookie'])
    const me = await $fetch('/api/auth/me', { headers }) as any
    if (me.mustChangePassword) return navigateTo('/change-password')
  } catch {
    return navigateTo('/login')
  }
})
