<template>
  <div class="min-h-screen flex" style="background:var(--bg)">
    <aside class="w-60 flex-shrink-0 flex flex-col border-r" style="background:var(--bg-2);border-color:var(--border);min-height:100vh">
      <!-- Logo -->
      <div class="px-4 py-4 border-b" style="border-color:var(--border)">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--brand)">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <div class="font-semibold text-sm leading-tight" style="color:var(--text)">АвтоУчёт</div>
            <div class="text-xs" style="color:var(--text-3)">Путевые листы</div>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        <template v-for="group in navGroups" :key="group.label">
          <template v-if="showGroup(group)">
            <div class="section-label">{{ group.label }}</div>
            <template v-for="item in group.items" :key="item.path">
              <NuxtLink v-if="canSee(item)" :to="item.path" class="nav-link" :class="{ active: isActive(item.path) }">
                <span class="text-base leading-none">{{ item.icon }}</span>
                <span class="flex-1">{{ item.label }}</span>
              </NuxtLink>
            </template>
          </template>
        </template>
      </nav>

      <!-- Bottom -->
      <div class="border-t p-3 space-y-2" style="border-color:var(--border)">
        <button @click="toggleTheme" class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:opacity-80" style="color:var(--text-2);background:var(--bg-3)">
          <span class="text-base">{{ isDark ? '☀️' : '🌙' }}</span>
          <span class="text-sm font-medium">{{ isDark ? 'Светлая тема' : 'Тёмная тема' }}</span>
        </button>
        <div class="flex items-center gap-3 px-3 py-2 rounded-md" style="background:var(--bg-3)">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style="background:var(--brand)">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-semibold truncate" style="color:var(--text)">{{ user?.name?.split(' ')[0] }}</div>
            <div class="text-xs" style="color:var(--text-3)">{{ roleLabel }}</div>
          </div>
          <button @click="logout" title="Выйти" class="hover:text-red-500 transition-colors" style="color:var(--text-3)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 flex items-center px-6 border-b flex-shrink-0" style="background:var(--bg-2);border-color:var(--border)">
        <h1 class="font-semibold text-base" style="color:var(--text)">{{ currentPageTitle }}</h1>
        <div class="ml-auto text-xs font-mono" style="color:var(--text-3)">{{ now }}</div>
      </header>
      <main class="flex-1 overflow-auto p-6"><slot /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout, isRole } = useAuth()
const route = useRoute()

const isDark = useState('dark_mode', () => false)

function toggleTheme() {
  isDark.value = !isDark.value
  if (process.client) {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark.value)
})

const now = ref('')
onMounted(() => {
  const tick = () => { now.value = new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) }
  tick(); setInterval(tick, 60000)
})

const navGroups = [
  { label: 'Оперативный учёт', roles: null, items: [
    { path: '/dashboard',   label: 'Сводка',            icon: '📊', roles: null },
    { path: '/waybills',    label: 'Путевые листы',     icon: '📋', roles: null },
    { path: '/fuel',        label: 'Топливо',           icon: '⛽', roles: ['SUPER_ADMIN','ADMIN','DISPATCHER'] },
    { path: '/map',         label: 'Карта',             icon: '🗺️', roles: null },
  ]},
  { label: 'Автопарк', roles: ['SUPER_ADMIN','ADMIN','DISPATCHER'], items: [
    { path: '/cars',        label: 'Автомобили',        icon: '🚛', roles: ['SUPER_ADMIN','ADMIN','DISPATCHER'] },
    { path: '/drivers',     label: 'Водители',          icon: '👤', roles: ['SUPER_ADMIN','ADMIN'] },
    { path: '/maintenance', label: 'Тех. обслуживание', icon: '🔧', roles: ['SUPER_ADMIN','ADMIN','DISPATCHER'] },
  ]},
  { label: 'Аналитика', roles: ['SUPER_ADMIN','ADMIN'], items: [
    { path: '/reports',     label: 'Отчёты',            icon: '📈', roles: ['SUPER_ADMIN','ADMIN'] },
  ]},
  { label: 'Администрирование', roles: ['SUPER_ADMIN'], items: [
    { path: '/users',       label: 'Пользователи',      icon: '👥', roles: ['SUPER_ADMIN'] },
  ]},
]

const canSee = (item: any) => !item.roles || isRole(...item.roles)
const showGroup = (group: any) => !group.roles || isRole(...group.roles)
const isActive = (path: string) => path === '/dashboard' ? route.path === path : route.path.startsWith(path)
const allItems = navGroups.flatMap(g => g.items)
const currentPageTitle = computed(() => allItems.find(i => isActive(i.path))?.label || 'АвтоУчёт')
const userInitials = computed(() => user.value?.name?.split(' ').map((w: string) => w[0]).slice(0,2).join('') || '?')
const roleLabel = computed(() => ({ SUPER_ADMIN: 'Супер Админ', ADMIN: 'Администратор', DISPATCHER: 'Диспетчер', DRIVER: 'Водитель' }[user.value?.role as string] || user.value?.role))
</script>
