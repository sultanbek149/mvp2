<template>
  <div class="space-y-5">
    <!-- Filters -->
    <div class="card p-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex gap-2">
          <button v-for="t in types" :key="t.v" @click="type = t.v"
            class="mil-btn text-xs py-1.5" :class="type === t.v ? 'btn btn-primary' : 'btn btn-secondary'">
            {{ t.l }}
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <input v-model="dateFrom" type="date" class="inp text-xs py-1.5 w-36" />
          <span class="font-mono text-xs text-army-muted">—</span>
          <input v-model="dateTo" type="date" class="inp text-xs py-1.5 w-36" />
        </div>
      </div>
    </div>

    <!-- Fuel report -->
    <div v-if="type === 'fuel'" class="card">
      <div class="card-header"><span class="label">Отчёт по топливу</span></div>
      <table class="tbl">
        <thead><tr><th>Дата</th><th>Авто</th><th>Тип</th><th>Кол-во</th><th>Оператор</th></tr></thead>
        <tbody>
          <tr v-for="op in (reportData as any[])" :key="op.id">
            <td class="font-mono text-xs text-army-muted">{{ fmtDate(op.createdAt) }}</td>
            <td class="text-xs">{{ op.car?.brand }} {{ op.car?.plateNumber }}</td>
            <td><span class="badge text-xs" :class="op.type === 'REFUEL' ? 'bg-army-green/20 border-army-green/40 text-army-pale' : 'bg-rust/20 border-rust/40 text-red-300'">{{ op.type === 'REFUEL' ? '+Заправка' : '-Расход' }}</span></td>
            <td class="font-mono text-xs" :class="op.type === 'REFUEL' ? 'text-army-light' : 'text-red-400'">{{ op.type === 'REFUEL' ? '+' : '-' }}{{ op.amount.toFixed(1) }} л</td>
            <td class="text-xs text-army-muted">{{ op.operator?.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mileage report -->
    <div v-if="type === 'mileage'" class="card">
      <div class="card-header"><span class="label">Отчёт по пробегу</span></div>
      <table class="tbl">
        <thead><tr><th>Дата</th><th>Путевой лист</th><th>Авто</th><th>Водитель</th><th>Нач. пробег</th><th>Кон. пробег</th><th>Пройдено</th><th>Расход</th></tr></thead>
        <tbody>
          <tr v-for="wb in (reportData as any[])" :key="wb.id">
            <td class="font-mono text-xs text-army-muted">{{ fmtDate(wb.date) }}</td>
            <td class="font-mono text-xs text-army-light">{{ wb.number }}</td>
            <td class="text-xs">{{ wb.car?.brand }} {{ wb.car?.plateNumber }}</td>
            <td class="text-xs">{{ wb.driver?.name }}</td>
            <td class="font-mono text-xs">{{ wb.startMileage?.toLocaleString() }}</td>
            <td class="font-mono text-xs">{{ wb.endMileage?.toLocaleString() || '—' }}</td>
            <td class="font-mono text-xs text-army-light">{{ wb.endMileage ? (wb.endMileage - wb.startMileage).toLocaleString() + ' км' : '—' }}</td>
            <td class="font-mono text-xs text-red-400">{{ wb.fuelConsumed ? wb.fuelConsumed.toFixed(1) + ' л' : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const type = ref('fuel')
const dateFrom = ref(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
const dateTo = ref(new Date().toISOString().split('T')[0])

const types = [
  { v: 'fuel', l: 'Топливо' },
  { v: 'mileage', l: 'Пробег' },
]

const url = computed(() => `/api/reports?type=${type.value}&dateFrom=${dateFrom.value}&dateTo=${dateTo.value}`)
const { data: reportData } = await useFetch(url)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ru-RU')
</script>
