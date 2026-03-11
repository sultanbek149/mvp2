<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background:var(--bg)">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style="background:var(--brand)">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold" style="color:var(--text)">АвтоУчёт</h1>
        <p class="text-sm mt-1" style="color:var(--text-3)">Система учёта путевых листов</p>
      </div>

      <!-- Card -->
      <div class="card p-6">
        <h2 class="font-semibold text-base mb-5" style="color:var(--text)">Вход в систему</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="label block mb-1.5">Email</label>
            <input v-model="form.email" type="email" class="inp" placeholder="user@company.kz" autocomplete="username" required />
          </div>
          <div>
            <label class="label block mb-1.5">Пароль</label>
            <input v-model="form.password" type="password" class="inp" placeholder="••••••••" autocomplete="current-password" required />
          </div>

          <div v-if="error" class="alert-danger flex items-center gap-2">
            <span style="color:var(--danger)">⚠</span>
            <span class="text-sm" style="color:var(--danger)">{{ error }}</span>
          </div>

          <button type="submit" :disabled="loading" class="btn btn-primary w-full justify-center py-2.5 text-sm">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Выполняется вход...' : 'Войти' }}
          </button>
        </form>

        <!-- Demo accounts -->
        <div class="mt-5 pt-4 border-t" style="border-color:var(--border)">
          <p class="label text-center mb-3">Тестовые учётные записи</p>
          <div class="space-y-1.5">
            <button v-for="acc in demoAccounts" :key="acc.email"
              @click="fillDemo(acc)"
              class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors"
              style="background:var(--bg-3);color:var(--text-2)"
              onmouseover="this.style.background='var(--brand-pale)';this.style.color='var(--brand)'"
              onmouseout="this.style.background='var(--bg-3)';this.style.color='var(--text-2)'">
              <span class="font-medium">{{ acc.label }}</span>
              <span class="font-mono opacity-70">{{ acc.email }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Dark mode toggle -->
      <div class="text-center mt-4">
        <button @click="toggleTheme" class="text-xs transition-colors" style="color:var(--text-3)">
          {{ isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, user } = useAuth()
if (user.value) await navigateTo('/dashboard')

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const isDark = useState('dark_mode', () => false)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark.value)
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (process.client) {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
  }
}

const demoAccounts = [
  { label: 'Супер Админ',   email: 'superadmin@mil.local', password: 'Admin1234!' },
  { label: 'Администратор', email: 'admin@mil.local',       password: 'Admin1234!' },
  { label: 'Диспетчер',     email: 'dispatcher@mil.local',  password: 'Admin1234!' },
  { label: 'Водитель',      email: 'driver@mil.local',      password: 'Admin1234!' },
]

function fillDemo(acc: any) { form.email = acc.email; form.password = acc.password }

async function handleLogin() {
  error.value = ''
  loading.value = true
  try { await login(form.email, form.password) }
  catch (e: any) { error.value = e?.data?.message || 'Ошибка подключения к серверу' }
  finally { loading.value = false }
}
</script>
