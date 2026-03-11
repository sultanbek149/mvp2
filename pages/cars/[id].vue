<template>
  <div v-if="car" class="space-y-6">
    <div class="flex items-start gap-4">
      <NuxtLink to="/cars" class="btn btn-secondary py-1.5 px-3 text-xs">← Назад</NuxtLink>
      <div>
        <h1 class="font-display text-2xl font-bold text-army-bright">{{ car.brand }} {{ car.model }}</h1>
        <div class="font-mono text-sm text-army-light">{{ car.plateNumber }}</div>
      </div>
      <div class="ml-auto flex gap-2">
        <span class="badge text-sm px-3 py-1" :class="statusBadge(car.status)">{{ statusLabel(car.status) }}</span>
      </div>
    </div>

    <!-- TO Alerts -->
    <div v-if="car.maintenanceAlerts?.length" class="space-y-2">
      <div v-for="alert in car.maintenanceAlerts" :key="alert.type"
        class="flex items-center gap-3 p-3 rounded-sm border"
        :class="alert.overdue ? 'bg-rust/10 border-rust/40' : 'bg-warn/10 border-warn/40'">
        <span>{{ alert.overdue ? '🔴' : '🟡' }}</span>
        <span class="font-mono text-sm" :class="alert.overdue ? 'text-red-400' : 'text-yellow-400'">
          {{ alert.type }}: {{ alert.overdue ? `Просрочено на ${Math.abs(alert.kmLeft)} км!` : `До следующего ТО ${alert.kmLeft} км` }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-4"><div class="label mb-1">Год выпуска</div><div class="font-display text-xl text-army-bright">{{ car.year }}</div></div>
      <div class="card p-4"><div class="label mb-1">Тип топлива</div><div class="font-display text-xl text-army-bright">{{ fuelTypeLabel(car.fuelType) }}</div></div>
      <div class="card p-4">
        <div class="label mb-1">Топливо</div>
        <div class="font-display text-xl text-army-bright">{{ car.fuelBalance.toFixed(1) }} л</div>
        <div class="text-xs font-mono text-army-muted">из {{ car.tankCapacity }} л</div>
        <div class="mt-2 h-1.5 bg-army-darker rounded-full">
          <div class="h-full rounded-full" :class="fuelColor(car)" :style="`width:${Math.min(100,(car.fuelBalance/car.tankCapacity)*100)}%`" />
        </div>
      </div>
      <div class="card p-4"><div class="label mb-1">Пробег</div><div class="font-display text-xl text-army-bright">{{ car.totalMileage.toLocaleString() }} км</div></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <div class="card-header"><span class="label">Последние путевые листы</span></div>
        <table class="tbl">
          <thead><tr><th>Номер</th><th>Водитель</th><th>Дата</th><th>Статус</th></tr></thead>
          <tbody>
            <tr v-for="wb in car.waybills" :key="wb.id" @click="navigateTo(`/waybills/${wb.id}`)" class="cursor-pointer">
              <td class="font-mono text-xs text-army-light">{{ wb.number }}</td>
              <td class="text-xs">{{ wb.driver?.name?.split(' ')[0] }}</td>
              <td class="font-mono text-xs text-army-muted">{{ fmtDate(wb.date) }}</td>
              <td><span class="badge text-xs" :class="wbBadge(wb.status)">{{ wbLabel(wb.status) }}</span></td>
            </tr>
            <tr v-if="!car.waybills?.length"><td colspan="4" class="text-center font-mono text-xs text-army-muted py-4">Нет путевых листов</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header"><span class="label">История ТО</span></div>
        <table class="tbl">
          <thead><tr><th>Тип</th><th>Пробег</th><th>Дата</th><th>Стоимость</th></tr></thead>
          <tbody>
            <tr v-for="m in car.maintenance" :key="m.id">
              <td><span class="badge text-xs bg-info/20 border-info/40 text-blue-300">{{ m.type }}</span></td>
              <td class="font-mono text-xs">{{ m.mileageAtService.toLocaleString() }} км</td>
              <td class="font-mono text-xs text-army-muted">{{ fmtDate(m.serviceDate) }}</td>
              <td class="font-mono text-xs">{{ m.cost ? m.cost.toLocaleString() + ' ₸' : '—' }}</td>
            </tr>
            <tr v-if="!car.maintenance?.length"><td colspan="4" class="text-center font-mono text-xs text-army-muted py-4">Нет записей ТО</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(`/api/cars/${route.params.id}`)
const car = computed(() => data.value as any)

const fuelColor = (car: any) => {
  const p = car.fuelBalance / car.tankCapacity
  return p > 0.5 ? 'bg-army-green' : p > 0.2 ? 'bg-warn' : 'bg-alert'
}
const statusBadge = (s: string) => ({ ACTIVE: 'bg-army-green/20 border-army-green/40 text-army-pale', MAINTENANCE: 'bg-warn/20 border-warn/40 text-yellow-300', INACTIVE: 'bg-army-border/40 border-army-border text-army-muted' }[s] || '')
const statusLabel = (s: string) => ({ ACTIVE: 'Активен', MAINTENANCE: 'На ТО', INACTIVE: 'Неактивен' }[s] || s)
const fuelTypeLabel = (s: string) => ({ DIESEL: 'Дизель', GASOLINE: 'Бензин', GAS: 'Газ', ELECTRIC: 'Электро' }[s] || s)
const wbBadge = (s: string) => ({ ACTIVE: 'bg-army-green/20 border-army-green/40 text-army-pale', CLOSED: 'bg-army-muted/20 border-army-muted text-army-muted', CANCELLED: 'bg-rust/20 border-rust/40 text-red-300', DRAFT: 'bg-info/20 border-info/40 text-blue-300' }[s] || '')
const wbLabel = (s: string) => ({ ACTIVE: 'Активен', CLOSED: 'Закрыт', CANCELLED: 'Отменён', DRAFT: 'Черновик' }[s] || s)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
</script>
