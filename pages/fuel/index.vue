<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button @click="showRefuel = true" class="btn btn-primary">⛽ Заправить автомобиль</button>
    </div>

    <div class="card">
      <div class="card-header"><span class="label">Журнал операций с топливом</span></div>
      <table class="tbl">
        <thead><tr>
          <th>Дата / Время</th><th>Автомобиль</th><th>Тип</th><th>Кол-во, л</th><th>До</th><th>После</th><th>Путевой лист</th><th>Оператор</th>
        </tr></thead>
        <tbody>
          <tr v-for="op in ops" :key="op.id">
            <td class="font-mono text-xs text-army-muted">{{ fmtDT(op.createdAt) }}</td>
            <td class="text-xs">{{ op.car?.brand }} <span class="font-mono text-army-light">{{ op.car?.plateNumber }}</span></td>
            <td>
              <span class="badge text-xs" :class="op.type === 'REFUEL' ? 'bg-army-green/20 border-army-green/40 text-army-pale' : op.type === 'CONSUMPTION' ? 'bg-rust/20 border-rust/40 text-red-300' : 'bg-info/20 border-info/40 text-blue-300'">
                {{ typeLabel(op.type) }}
              </span>
            </td>
            <td class="font-mono text-sm font-bold" :class="op.type === 'REFUEL' ? 'text-army-light' : 'text-red-400'">
              {{ op.type === 'REFUEL' ? '+' : '-' }}{{ op.amount.toFixed(1) }}
            </td>
            <td class="font-mono text-xs text-army-muted">{{ op.balanceBefore.toFixed(1) }}</td>
            <td class="font-mono text-xs text-army-bright">{{ op.balanceAfter.toFixed(1) }}</td>
            <td class="font-mono text-xs text-army-muted">{{ op.waybill?.number || '—' }}</td>
            <td class="text-xs text-army-muted">{{ op.operator?.name }}</td>
          </tr>
          <tr v-if="!ops.length"><td colspan="8" class="text-center font-mono text-xs text-army-muted py-8">Нет операций</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Refuel modal -->
    <div v-if="showRefuel" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-md">
        <div class="card-header">
          <span class="label">Заправка автомобиля</span>
          <button @click="showRefuel = false" class="ml-auto text-army-muted hover:text-army-bright">✕</button>
        </div>
        <form @submit.prevent="doRefuel" class="p-5 space-y-4">
          <div>
            <label class="label block mb-1.5">Автомобиль</label>
            <select v-model="form.carId" @change="onCarChange" class="inp" required>
              <option value="">— Выберите —</option>
              <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.brand }} {{ c.plateNumber }} ({{ c.fuelBalance.toFixed(1) }} л)</option>
            </select>
          </div>
          <div v-if="selCar" class="p-3 bg-army-darker border border-army-border rounded-sm font-mono text-xs">
            Остаток: <span class="text-army-light">{{ selCar.fuelBalance.toFixed(1) }} л</span> /
            Бак: <span class="text-army-bright">{{ selCar.tankCapacity }} л</span> /
            Макс. заправка: <span class="text-army-light">{{ (selCar.tankCapacity - selCar.fuelBalance).toFixed(1) }} л</span>
          </div>
          <div>
            <label class="label block mb-1.5">Объём заправки (л)</label>
            <input v-model.number="form.amount" type="number" min="0.1" step="0.1" class="inp" required />
          </div>
          <div><label class="label block mb-1.5">Примечание</label><input v-model="form.notes" class="inp" placeholder="АЗС, документы..." /></div>
          <div v-if="err" class="text-red-400 font-mono text-xs">{{ err }}</div>
          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary flex-1">Заправить</button>
            <button type="button" @click="showRefuel = false" class="btn btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showRefuel = ref(false)
const err = ref('')
const { data: opsData, refresh } = await useFetch('/api/fuel')
const { data: carsData } = await useFetch('/api/cars')
const ops = computed(() => (opsData.value as any[]) || [])
const cars = computed(() => (carsData.value as any[]) || [])
const form = reactive({ carId: '', amount: 0, notes: '' })
const selCar = computed(() => cars.value.find((c: any) => c.id === form.carId))
function onCarChange() {}

async function doRefuel() {
  err.value = ''
  try {
    await $fetch('/api/fuel/refuel', { method: 'POST', body: form })
    showRefuel.value = false
    form.carId = ''; form.amount = 0; form.notes = ''
    await refresh()
  } catch (e: any) { err.value = e?.data?.message || 'Ошибка' }
}

const fmtDT = (d: string) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const typeLabel = (t: string) => ({ REFUEL: '+ Заправка', CONSUMPTION: '- Расход', CORRECTION: '⚙ Корр.' }[t] || t)
</script>
