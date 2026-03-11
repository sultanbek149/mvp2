const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

// Preset fleet from requirements
const PRESET_CARS = [
  { brand: 'БТР', model: '80', plateNumber: 'Б/Н 273', year: 2005, fuelType: 'DIESEL', tankCapacity: 300, fuelBalance: 150 },
  { brand: 'УРАЛ', model: '4320 ВВ', plateNumber: 'KZ 153 UU/11', year: 2010, fuelType: 'DIESEL', tankCapacity: 300, fuelBalance: 120 },
  { brand: 'УРАЛ', model: '4320 ВВ', plateNumber: 'KZ 135 UU/11', year: 2010, fuelType: 'DIESEL', tankCapacity: 300, fuelBalance: 80 },
  { brand: 'ВПК СБМ ТИГР', model: '', plateNumber: 'KZ 108 UU/11', year: 2015, fuelType: 'DIESEL', tankCapacity: 130, fuelBalance: 60 },
  { brand: 'ВПК СБМ ТИГР', model: '', plateNumber: 'KZ 134 UU/11', year: 2015, fuelType: 'DIESEL', tankCapacity: 130, fuelBalance: 90 },
  { brand: 'DAEWOO', model: '106D', plateNumber: 'KZ 145 UU/11', year: 2012, fuelType: 'DIESEL', tankCapacity: 200, fuelBalance: 100 },
  { brand: 'УРАЛ', model: 'ВАХТА', plateNumber: 'KZ 130 UU/11', year: 2008, fuelType: 'DIESEL', tankCapacity: 300, fuelBalance: 50 },
  { brand: 'УРАЛ', model: 'ВАХТА', plateNumber: 'KZ 133 UU/11', year: 2008, fuelType: 'DIESEL', tankCapacity: 300, fuelBalance: 140 },
  { brand: 'КАМАЗ', model: '44114', plateNumber: 'KZ 119 UU/11', year: 2011, fuelType: 'DIESEL', tankCapacity: 250, fuelBalance: 75 },
  { brand: 'ГАЗ', model: '322173', plateNumber: 'KZ 148 UU/11', year: 2016, fuelType: 'GASOLINE', tankCapacity: 70, fuelBalance: 35 },
  { brand: 'УАЗ', model: '3163 Патриот', plateNumber: 'KZ 171 UU/11', year: 2018, fuelType: 'GASOLINE', tankCapacity: 68, fuelBalance: 40 },
  { brand: 'УАЗ', model: '23632 Пикап', plateNumber: 'KZ 147 UU/11', year: 2017, fuelType: 'GASOLINE', tankCapacity: 68, fuelBalance: 25 },
  { brand: 'JAC', model: 'Sunray', plateNumber: 'KZ 241 DK/11', year: 2020, fuelType: 'DIESEL', tankCapacity: 80, fuelBalance: 45 },
  { brand: 'TOYOTA', model: 'Hilux', plateNumber: 'KZ 523 DK/11', year: 2021, fuelType: 'DIESEL', tankCapacity: 80, fuelBalance: 60 },
  { brand: 'TOYOTA', model: 'Hilux', plateNumber: 'KZ 583 DK/11', year: 2021, fuelType: 'DIESEL', tankCapacity: 80, fuelBalance: 55 },
  { brand: 'TOYOTA', model: 'Hiace', plateNumber: 'KZ 352 DK/11', year: 2019, fuelType: 'DIESEL', tankCapacity: 70, fuelBalance: 30 },
  { brand: 'Mercedes-Benz', model: 'Sprinter', plateNumber: 'KZ 427 DK/11', year: 2020, fuelType: 'DIESEL', tankCapacity: 95, fuelBalance: 50 },
  { brand: 'Квадроцикл', model: '', plateNumber: 'KZ 14 UU/11', year: 2019, fuelType: 'GASOLINE', tankCapacity: 20, fuelBalance: 10 },
  { brand: 'Квадроцикл', model: '', plateNumber: 'KZ 13 UU/11', year: 2019, fuelType: 'GASOLINE', tankCapacity: 20, fuelBalance: 8 },
]

async function main() {
  console.log('Seeding database...')

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@mil.local' },
    update: {},
    create: { email: 'superadmin@mil.local', passwordHash: await bcrypt.hash('Admin1234!', 10), role: 'SUPER_ADMIN', name: 'Системный Администратор', phone: '+7 700 000 0001' }
  })
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mil.local' },
    update: {},
    create: { email: 'admin@mil.local', passwordHash: await bcrypt.hash('Admin1234!', 10), role: 'ADMIN', name: 'Нач. Автослужбы Петров А.В.', phone: '+7 700 000 0002' }
  })
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@mil.local' },
    update: {},
    create: { email: 'dispatcher@mil.local', passwordHash: await bcrypt.hash('Admin1234!', 10), role: 'DISPATCHER', name: 'Диспетчер Смирнова Е.И.', phone: '+7 700 000 0003' }
  })
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@mil.local' },
    update: {},
    create: { email: 'driver@mil.local', passwordHash: await bcrypt.hash('Admin1234!', 10), role: 'DRIVER', name: 'Водитель Иванов С.П.', phone: '+7 700 000 0004' }
  })

  // Create all preset cars
  const createdCars = []
  for (const carData of PRESET_CARS) {
    const car = await prisma.car.upsert({
      where: { plateNumber: carData.plateNumber },
      update: {},
      create: { ...carData, totalMileage: Math.floor(Math.random() * 80000) + 5000, status: 'ACTIVE' }
    })
    createdCars.push(car)
    console.log(`  ✓ ${carData.brand} ${carData.model} · ${carData.plateNumber}`)
  }

  // Drivers
  const driver1 = await prisma.driver.upsert({
    where: { licenseNumber: 'KZ-001-2019' },
    update: {},
    create: { userId: driverUser.id, licenseNumber: 'KZ-001-2019', licenseCategory: 'C', licenseExpiry: new Date('2027-06-15'), name: 'Иванов Сергей Петрович', phone: '+7 700 000 0004' }
  })
  const driver2 = await prisma.driver.upsert({
    where: { licenseNumber: 'KZ-002-2020' },
    update: {},
    create: { licenseNumber: 'KZ-002-2020', licenseCategory: 'BC', licenseExpiry: new Date('2026-11-20'), name: 'Захаров Михаил Дмитриевич', phone: '+7 701 000 0005' }
  })
  const driver3 = await prisma.driver.upsert({
    where: { licenseNumber: 'KZ-003-2021' },
    update: {},
    create: { licenseNumber: 'KZ-003-2021', licenseCategory: 'CE', licenseExpiry: new Date('2028-03-10'), name: 'Нурланов Асет Болатович', phone: '+7 702 000 0006' }
  })

  // Sample waybill
  const wb = await prisma.waybill.create({
    data: {
      number: 'ПЛ-2024-001',
      carId: createdCars[1].id,
      driverId: driver1.id,
      createdById: dispatcher.id,
      date: new Date('2024-12-01'),
      startMileage: 45000, endMileage: 45280,
      fuelStart: 120, fuelAdded: 50, fuelEnd: 130, fuelConsumed: 40,
      routeStart: 'Автопарк, Алматы', routeEnd: 'Полигон №3, Алматинская обл.',
      startLat: 43.238949, startLng: 76.889709, endLat: 43.648949, endLng: 77.289709,
      status: 'CLOSED',
    }
  })

  console.log('\n✓ Seed завершён!')
  console.log('─────────────────────────────────────────')
  console.log('Учётные записи:')
  console.log('  superadmin@mil.local  / Admin1234!  → Супер Админ')
  console.log('  admin@mil.local       / Admin1234!  → Администратор')
  console.log('  dispatcher@mil.local  / Admin1234!  → Диспетчер')
  console.log('  driver@mil.local      / Admin1234!  → Водитель')
  console.log(`\nДобавлено ${createdCars.length} автомобилей из реестра`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
