/*
  Warnings:

  - You are about to drop the column `dictionaryGroupId` on the `Test` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Test` DROP FOREIGN KEY `Test_dictionaryGroupId_fkey`;

-- AlterTable
ALTER TABLE `Test` DROP COLUMN `dictionaryGroupId`;
