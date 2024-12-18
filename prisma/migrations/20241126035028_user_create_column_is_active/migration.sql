-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `isActive` ENUM('Y', 'N') NOT NULL DEFAULT 'Y';
