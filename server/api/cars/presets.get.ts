import { requireRole, MANAGE_ROLES } from '~/server/utils/auth'

const PRESET_FLEET = [
  { brand: 'БТР', model: '80', plateNumber: 'Б/Н 273', fuelType: 'DIESEL', tankCapacity: 300 },
  { brand: 'УРАЛ', model: '4320 ВВ', plateNumber: 'KZ 153 UU/11', fuelType: 'DIESEL', tankCapacity: 300 },
  { brand: 'УРАЛ', model: '4320 ВВ', plateNumber: 'KZ 135 UU/11', fuelType: 'DIESEL', tankCapacity: 300 },
  { brand: 'ВПК СБМ ТИГР', model: '', plateNumber: 'KZ 108 UU/11', fuelType: 'DIESEL', tankCapacity: 130 },
  { brand: 'ВПК СБМ ТИГР', model: '', plateNumber: 'KZ 134 UU/11', fuelType: 'DIESEL', tankCapacity: 130 },
  { brand: 'DAEWOO', model: '106D', plateNumber: 'KZ 145 UU/11', fuelType: 'DIESEL', tankCapacity: 200 },
  { brand: 'УРАЛ', model: 'ВАХТА', plateNumber: 'KZ 130 UU/11', fuelType: 'DIESEL', tankCapacity: 300 },
  { brand: 'УРАЛ', model: 'ВАХТА', plateNumber: 'KZ 133 UU/11', fuelType: 'DIESEL', tankCapacity: 300 },
  { brand: 'КАМАЗ', model: '44114', plateNumber: 'KZ 119 UU/11', fuelType: 'DIESEL', tankCapacity: 250 },
  { brand: 'ГАЗ', model: '322173', plateNumber: 'KZ 148 UU/11', fuelType: 'GASOLINE', tankCapacity: 70 },
  { brand: 'УАЗ', model: '3163 Патриот', plateNumber: 'KZ 171 UU/11', fuelType: 'GASOLINE', tankCapacity: 68 },
  { brand: 'УАЗ', model: '23632 Пикап', plateNumber: 'KZ 147 UU/11', fuelType: 'GASOLINE', tankCapacity: 68 },
  { brand: 'JAC', model: 'Sunray', plateNumber: 'KZ 241 DK/11', fuelType: 'DIESEL', tankCapacity: 80 },
  { brand: 'TOYOTA', model: 'Hilux', plateNumber: 'KZ 523 DK/11', fuelType: 'DIESEL', tankCapacity: 80 },
  { brand: 'TOYOTA', model: 'Hilux', plateNumber: 'KZ 583 DK/11', fuelType: 'DIESEL', tankCapacity: 80 },
  { brand: 'TOYOTA', model: 'Hiace', plateNumber: 'KZ 352 DK/11', fuelType: 'DIESEL', tankCapacity: 70 },
  { brand: 'Mercedes-Benz', model: 'Sprinter', plateNumber: 'KZ 427 DK/11', fuelType: 'DIESEL', tankCapacity: 95 },
  { brand: 'Квадроцикл', model: '', plateNumber: 'KZ 14 UU/11', fuelType: 'GASOLINE', tankCapacity: 20 },
  { brand: 'Квадроцикл', model: '', plateNumber: 'KZ 13 UU/11', fuelType: 'GASOLINE', tankCapacity: 20 },
]

export default defineEventHandler(async (event) => {
  requireRole(event, MANAGE_ROLES)
  return PRESET_FLEET
})
