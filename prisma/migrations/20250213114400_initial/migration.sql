-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('WAITING', 'PAY');

-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "StatueUser" AS ENUM ('PENDING', 'REJECT', 'SUCCESS');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('W', 'E');

-- CreateEnum
CREATE TYPE "StatusPayment" AS ENUM ('PENDING', 'REJECT', 'SUCCESS');

-- CreateTable
CREATE TABLE "prefixs" (
    "id" SERIAL NOT NULL,
    "prefix_name" TEXT NOT NULL,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "prefixs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" SERIAL NOT NULL,
    "zone_name" TEXT,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "card_id" VARCHAR(13),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL DEFAULT 'USER',
    "customer_id" TEXT,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "no" INTEGER,
    "first_name" TEXT,
    "last_name" TEXT,
    "card_id" VARCHAR(13),
    "phone_number" TEXT,
    "house_number" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "prefix_id" INTEGER,
    "zone_id" INTEGER,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TypeTransaction" NOT NULL DEFAULT 'W',
    "unit_number" INTEGER,
    "customer_id" TEXT NOT NULL,
    "zone_id" INTEGER,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TypeTransaction" NOT NULL DEFAULT 'W',
    "unit_old_id" INTEGER,
    "unit_new_id" INTEGER,
    "unit_used" INTEGER,
    "amount" INTEGER,
    "over_due" INTEGER,
    "pay" INTEGER,
    "total" INTEGER,
    "status" "BillStatus" NOT NULL DEFAULT 'WAITING',
    "zone_id" INTEGER,
    "customer_id" TEXT,
    "approved_by" TEXT,
    "created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zones_zone_name_key" ON "zones"("zone_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_card_id_key" ON "users"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_customer_id_key" ON "users"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_card_id_key" ON "customers"("card_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_prefix_id_fkey" FOREIGN KEY ("prefix_id") REFERENCES "prefixs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_unit_old_id_fkey" FOREIGN KEY ("unit_old_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_unit_new_id_fkey" FOREIGN KEY ("unit_new_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
