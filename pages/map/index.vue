<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
      <!-- Sidebar -->
      <div class="mil-panel flex flex-col overflow-hidden">
        <div class="mil-panel-header flex-shrink-0">
          <span class="mil-label">Маршруты</span>
        </div>
        <div class="p-3 flex-shrink-0 space-y-2">
          <select v-model="filterStatus" class="mil-select text-xs">
            <option value="">Все статусы</option>
            <option value="ACTIVE">Активные</option>
            <option value="CLOSED">Закрытые</option>
          </select>
        </div>
        <div class="flex-1 overflow-y-auto divide-y divide-army-border/50">
          <div v-for="wb in waybillsWithCoords" :key="wb.id"
            @click="selectWaybill(wb)"
            class="p-3 cursor-pointer transition-colors"
            :class="selected?.id === wb.id ? 'bg-army-green/20' : 'hover:bg-army-panel'">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="font-mono text-xs text-army-light font-bold">{{ wb.number }}</div>
                <div class="text-xs text-army-text mt-0.5">{{ wb.car?.brand }} {{ wb.car?.plateNumber }}</div>
                <div class="text-xs text-army-muted">{{ wb.driver?.name?.split(' ')[0] }}</div>
                <div class="font-mono text-xs text-army-muted mt-1">{{ wb.routeStart }} → {{ wb.routeEnd }}</div>
              </div>
              <span class="mil-badge text-xs flex-shrink-0" :class="statusBadge(wb.status)">{{ statusLabel(wb.status) }}</span>
            </div>
          </div>
          <div v-if="!waybillsWithCoords.length" class="p-6 text-center font-mono text-xs text-army-muted">
            Нет маршрутов с координатами
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="lg:col-span-2 mil-panel overflow-hidden relative">
        <div class="mil-panel-header absolute top-0 left-0 right-0 z-10">
          <span class="mil-label">{{ selected ? `Маршрут: ${selected.number}` : 'Карта маршрутов' }}</span>
        </div>
        <div ref="mapContainer" class="w-full h-full" style="padding-top: 49px;" />
        <div v-if="!mapReady" class="absolute inset-0 flex items-center justify-center bg-army-darker">
          <span class="font-mono text-xs text-army-muted animate-pulse">Загрузка карты...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const filterStatus = ref('')
const selected = ref<any>(null)
const mapContainer = ref<HTMLElement>()
const mapReady = ref(false)

const url = computed(() => `/api/waybills${filterStatus.value ? `?status=${filterStatus.value}` : ''}`)
const { data } = await useFetch(url)
const waybills = computed(() => (data.value as any[]) || [])
const waybillsWithCoords = computed(() =>
  waybills.value.filter((w: any) => w.startLat && w.startLng)
)

const statusBadge = (s: string) => ({ ACTIVE: 'bg-army-green/20 border-army-green/40 text-army-pale', CLOSED: 'bg-army-border/40 border-army-border text-army-muted' }[s] || '')
const statusLabel = (s: string) => ({ ACTIVE: 'Активен', CLOSED: 'Закрыт' }[s] || s)

let map: any = null
let layerGroup: any = null

onMounted(async () => {
  if (!process.client) return
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Fix default markers
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  await nextTick()
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, { zoomControl: true }).setView([43.2, 76.8], 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(map)

  // Style map tiles darker
  const tilePane = map.getPane('tilePane')
  if (tilePane) tilePane.style.filter = 'brightness(0.7) saturate(0.5) hue-rotate(80deg)'

  layerGroup = L.layerGroup().addTo(map)
  mapReady.value = true
  renderMarkers(L)
})

function renderMarkers(L: any) {
  if (!layerGroup) return
  layerGroup.clearLayers()
  const all = selected.value ? [selected.value] : waybillsWithCoords.value

  all.forEach((wb: any) => {
    const color = wb.status === 'ACTIVE' ? '#7A9E6E' : '#3A4E36'
    const startIcon = L.divIcon({
      html: `<div style="background:${color};border:2px solid #A8C49A;border-radius:50% 50% 50% 0;width:20px;height:20px;transform:rotate(-45deg);box-shadow:0 0 8px ${color}80"></div>`,
      iconSize: [20, 20], iconAnchor: [10, 20]
    })
    const endIcon = L.divIcon({
      html: `<div style="background:#8B3A2A;border:2px solid #C84820;border-radius:50%;width:16px;height:16px;box-shadow:0 0 8px #C8482080"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8]
    })

    L.marker([wb.startLat, wb.startLng], { icon: startIcon })
      .bindPopup(`<b>${wb.number}</b><br>${wb.car?.plateNumber}<br>${wb.routeStart || 'Старт'}`)
      .addTo(layerGroup)

    if (wb.endLat && wb.endLng) {
      L.marker([wb.endLat, wb.endLng], { icon: endIcon })
        .bindPopup(`<b>${wb.number}</b><br>${wb.routeEnd || 'Финиш'}`)
        .addTo(layerGroup)

      L.polyline([[wb.startLat, wb.startLng], [wb.endLat, wb.endLng]], {
        color, weight: 2, opacity: 0.8, dashArray: wb.status === 'ACTIVE' ? '8 4' : null
      }).addTo(layerGroup)
    }
  })

  if (all.length) {
    const bounds = L.latLngBounds(all.flatMap((wb: any) => {
      const pts: any[] = [[wb.startLat, wb.startLng]]
      if (wb.endLat) pts.push([wb.endLat, wb.endLng])
      return pts
    }))
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

function selectWaybill(wb: any) {
  selected.value = selected.value?.id === wb.id ? null : wb
  nextTick(async () => {
    const L = await import('leaflet')
    renderMarkers(L)
  })
}

watch(filterStatus, async () => {
  await nextTick()
  const L = await import('leaflet')
  renderMarkers(L)
})
</script>

<style>
.leaflet-container { background: #0F1410; }
.leaflet-popup-content-wrapper { background: #1A2218; border: 1px solid #2A3828; color: #C8D8C0; border-radius: 2px; }
.leaflet-popup-tip { background: #1A2218; }
</style>
