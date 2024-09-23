/*
  Warnings:

  - You are about to drop the column `customerId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `slip_payment` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `unit_amount` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `paymentDate` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_paymentId_fkey`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `customerId`,
    DROP COLUMN `slip_payment`,
    ADD COLUMN `paymentDate` DATETIME(3) NOT NULL,
    ADD COLUMN `slipPayment` VARCHAR(191) NULL,
    ADD COLUMN `transactionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` DROP COLUMN `paymentId`,
    DROP COLUMN `price`,
    DROP COLUMN `unit_amount`,
    ADD COLUMN `amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `status` ENUM('PAID', 'PENDING', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `unit_used` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
