export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/change-password') return

  try {
    const me = await $fetch('/api/auth/me') as any
    if (me.mustChangePassword) return navigateTo('/change-password')
  } catch {
    return navigateTo('/login')
  }
})
