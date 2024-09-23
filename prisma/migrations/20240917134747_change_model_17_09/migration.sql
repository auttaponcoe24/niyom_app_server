/*
  Warnings:

  - You are about to drop the column `remind` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `over_due` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `total_price` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - Made the column `month` on table `Unit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `Unit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updateAt` on table `Zone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Transaction` DROP COLUMN `remind`,
    MODIFY `over_due` INTEGER NULL,
    MODIFY `total_price` INTEGER NULL,
    MODIFY `amount` INTEGER NULL;

-- AlterTable
ALTER TABLE `Unit` MODIFY `month` VARCHAR(191) NOT NULL,
    MODIFY `year` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Zone` MODIFY `updateAt` DATETIME(3) NOT NULL;
