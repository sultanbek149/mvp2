<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button v-for="s in statuses" :key="s.v" @click="filter = s.v"
          class="btn btn-sm" :class="filter === s.v ? 'btn-primary' : 'btn-secondary'">
          {{ s.l }}
        </button>
      </div>
      <NuxtLink v-if="canDispatch()" to="/waybills/new" class="btn btn-primary">+ Путевой лист</NuxtLink>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="font-semibold text-sm" style="color:var(--text)">Журнал путевых листов</span>
        <span class="ml-1 text-xs" style="color:var(--text-3)">({{ waybills.length }})</span>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead><tr><th>Номер</th><th>Дата</th><th>Автомобиль</th><th>Водитель</th><th>Маршрут</th><th>Топливо</th><th>Пробег</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            <tr v-for="wb in waybills" :key="wb.id">
              <td><span class="font-mono text-xs font-semibold" style="color:var(--brand)">{{ wb.number }}</span></td>
              <td class="text-xs font-mono" style="color:var(--text-3)">{{ fmtDate(wb.date) }}</td>
              <td class="text-xs">{{ wb.car?.brand }} <span class="font-mono" style="color:var(--brand)">{{ wb.car?.plateNumber }}</span></td>
              <td class="text-xs" style="color:var(--text-2)">{{ wb.driver?.name }}</td>
              <td class="text-xs max-w-32 truncate" style="color:var(--text-3)">{{ wb.routeStart || '—' }} → {{ wb.routeEnd || '—' }}</td>
              <td class="text-xs font-mono">
                <span style="color:var(--success)">+{{ wb.fuelAdded }}</span>
                <span v-if="wb.fuelConsumed" style="color:var(--danger)"> / -{{ wb.fuelConsumed?.toFixed(1) }}</span> л
              </td>
              <td class="text-xs font-mono" style="color:var(--text-2)">
                {{ wb.startMileage.toLocaleString() }}{{ wb.endMileage ? ' → ' + wb.endMileage.toLocaleString() : '' }}
              </td>
              <td><span class="badge" :class="statusBadge(wb.status)">{{ statusLabel(wb.status) }}</span></td>
              <td><NuxtLink :to="`/waybills/${wb.id}`" class="btn btn-secondary btn-sm">→</NuxtLink></td>
            </tr>
            <tr v-if="!waybills.length"><td colspan="9" class="text-center py-10 text-sm" style="color:var(--text-3)">Нет путевых листов</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { canDispatch } = useAuth()
const filter = ref('')
const statuses = [{ v: '', l: 'Все' }, { v: 'ACTIVE', l: 'Активные' }, { v: 'CLOSED', l: 'Закрытые' }, { v: 'CANCELLED', l: 'Отменённые' }]
const url = computed(() => `/api/waybills${filter.value ? `?status=${filter.value}` : ''}`)
const { data } = await useFetch(url)
const waybills = computed(() => (data.value as any[]) || [])
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
const statusBadge = (s: string) => ({ ACTIVE: 'badge-success', CLOSED: 'badge-neutral', CANCELLED: 'badge-danger', DRAFT: 'badge-info' }[s] || 'badge-neutral')
const statusLabel = (s: string) => ({ ACTIVE: 'Активен', CLOSED: 'Закрыт', CANCELLED: 'Отменён', DRAFT: 'Черновик' }[s] || s)
</script>
