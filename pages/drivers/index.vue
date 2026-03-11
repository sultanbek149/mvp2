<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button v-if="canManage()" @click="showForm = true" class="btn btn-primary">+ Добавить водителя</button>
    </div>

    <div class="card">
      <div class="card-header"><span class="label">Водительский состав</span><span class="ml-2 font-mono text-xs text-army-muted">({{ drivers.length }})</span></div>
      <table class="tbl">
        <thead><tr>
          <th>ФИО</th><th>Удостоверение</th><th>Категория</th><th>Срок ВУ</th><th>Телефон</th><th>Статус</th>
        </tr></thead>
        <tbody>
          <tr v-for="d in drivers" :key="d.id">
            <td class="font-display text-army-bright">{{ d.name }}</td>
            <td class="font-mono text-xs text-army-light">{{ d.licenseNumber }}</td>
            <td class="font-mono text-xs">{{ d.licenseCategory }}</td>
            <td>
              <span class="font-mono text-xs" :class="isExpiringSoon(d.licenseExpiry) ? 'text-yellow-400' : 'text-army-muted'">
                {{ fmtDate(d.licenseExpiry) }}
                <span v-if="isExpiringSoon(d.licenseExpiry)"> ⚠</span>
              </span>
            </td>
            <td class="font-mono text-xs text-army-muted">{{ d.phone || '—' }}</td>
            <td>
              <span class="mil-badge text-xs" :class="d.isActive ? 'bg-army-green/20 border-army-green/40 text-army-pale' : 'bg-army-border/40 border-army-border text-army-muted'">
                {{ d.isActive ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-md">
        <div class="card-header">
          <span class="label">Добавить водителя</span>
          <button @click="showForm = false" class="ml-auto text-army-muted hover:text-army-bright">✕</button>
        </div>
        <form @submit.prevent="createDriver" class="p-5 space-y-3">
          <div><label class="label block mb-1">ФИО</label><input v-model="form.name" class="inp" placeholder="Иванов Иван Иванович" required /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label block mb-1">№ удостоверения</label><input v-model="form.licenseNumber" class="inp" required /></div>
            <div><label class="label block mb-1">Категория</label><input v-model="form.licenseCategory" class="inp" placeholder="C" /></div>
          </div>
          <div><label class="label block mb-1">Срок действия ВУ</label><input v-model="form.licenseExpiry" type="date" class="inp" required /></div>
          <div><label class="label block mb-1">Телефон</label><input v-model="form.phone" class="inp" placeholder="+7 700 000 0000" /></div>
          <div v-if="error" class="text-red-400 font-mono text-xs">{{ error }}</div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn btn-primary flex-1">Добавить</button>
            <button type="button" @click="showForm = false" class="btn btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { canManage } = useAuth()
const showForm = ref(false)
const error = ref('')
const { data, refresh } = await useFetch('/api/drivers')
const drivers = computed(() => (data.value as any[]) || [])
const form = reactive({ name: '', licenseNumber: '', licenseCategory: 'C', licenseExpiry: '', phone: '' })

async function createDriver() {
  error.value = ''
  try {
    await $fetch('/api/drivers', { method: 'POST', body: form })
    showForm.value = false
    await refresh()
  } catch (e: any) { error.value = e?.data?.message || 'Ошибка' }
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
const isExpiringSoon = (d: string) => {
  const days = (new Date(d).getTime() - Date.now()) / 86400000
  return days < 90
}
</script>
