export const TO_INTERVALS = {
  TO1: 10000,
  TO2: 30000,
  TO3: 60000,
}

export const TO_WARN_BEFORE = {
  TO1: 500,
  TO2: 1000,
  TO3: 2000,
}

export function checkMaintenanceAlerts(car: {
  totalMileage: number
  lastTo1Mileage: number
  lastTo2Mileage: number
  lastTo3Mileage: number
}) {
  const alerts: { type: string; kmLeft: number; overdue: boolean }[] = []

  const checks = [
    { type: 'TO1', interval: TO_INTERVALS.TO1, last: car.lastTo1Mileage, warn: TO_WARN_BEFORE.TO1 },
    { type: 'TO2', interval: TO_INTERVALS.TO2, last: car.lastTo2Mileage, warn: TO_WARN_BEFORE.TO2 },
    { type: 'TO3', interval: TO_INTERVALS.TO3, last: car.lastTo3Mileage, warn: TO_WARN_BEFORE.TO3 },
  ]

  for (const check of checks) {
    const nextMileage = check.last + check.interval
    const kmLeft = nextMileage - car.totalMileage
    if (kmLeft <= check.warn) {
      alerts.push({ type: check.type, kmLeft, overdue: kmLeft <= 0 })
    }
  }

  return alerts
}
