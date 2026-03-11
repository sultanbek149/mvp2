-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'GASOLINE', 'GAS', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WaybillStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FuelOpType" AS ENUM ('REFUEL', 'CONSUMPTION', 'CORRECTION');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('TO1', 'TO2', 'TO3', 'REPAIR', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DISPATCHER',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL DEFAULT 'DIESEL',
    "tankCapacity" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "fuelBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMileage" INTEGER NOT NULL DEFAULT 0,
    "lastTo1Mileage" INTEGER NOT NULL DEFAULT 0,
    "lastTo2Mileage" INTEGER NOT NULL DEFAULT 0,
    "lastTo3Mileage" INTEGER NOT NULL DEFAULT 0,
    "status" "CarStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "licenseNumber" TEXT NOT NULL,
    "licenseCategory" TEXT NOT NULL DEFAULT 'B',
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waybill" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startMileage" INTEGER NOT NULL,
    "endMileage" INTEGER,
    "fuelStart" DOUBLE PRECISION NOT NULL,
    "fuelAdded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelEnd" DOUBLE PRECISION,
    "fuelConsumed" DOUBLE PRECISION,
    "routeStart" TEXT,
    "routeEnd" TEXT,
    "startLat" DOUBLE PRECISION,
    "startLng" DOUBLE PRECISION,
    "endLat" DOUBLE PRECISION,
    "endLng" DOUBLE PRECISION,
    "status" "WaybillStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelOperation" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "waybillId" TEXT,
    "type" "FuelOpType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "operatorId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "mileageAtService" INTEGER NOT NULL,
    "nextServiceMileage" INTEGER NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION,
    "description" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Car_plateNumber_key" ON "Car"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Waybill_number_key" ON "Waybill"("number");

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waybill" ADD CONSTRAINT "Waybill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "Waybill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelOperation" ADD CONSTRAINT "FuelOperation_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
