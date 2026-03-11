<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button v-if="canDispatch()" @click="showForm = true" class="btn btn-primary">+ Добавить запись ТО</button>
    </div>

    <!-- Alerts -->
    <div v-if="alerts.length" class="card border-warn/40">
      <div class="card-header">
        <div class="w-2 h-2 bg-warn rounded-full animate-pulse" />
        <span class="label text-yellow-400">Требуют внимания ({{ alerts.length }})</span>
      </div>
      <div class="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div v-for="item in alerts" :key="item.car.id" class="p-3 rounded-sm border border-army-border bg-army-darker">
          <div class="font-display text-sm text-army-bright mb-1">{{ item.car.brand }} {{ item.car.model }} · <span class="font-mono text-army-light">{{ item.car.plateNumber }}</span></div>
          <div v-for="a in item.alerts" :key="a.type" class="font-mono text-xs"
            :class="a.overdue ? 'text-red-400' : 'text-yellow-400'">
            {{ a.type }}: {{ a.overdue ? `ПРОСРОЧЕНО на ${Math.abs(a.kmLeft)} км` : `через ${a.kmLeft} км` }}
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div class="card">
      <div class="card-header"><span class="label">Журнал технического обслуживания</span></div>
      <table class="tbl">
        <thead><tr>
          <th>Дата</th><th>Автомобиль</th><th>Тип</th><th>Пробег</th><th>Следующее ТО</th><th>Стоимость</th><th>Описание</th>
        </tr></thead>
        <tbody>
          <tr v-for="m in records" :key="m.id">
            <td class="font-mono text-xs text-army-muted">{{ fmtDate(m.serviceDate) }}</td>
            <td class="text-xs">{{ m.car?.brand }} <span class="font-mono text-army-light">{{ m.car?.plateNumber }}</span></td>
            <td><span class="mil-badge text-xs bg-info/20 border-info/40 text-blue-300">{{ m.type }}</span></td>
            <td class="font-mono text-xs">{{ m.mileageAtService.toLocaleString() }} км</td>
            <td class="font-mono text-xs text-army-muted">{{ m.nextServiceMileage.toLocaleString() }} км</td>
            <td class="font-mono text-xs">{{ m.cost ? m.cost.toLocaleString() + ' ₸' : '—' }}</td>
            <td class="text-xs text-army-muted max-w-40 truncate">{{ m.description || '—' }}</td>
          </tr>
          <tr v-if="!records.length"><td colspan="7" class="text-center font-mono text-xs text-army-muted py-8">Нет записей</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-lg">
        <div class="card-header">
          <span class="label">Добавить запись ТО</span>
          <button @click="showForm = false" class="ml-auto text-army-muted hover:text-army-bright">✕</button>
        </div>
        <form @submit.prevent="createRecord" class="p-5 space-y-4">
          <div>
            <label class="label block mb-1.5">Автомобиль</label>
            <select v-model="form.carId" @change="onCarChange" class="inp" required>
              <option value="">— Выберите —</option>
              <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.brand }} {{ c.plateNumber }} ({{ c.totalMileage.toLocaleString() }} км)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label block mb-1.5">Тип ТО</label>
              <select v-model="form.type" @change="updateNextMileage" class="inp" required>
                <option value="TO1">ТО-1 (каждые 10 000 км)</option>
                <option value="TO2">ТО-2 (каждые 30 000 км)</option>
                <option value="TO3">ТО-3 (каждые 60 000 км)</option>
                <option value="REPAIR">Ремонт</option>
                <option value="OTHER">Прочее</option>
              </select>
            </div>
            <div>
              <label class="label block mb-1.5">Дата</label>
              <input v-model="form.serviceDate" type="date" class="inp" required />
            </div>
            <div>
              <label class="label block mb-1.5">Пробег при ТО</label>
              <input v-model.number="form.mileageAtService" @change="updateNextMileage" type="number" class="inp" required />
            </div>
            <div>
              <label class="label block mb-1.5">Следующее ТО (км)</label>
              <input v-model.number="form.nextServiceMileage" type="number" class="inp" required />
            </div>
            <div>
              <label class="label block mb-1.5">Стоимость (₸)</label>
              <input v-model.number="form.cost" type="number" class="inp" placeholder="0" />
            </div>
          </div>
          <div><label class="label block mb-1.5">Описание работ</label><textarea v-model="form.description" class="inp h-16 resize-none" placeholder="Что было сделано..." /></div>
          <div v-if="err" class="text-red-400 font-mono text-xs">{{ err }}</div>
          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary flex-1">Сохранить</button>
            <button type="button" @click="showForm = false" class="btn btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { canDispatch } = useAuth()
const showForm = ref(false)
const err = ref('')
const { data: recordsData, refresh } = await useFetch('/api/maintenance')
const { data: alertsData } = await useFetch('/api/maintenance?alerts=true')
const { data: carsData } = await useFetch('/api/cars')

const records = computed(() => (recordsData.value as any[]) || [])
const alerts = computed(() => (alertsData.value as any[]) || [])
const cars = computed(() => (carsData.value as any[]) || [])

const TO_INTERVALS: Record<string, number> = { TO1: 10000, TO2: 30000, TO3: 60000 }
const form = reactive({ carId: '', type: 'TO1', mileageAtService: 0, nextServiceMileage: 10000, serviceDate: new Date().toISOString().split('T')[0], cost: null as any, description: '' })

function onCarChange() {
  const c = cars.value.find((c: any) => c.id === form.carId)
  if (c) { form.mileageAtService = c.totalMileage; updateNextMileage() }
}
function updateNextMileage() {
  const interval = TO_INTERVALS[form.type]
  if (interval) form.nextServiceMileage = form.mileageAtService + interval
}

async function createRecord() {
  err.value = ''
  try {
    await $fetch('/api/maintenance', { method: 'POST', body: form })
    showForm.value = false
    await refresh()
  } catch (e: any) { err.value = e?.data?.message || 'Ошибка' }
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
</script>
