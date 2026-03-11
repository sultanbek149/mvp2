export const useAuth = () => {
  const user = useState<any>('auth_user', () => null)
  const loading = useState('auth_loading', () => false)
  const initialized = useState('auth_initialized', () => false)

  const fetchUser = async () => {
    try {
      loading.value = true
      const data = await $fetch('/api/auth/me')
      user.value = (data as any).user
      initialized.value = true
    } catch {
      user.value = null
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    const data = await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
    user.value = (data as any).user
    initialized.value = true
    await navigateTo('/dashboard')
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    initialized.value = false
    await navigateTo('/login')
  }

  const isRole = (...roles: string[]) => roles.includes(user.value?.role)
  const canManage = () => isRole('SUPER_ADMIN', 'ADMIN')
  const canDispatch = () => isRole('SUPER_ADMIN', 'ADMIN', 'DISPATCHER')

  return { user, loading, initialized, fetchUser, login, logout, isRole, canManage, canDispatch }
}
