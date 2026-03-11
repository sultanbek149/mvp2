<template>
  <div v-if="wb" class="space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/waybills" class="btn btn-secondary py-1.5 px-3 text-xs">← Назад</NuxtLink>
      <div>
        <h1 class="font-display text-xl font-bold text-army-bright">{{ wb.number }}</h1>
        <div class="font-mono text-xs text-army-muted">{{ fmtDateTime(wb.date) }}</div>
      </div>
      <div class="ml-auto">
        <span class="badge text-sm px-3 py-1" :class="statusBadge(wb.status)">{{ statusLabel(wb.status) }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Info -->
      <div class="card">
        <div class="card-header"><span class="label">Данные листа</span></div>
        <div class="p-5 space-y-3">
          <row label="Автомобиль" :value="`${wb.car?.brand} ${wb.car?.model} · ${wb.car?.plateNumber}`" />
          <row label="Водитель" :value="wb.driver?.name" />
          <row label="Создал" :value="wb.createdBy?.name" />
          <row label="Маршрут" :value="`${wb.routeStart || '—'} → ${wb.routeEnd || '—'}`" />
          <div class="border-t border-army-border pt-3 space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <div><div class="label mb-0.5">Нач. пробег</div><div class="font-mono text-army-bright">{{ wb.startMileage?.toLocaleString() }} км</div></div>
              <div><div class="label mb-0.5">Кон. пробег</div><div class="font-mono text-army-bright">{{ wb.endMileage?.toLocaleString() || '—' }} км</div></div>
              <div><div class="label mb-0.5">Топливо на выезде</div><div class="font-mono text-army-bright">{{ wb.fuelStart?.toFixed(1) }} л</div></div>
              <div><div class="label mb-0.5">Заправлено</div><div class="font-mono text-army-light">+{{ wb.fuelAdded?.toFixed(1) }} л</div></div>
              <div v-if="wb.fuelEnd != null"><div class="label mb-0.5">Топливо на возврате</div><div class="font-mono text-army-bright">{{ wb.fuelEnd?.toFixed(1) }} л</div></div>
              <div v-if="wb.fuelConsumed != null"><div class="label mb-0.5">Расход</div><div class="font-mono text-red-400">-{{ wb.fuelConsumed?.toFixed(1) }} л</div></div>
            </div>
          </div>
          <div v-if="wb.notes" class="border-t border-army-border pt-3">
            <div class="label mb-1">Примечания</div>
            <div class="text-sm text-army-text">{{ wb.notes }}</div>
          </div>
        </div>
      </div>

      <!-- Close form OR TO alerts -->
      <div class="space-y-4">
        <div v-if="wb.status === 'ACTIVE' && canDispatch()" class="card">
          <div class="card-header"><div class="w-2 h-2 bg-warn animate-pulse rounded-full" /><span class="label">Закрыть путевой лист</span></div>
          <form @submit.prevent="closeWaybill" class="p-5 space-y-4">
            <div>
              <label class="label block mb-1.5">Конечный пробег (км) *</label>
              <input v-model.number="closeForm.endMileage" type="number" :min="wb.startMileage" class="inp" :placeholder="`мин. ${wb.startMileage}`" required />
            </div>
            <div>
              <label class="label block mb-1.5">Топливо на возврате (л) *</label>
              <input v-model.number="closeForm.fuelEnd" type="number" min="0" step="0.1" class="inp"
                :placeholder="`макс. ${(wb.fuelStart + wb.fuelAdded).toFixed(1)}`" required />
              <div class="font-mono text-xs text-army-muted mt-1">Расход: {{ calcConsumption }} л</div>
            </div>
            <div v-if="toAlerts.length" class="space-y-1">
              <div v-for="a in toAlerts" :key="a.type" class="p-2 rounded-sm border text-xs font-mono"
                :class="a.overdue ? 'bg-rust/10 border-rust/40 text-red-300' : 'bg-warn/10 border-warn/40 text-yellow-400'">
                ⚠ {{ a.type }}: {{ a.overdue ? `просрочено!` : `осталось ${a.kmLeft} км` }}
              </div>
            </div>
            <div v-if="closeError" class="text-red-400 font-mono text-xs">{{ closeError }}</div>
            <button type="submit" :disabled="closing" class="btn btn-primary w-full justify-center py-2.5">
              {{ closing ? 'Закрытие...' : 'Закрыть путевой лист' }}
            </button>
          </form>
        </div>

        <!-- Fuel ops history -->
        <div class="card">
          <div class="card-header"><span class="label">Операции с топливом</span></div>
          <table class="tbl">
            <thead><tr><th>Тип</th><th>Кол-во</th><th>Остаток</th><th>Оператор</th></tr></thead>
            <tbody>
              <tr v-for="op in wb.fuelOps" :key="op.id">
                <td><span class="badge text-xs" :class="op.type === 'REFUEL' ? 'bg-army-green/20 border-army-green/40 text-army-pale' : 'bg-rust/20 border-rust/40 text-red-300'">
                  {{ op.type === 'REFUEL' ? '+ Заправка' : '- Расход' }}
                </span></td>
                <td class="font-mono text-xs font-bold" :class="op.type === 'REFUEL' ? 'text-army-light' : 'text-red-400'">
                  {{ op.type === 'REFUEL' ? '+' : '-' }}{{ op.amount.toFixed(1) }} л
                </td>
                <td class="font-mono text-xs">{{ op.balanceAfter.toFixed(1) }} л</td>
                <td class="text-xs text-army-muted">{{ op.operator?.name }}</td>
              </tr>
              <tr v-if="!wb.fuelOps?.length"><td colspan="4" class="text-center font-mono text-xs text-army-muted py-4">Нет операций</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { canDispatch } = useAuth()
const { data, refresh } = await useFetch(`/api/waybills/${route.params.id}`)
const wb = computed(() => data.value as any)

const closeForm = reactive({ endMileage: 0, fuelEnd: 0 })
const closeError = ref('')
const closing = ref(false)
const toAlerts = ref<any[]>([])

const calcConsumption = computed(() => {
  if (!wb.value) return '0.0'
  const total = wb.value.fuelStart + wb.value.fuelAdded
  return Math.max(0, total - (closeForm.fuelEnd || 0)).toFixed(1)
})

async function closeWaybill() {
  closeError.value = ''
  closing.value = true
  try {
    const result = await $fetch(`/api/waybills/${route.params.id}/close`, {
      method: 'PATCH', body: closeForm
    })
    toAlerts.value = (result as any).maintenanceAlerts || []
    await refresh()
  } catch (e: any) {
    closeError.value = e?.data?.message || 'Ошибка закрытия'
  } finally {
    closing.value = false
  }
}

const fmtDateTime = (d: string) => new Date(d).toLocaleString('ru-RU')
const statusBadge = (s: string) => ({ ACTIVE: 'bg-army-green/20 border-army-green/40 text-army-pale', CLOSED: 'bg-army-border/40 border-army-border text-army-muted', CANCELLED: 'bg-rust/20 border-rust/40 text-red-300' }[s] || '')
const statusLabel = (s: string) => ({ ACTIVE: 'Активен', CLOSED: 'Закрыт', CANCELLED: 'Отменён' }[s] || s)
</script>

<!-- Reusable row component -->
<script lang="ts">
import { defineComponent, h } from 'vue'
const row = defineComponent({
  props: { label: String, value: String },
  setup(props) {
    return () => h('div', { class: 'flex justify-between items-start gap-2' }, [
      h('span', { class: 'label flex-shrink-0' }, props.label),
      h('span', { class: 'font-body text-sm text-army-bright text-right' }, props.value || '—'),
    ])
  }
})
export default { components: { row } }
</script>
