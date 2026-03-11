<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <button v-for="s in statuses" :key="s.v" @click="filter = s.v"
          class="btn btn-sm" :class="filter === s.v ? 'btn-primary' : 'btn-secondary'">
          {{ s.l }}
        </button>
      </div>
      <button v-if="canManage()" @click="showForm = true" class="btn btn-primary">
        <span>+</span> Добавить автомобиль
      </button>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-4 gap-4">
      <div class="stat-card">
        <div class="label mb-1">Всего</div>
        <div class="text-2xl font-bold" style="color:var(--text)">{{ cars.length }}</div>
      </div>
      <div class="stat-card">
        <div class="label mb-1">Активных</div>
        <div class="text-2xl font-bold" style="color:var(--brand)">{{ cars.filter(c => c.status === 'ACTIVE').length }}</div>
      </div>
      <div class="stat-card">
        <div class="label mb-1">На обслуживании</div>
        <div class="text-2xl font-bold" style="color:var(--warning)">{{ cars.filter(c => c.status === 'MAINTENANCE').length }}</div>
      </div>
      <div class="stat-card">
        <div class="label mb-1">Требуют ТО</div>
        <div class="text-2xl font-bold" style="color:var(--danger)">{{ cars.filter(c => c.maintenanceAlerts?.length).length }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-header">
        <span class="font-semibold text-sm" style="color:var(--text)">Реестр автомобилей</span>
        <span class="ml-1 text-xs" style="color:var(--text-3)">({{ cars.length }})</span>
      </div>
      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Гос. номер</th>
              <th>Марка / Модель</th>
              <th>Год</th>
              <th>Топливо</th>
              <th>Пробег</th>
              <th>Статус</th>
              <th>ТО</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="car in cars" :key="car.id">
              <td>
                <span class="font-mono text-sm font-semibold" style="color:var(--brand)">{{ car.plateNumber }}</span>
              </td>
              <td>
                <div class="font-medium text-sm" style="color:var(--text)">{{ car.brand }} {{ car.model }}</div>
              </td>
              <td class="text-sm" style="color:var(--text-3)">{{ car.year }}</td>
              <td>
                <div class="flex items-center gap-2 min-w-[120px]">
                  <div class="flex-1 fuel-bar">
                    <div class="fuel-bar-fill" :class="fuelColorClass(car)"
                      :style="`width:${Math.min(100,(car.fuelBalance/car.tankCapacity)*100)}%`" />
                  </div>
                  <span class="text-xs font-mono whitespace-nowrap" style="color:var(--text-2)">
                    {{ car.fuelBalance.toFixed(0) }}/{{ car.tankCapacity }}л
                  </span>
                </div>
              </td>
              <td class="text-sm font-mono" style="color:var(--text-2)">{{ car.totalMileage.toLocaleString() }} км</td>
              <td>
                <span class="badge" :class="statusBadge(car.status)">
                  {{ statusLabel(car.status) }}
                </span>
              </td>
              <td>
                <div class="flex flex-col gap-0.5">
                  <span v-for="alert in (car.maintenanceAlerts || [])" :key="alert.type"
                    class="badge" :class="alert.overdue ? 'badge-danger' : 'badge-warning'">
                    {{ alert.type }}{{ alert.overdue ? ' !' : '' }}
                  </span>
                </div>
              </td>
              <td>
                <NuxtLink :to="`/cars/${car.id}`" class="btn btn-secondary btn-sm">→</NuxtLink>
              </td>
            </tr>
            <tr v-if="!cars.length">
              <td colspan="8" class="text-center py-10 text-sm" style="color:var(--text-3)">Нет автомобилей</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add car modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-box max-w-xl">
        <div class="modal-header">
          <h3 class="font-semibold text-base" style="color:var(--text)">Добавить автомобиль</h3>
          <button @click="showForm = false" class="text-xl leading-none" style="color:var(--text-3)">✕</button>
        </div>
        <div class="p-5 space-y-5">

          <!-- Mode tabs -->
          <div class="flex gap-2 p-1 rounded-lg" style="background:var(--bg-3)">
            <button @click="addMode = 'preset'" class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
              :style="addMode === 'preset' ? 'background:var(--bg-2);color:var(--brand);box-shadow:0 1px 3px var(--shadow)' : 'color:var(--text-2)'">
              📋 Выбрать из реестра
            </button>
            <button @click="addMode = 'manual'" class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
              :style="addMode === 'manual' ? 'background:var(--bg-2);color:var(--brand);box-shadow:0 1px 3px var(--shadow)' : 'color:var(--text-2)'">
              ✏️ Ввести вручную
            </button>
          </div>

          <!-- Preset select -->
          <div v-if="addMode === 'preset'">
            <label class="label block mb-2">Выберите автомобиль из реестра</label>
            <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              <button v-for="p in presets" :key="p.plateNumber"
                @click="fillFromPreset(p)"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm text-left transition-all"
                :style="selectedPreset?.plateNumber === p.plateNumber
                  ? 'background:var(--brand-pale);border-color:var(--brand);color:var(--brand)'
                  : 'background:var(--bg-2);border-color:var(--border);color:var(--text)'">
                <span class="font-medium">{{ p.brand }} {{ p.model }}</span>
                <span class="font-mono text-xs" style="color:var(--text-3)">{{ p.plateNumber }}</span>
              </button>
            </div>
            <div v-if="selectedPreset" class="mt-3 p-3 rounded-lg" style="background:var(--brand-light);border:1px solid var(--border-2)">
              <div class="text-xs font-semibold mb-2" style="color:var(--brand)">Данные из реестра:</div>
              <div class="grid grid-cols-2 gap-2 text-xs" style="color:var(--text-2)">
                <div><span class="label">Тип топлива:</span> {{ fuelLabel(selectedPreset.fuelType) }}</div>
                <div><span class="label">Бак:</span> {{ selectedPreset.tankCapacity }} л</div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label class="label block mb-1">Год выпуска</label>
                  <input v-model.number="form.year" type="number" class="inp text-sm py-1.5" placeholder="2020" />
                </div>
                <div>
                  <label class="label block mb-1">Начальный пробег (км)</label>
                  <input v-model.number="form.totalMileage" type="number" class="inp text-sm py-1.5" placeholder="0" />
                </div>
                <div>
                  <label class="label block mb-1">Остаток топлива (л)</label>
                  <input v-model.number="form.fuelBalance" type="number" class="inp text-sm py-1.5" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <!-- Manual form -->
          <div v-if="addMode === 'manual'" class="grid grid-cols-2 gap-3">
            <div><label class="label block mb-1">Марка</label><input v-model="form.brand" class="inp" placeholder="КАМАЗ" required /></div>
            <div><label class="label block mb-1">Модель</label><input v-model="form.model" class="inp" placeholder="44114" /></div>
            <div><label class="label block mb-1">Гос. номер</label><input v-model="form.plateNumber" class="inp" placeholder="KZ 000 AA/11" required /></div>
            <div><label class="label block mb-1">Год</label><input v-model.number="form.year" type="number" class="inp" /></div>
            <div>
              <label class="label block mb-1">Тип топлива</label>
              <select v-model="form.fuelType" class="inp">
                <option value="DIESEL">Дизель</option>
                <option value="GASOLINE">Бензин</option>
                <option value="GAS">Газ</option>
                <option value="ELECTRIC">Электро</option>
              </select>
            </div>
            <div><label class="label block mb-1">Объём бака (л)</label><input v-model.number="form.tankCapacity" type="number" class="inp" /></div>
            <div><label class="label block mb-1">Остаток топлива (л)</label><input v-model.number="form.fuelBalance" type="number" class="inp" /></div>
            <div><label class="label block mb-1">Пробег (км)</label><input v-model.number="form.totalMileage" type="number" class="inp" /></div>
          </div>

          <div v-if="error" class="alert-danger text-sm" style="color:var(--danger)">{{ error }}</div>

          <div class="flex gap-3 pt-1">
            <button @click="createCar" class="btn btn-primary flex-1 justify-center">Добавить</button>
            <button @click="showForm = false" class="btn btn-secondary flex-1 justify-center">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { canManage } = useAuth()
const filter = ref('')
const showForm = ref(false)
const addMode = ref<'preset'|'manual'>('preset')
const selectedPreset = ref<any>(null)
const error = ref('')

const statuses = [
  { v: '', l: 'Все' }, { v: 'ACTIVE', l: 'Активные' },
  { v: 'MAINTENANCE', l: 'На ТО' }, { v: 'INACTIVE', l: 'Неактивные' },
]

const url = computed(() => `/api/cars${filter.value ? `?status=${filter.value}` : ''}`)
const { data, refresh } = await useFetch(url)
const cars = computed(() => (data.value as any[]) || [])

const { data: presetsData } = await useFetch('/api/cars/presets')
const presets = computed(() => (presetsData.value as any[]) || [])

const form = reactive({
  brand: '', model: '', plateNumber: '',
  year: new Date().getFullYear(),
  fuelType: 'DIESEL', tankCapacity: 100,
  fuelBalance: 0, totalMileage: 0,
})

function fillFromPreset(p: any) {
  selectedPreset.value = p
  form.brand = p.brand
  form.model = p.model
  form.plateNumber = p.plateNumber
  form.fuelType = p.fuelType
  form.tankCapacity = p.tankCapacity
}

async function createCar() {
  error.value = ''
  if (!form.brand || !form.plateNumber) { error.value = 'Заполните обязательные поля'; return }
  try {
    await $fetch('/api/cars', { method: 'POST', body: form })
    showForm.value = false
    selectedPreset.value = null
    Object.assign(form, { brand: '', model: '', plateNumber: '', year: new Date().getFullYear(), fuelType: 'DIESEL', tankCapacity: 100, fuelBalance: 0, totalMileage: 0 })
    await refresh()
  } catch (e: any) { error.value = e?.data?.message || 'Ошибка' }
}

const fuelColorClass = (car: any) => {
  const p = car.fuelBalance / car.tankCapacity
  return p > 0.5 ? 'fuel-high' : p > 0.2 ? 'fuel-medium' : 'fuel-low'
}
const fuelLabel = (t: string) => ({ DIESEL: 'Дизель', GASOLINE: 'Бензин', GAS: 'Газ', ELECTRIC: 'Электро' }[t] || t)
const statusBadge = (s: string) => ({ ACTIVE: 'badge-success', MAINTENANCE: 'badge-warning', INACTIVE: 'badge-neutral' }[s] || 'badge-neutral')
const statusLabel = (s: string) => ({ ACTIVE: 'Активен', MAINTENANCE: 'На ТО', INACTIVE: 'Неактивен' }[s] || s)
</script>
