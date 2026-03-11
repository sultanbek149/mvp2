<template>
  <div class="max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
      <NuxtLink to="/waybills" class="btn btn-secondary py-1.5 px-3 text-xs">← Назад</NuxtLink>
      <h1 class="font-display text-xl font-bold text-army-bright uppercase tracking-wider">Создание путевого листа</h1>
    </div>

    <div class="card">
      <div class="card-header"><div class="w-2 h-2 bg-army-light rounded-full" /><span class="label">Данные путевого листа</span></div>
      <form @submit.prevent="createWaybill" class="p-5 space-y-5">

        <!-- Car select -->
        <div>
          <label class="label block mb-1.5">Автомобиль *</label>
          <select v-model="form.carId" @change="onCarChange" class="inp" required>
            <option value="">— Выберите автомобиль —</option>
            <option v-for="car in cars" :key="car.id" :value="car.id" :disabled="car.status !== 'ACTIVE'">
              {{ car.brand }} {{ car.model }} · {{ car.plateNumber }}{{ car.status !== 'ACTIVE' ? ' [НЕАКТИВЕН]' : '' }}
            </option>
          </select>
        </div>

        <!-- Auto-fill info -->
        <div v-if="selectedCar" class="grid grid-cols-2 gap-3 p-3 bg-army-darker rounded-sm border border-army-border">
          <div><div class="label mb-0.5">Нач. пробег</div><div class="font-mono text-army-bright">{{ selectedCar.totalMileage.toLocaleString() }} км</div></div>
          <div><div class="label mb-0.5">Остаток топлива</div><div class="font-mono text-army-bright">{{ selectedCar.fuelBalance.toFixed(1) }} л</div></div>
        </div>

        <!-- Driver -->
        <div>
          <label class="label block mb-1.5">Водитель *</label>
          <select v-model="form.driverId" class="inp" required>
            <option value="">— Выберите водителя —</option>
            <option v-for="d in drivers" :key="d.id" :value="d.id" :disabled="!d.isActive">
              {{ d.name }} ({{ d.licenseCategory }}){{ !d.isActive ? ' [НЕАКТИВЕН]' : '' }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div>
          <label class="label block mb-1.5">Дата *</label>
          <input v-model="form.date" type="date" class="inp" required />
        </div>

        <!-- Fuel added -->
        <div>
          <label class="label block mb-1.5">Заправка (л)</label>
          <input v-model.number="form.fuelAdded" type="number" min="0" step="0.1" class="inp" placeholder="0" />
          <div v-if="selectedCar" class="font-mono text-xs text-army-muted mt-1">
            После заправки: {{ ((selectedCar.fuelBalance || 0) + (form.fuelAdded || 0)).toFixed(1) }} л
            / макс {{ selectedCar.tankCapacity }} л
          </div>
        </div>

        <!-- Route -->
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label block mb-1.5">Откуда</label><input v-model="form.routeStart" class="inp" placeholder="Парк №1, Алматы" /></div>
          <div><label class="label block mb-1.5">Куда</label><input v-model="form.routeEnd" class="inp" placeholder="Объект №5" /></div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label block mb-1.5">Широта старта</label>
            <input v-model.number="form.startLat" type="number" step="0.000001" class="inp" placeholder="43.238949" />
          </div>
          <div>
            <label class="label block mb-1.5">Долгота старта</label>
            <input v-model.number="form.startLng" type="number" step="0.000001" class="inp" placeholder="76.889709" />
          </div>
          <div>
            <label class="label block mb-1.5">Широта финиша</label>
            <input v-model.number="form.endLat" type="number" step="0.000001" class="inp" placeholder="43.648949" />
          </div>
          <div>
            <label class="label block mb-1.5">Долгота финиша</label>
            <input v-model.number="form.endLng" type="number" step="0.000001" class="inp" placeholder="77.289709" />
          </div>
        </div>

        <div><label class="label block mb-1.5">Примечания</label><textarea v-model="form.notes" class="inp h-20 resize-none" placeholder="Доп. информация..." /></div>

        <div v-if="error" class="flex items-center gap-2 px-3 py-2 bg-rust/10 border border-rust/40 rounded-sm">
          <span class="text-alert">⚠</span><span class="font-mono text-xs text-red-300">{{ error }}</span>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" :disabled="loading" class="btn btn-primary flex-1 justify-center py-3">
            {{ loading ? 'Создание...' : 'Создать путевой лист' }}
          </button>
          <NuxtLink to="/waybills" class="btn btn-secondary flex-1 justify-center py-3">Отмена</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: carsData } = await useFetch('/api/cars?status=ACTIVE')
const { data: driversData } = await useFetch('/api/drivers')

const cars = computed(() => (carsData.value as any[]) || [])
const drivers = computed(() => ((driversData.value as any[]) || []).filter((d: any) => d.isActive))

const form = reactive({
  carId: '', driverId: '',
  date: new Date().toISOString().split('T')[0],
  fuelAdded: 0, routeStart: '', routeEnd: '',
  startLat: null as number|null, startLng: null as number|null,
  endLat: null as number|null, endLng: null as number|null,
  notes: ''
})
const selectedCar = computed(() => cars.value.find((c: any) => c.id === form.carId))
const error = ref('')
const loading = ref(false)

function onCarChange() { /* auto-fill is computed */ }

async function createWaybill() {
  error.value = ''
  loading.value = true
  try {
    const wb = await $fetch('/api/waybills', { method: 'POST', body: form })
    await navigateTo(`/waybills/${(wb as any).id}`)
  } catch (e: any) {
    error.value = e?.data?.message || 'Ошибка создания'
  } finally {
    loading.value = false
  }
}
</script>
