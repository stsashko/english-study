/*
  Warnings:

  - You are about to drop the column `countFailures` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `countSuccess` on the `Word` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Word` DROP COLUMN `countFailures`,
    DROP COLUMN `countSuccess`;
