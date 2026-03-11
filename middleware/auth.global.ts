export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  // Skip on server-side - auth check happens client-side only
  if (process.server) return

  const { user, fetchUser } = useAuth()

  // Always verify token on page load/reload by hitting /api/auth/me
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
