<template>
  <div class="space-y-6">
    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card">
        <div class="label mb-2">Автомобилей</div>
        <div class="text-3xl font-bold" style="color:var(--text)">{{ s.totalCars || 0 }}</div>
        <div class="text-xs mt-1" style="color:var(--text-3)">активных: {{ s.activeCars || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="label mb-2">В рейсе</div>
        <div class="text-3xl font-bold" style="color:var(--brand)">{{ s.activeWaybills || 0 }}</div>
        <div class="text-xs mt-1" style="color:var(--text-3)">из {{ s.totalWaybills || 0 }} путевых листов</div>
      </div>
      <div class="stat-card">
        <div class="label mb-2">Уведомлений ТО</div>
        <div class="text-3xl font-bold" :style="toAlerts.length ? 'color:var(--warning)' : 'color:var(--text)'">{{ toAlerts.length }}</div>
        <div class="text-xs mt-1" :style="toAlerts.some(a => a.alerts?.some((x:any) => x.overdue)) ? 'color:var(--danger)' : 'color:var(--text-3)'">
          {{ toAlerts.some(a => a.alerts?.some((x:any) => x.overdue)) ? 'есть просроченные!' : 'всё в норме' }}
        </div>
      </div>
      <div class="stat-card">
        <div class="label mb-2">Заправка сегодня</div>
        <div class="text-3xl font-bold" style="color:var(--text)">{{ (s.fuelRefueledToday || 0).toFixed(0) }}</div>
        <div class="text-xs mt-1" style="color:var(--text-3)">литров</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Active waybills -->
      <div class="card">
        <div class="card-header">
          <div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--brand)" />
          <span class="font-semibold text-sm" style="color:var(--text)">Активные путевые листы</span>
          <NuxtLink v-if="canDispatch()" to="/waybills/new" class="btn btn-primary btn-sm ml-auto">+ Создать</NuxtLink>
        </div>
        <table class="tbl">
          <thead><tr><th>Номер</th><th>Авто</th><th>Водитель</th><th>Дата</th></tr></thead>
          <tbody>
            <tr v-for="wb in activeWaybills" :key="wb.id" @click="navigateTo(`/waybills/${wb.id}`)" class="cursor-pointer">
              <td><span class="font-mono text-xs font-semibold" style="color:var(--brand)">{{ wb.number }}</span></td>
              <td class="text-xs">{{ wb.car?.brand }} <span class="font-mono" style="color:var(--brand)">{{ wb.car?.plateNumber }}</span></td>
              <td class="text-xs" style="color:var(--text-2)">{{ wb.driver?.name?.split(' ')[0] }} {{ wb.driver?.name?.split(' ')[1] }}</td>
              <td class="text-xs font-mono" style="color:var(--text-3)">{{ fmtDate(wb.date) }}</td>
            </tr>
            <tr v-if="!activeWaybills.length">
              <td colspan="4" class="text-center py-8 text-sm" style="color:var(--text-3)">Нет активных путевых листов</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TO Alerts -->
      <div class="card">
        <div class="card-header">
          <div class="w-2 h-2 rounded-full" :style="toAlerts.length ? 'background:var(--warning)' : 'background:var(--text-3)'" />
          <span class="font-semibold text-sm" style="color:var(--text)">Уведомления о ТО</span>
          <NuxtLink to="/maintenance" class="btn btn-secondary btn-sm ml-auto">Открыть →</NuxtLink>
        </div>
        <div class="p-4 space-y-2">
          <div v-if="!toAlerts.length" class="text-center py-6 text-sm" style="color:var(--text-3)">
            ✅ Все автомобили в норме
          </div>
          <div v-for="item in toAlerts" :key="item.car.id"
            class="rounded-lg p-3 border"
            :class="item.alerts.some((a:any) => a.overdue) ? 'alert-danger' : 'alert-warning'">
            <div class="font-semibold text-sm" style="color:var(--text)">
              {{ item.car.brand }} {{ item.car.model }}
              <span class="font-mono ml-1" style="color:var(--brand)">{{ item.car.plateNumber }}</span>
            </div>
            <div v-for="alert in item.alerts" :key="alert.type" class="text-xs mt-1"
              :style="alert.overdue ? 'color:var(--danger)' : 'color:var(--warning)'">
              {{ alert.type }}: {{ alert.overdue ? `ПРОСРОЧЕНО на ${Math.abs(alert.kmLeft)} км` : `через ${alert.kmLeft} км` }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent fuel ops -->
    <div class="card">
      <div class="card-header">
        <span class="font-semibold text-sm" style="color:var(--text)">Последние операции с топливом</span>
        <NuxtLink to="/fuel" class="btn btn-secondary btn-sm ml-auto">Все операции →</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead><tr><th>Время</th><th>Авто</th><th>Тип</th><th>Кол-во</th><th>Остаток</th><th>Оператор</th></tr></thead>
          <tbody>
            <tr v-for="op in fuelOps" :key="op.id">
              <td class="text-xs font-mono" style="color:var(--text-3)">{{ fmtDateTime(op.createdAt) }}</td>
              <td class="text-xs">{{ op.car?.brand }} <span class="font-mono" style="color:var(--brand)">{{ op.car?.plateNumber }}</span></td>
              <td>
                <span class="badge" :class="op.type === 'REFUEL' ? 'badge-success' : 'badge-danger'">
                  {{ op.type === 'REFUEL' ? '+ Заправка' : '- Расход' }}
                </span>
              </td>
              <td class="font-mono text-sm font-semibold" :style="op.type === 'REFUEL' ? 'color:var(--success)' : 'color:var(--danger)'">
                {{ op.type === 'REFUEL' ? '+' : '-' }}{{ op.amount.toFixed(1) }} л
              </td>
              <td class="font-mono text-sm" style="color:var(--text-2)">{{ op.balanceAfter.toFixed(1) }} л</td>
              <td class="text-xs" style="color:var(--text-3)">{{ op.operator?.name }}</td>
            </tr>
            <tr v-if="!fuelOps.length">
              <td colspan="6" class="text-center py-8 text-sm" style="color:var(--text-3)">Нет операций</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { canDispatch } = useAuth()
const { data: summary } = await useFetch('/api/reports?type=summary')
const { data: waybillsData } = await useFetch('/api/waybills?status=ACTIVE')
const { data: toData } = await useFetch('/api/maintenance?alerts=true')
const { data: fuelData } = await useFetch('/api/fuel')

const activeWaybills = computed(() => (waybillsData.value as any[]) || [])
const toAlerts = computed(() => (toData.value as any[]) || [])
const fuelOps = computed(() => ((fuelData.value as any[]) || []).slice(0, 8))
const s = computed(() => (summary.value as any) || {})

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
const fmtDateTime = (d: string) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
</script>
