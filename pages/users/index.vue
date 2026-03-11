<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button @click="showForm = true" class="btn btn-primary">+ Добавить пользователя</button>
    </div>

    <div class="card">
      <div class="card-header"><span class="label">Пользователи системы</span></div>
      <table class="tbl">
        <thead><tr><th>ФИО</th><th>Email</th><th>Роль</th><th>Телефон</th><th>Статус</th><th>Создан</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="font-display text-army-bright text-sm">{{ u.name }}</td>
            <td class="font-mono text-xs text-army-muted">{{ u.email }}</td>
            <td><span class="badge text-xs" :class="roleBadge(u.role)">{{ roleLabel(u.role) }}</span></td>
            <td class="font-mono text-xs text-army-muted">{{ u.phone || '—' }}</td>
            <td>
              <button @click="toggleActive(u)" class="badge text-xs cursor-pointer hover:opacity-80 transition"
                :class="u.isActive ? 'bg-army-green/20 border-army-green/40 text-army-pale' : 'bg-rust/20 border-rust/40 text-red-300'">
                {{ u.isActive ? 'Активен' : 'Заблокирован' }}
              </button>
            </td>
            <td class="font-mono text-xs text-army-muted">{{ fmtDate(u.createdAt) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-md">
        <div class="card-header">
          <span class="label">Создать пользователя</span>
          <button @click="showForm = false" class="ml-auto text-army-muted hover:text-army-bright">✕</button>
        </div>
        <form @submit.prevent="createUser" class="p-5 space-y-4">
          <div><label class="label block mb-1">ФИО</label><input v-model="form.name" class="inp" required /></div>
          <div><label class="label block mb-1">Email</label><input v-model="form.email" type="email" class="inp" required /></div>
          <div><label class="label block mb-1">Пароль</label><input v-model="form.password" type="password" class="inp" required minlength="6" /></div>
          <div>
            <label class="label block mb-1">Роль</label>
            <select v-model="form.role" class="inp" required>
              <option value="SUPER_ADMIN">Супер Админ</option>
              <option value="ADMIN">Администратор</option>
              <option value="DISPATCHER">Диспетчер</option>
              <option value="DRIVER">Водитель</option>
            </select>
          </div>
          <div><label class="label block mb-1">Телефон</label><input v-model="form.phone" class="inp" /></div>
          <div v-if="err" class="text-red-400 font-mono text-xs">{{ err }}</div>
          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary flex-1">Создать</button>
            <button type="button" @click="showForm = false" class="btn btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showForm = ref(false)
const err = ref('')
const { data, refresh } = await useFetch('/api/users')
const users = computed(() => (data.value as any[]) || [])
const form = reactive({ name: '', email: '', password: '', role: 'DISPATCHER', phone: '' })

async function createUser() {
  err.value = ''
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    showForm.value = false
    await refresh()
  } catch (e: any) { err.value = e?.data?.message || 'Ошибка' }
}

async function toggleActive(u: any) {
  await $fetch(`/api/users/${u.id}`, { method: 'PUT', body: { ...u, isActive: !u.isActive } })
  await refresh()
}

const roleBadge = (r: string) => ({ SUPER_ADMIN: 'bg-rust/20 border-rust/40 text-red-300', ADMIN: 'bg-warn/20 border-warn/40 text-yellow-300', DISPATCHER: 'bg-info/20 border-info/40 text-blue-300', DRIVER: 'bg-army-green/20 border-army-green/40 text-army-pale' }[r] || '')
const roleLabel = (r: string) => ({ SUPER_ADMIN: 'Супер Админ', ADMIN: 'Администратор', DISPATCHER: 'Диспетчер', DRIVER: 'Водитель' }[r] || r)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
</script>
