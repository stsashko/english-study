/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `DictionaryGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `DictionaryGroup_id_userId_key` ON `DictionaryGroup`(`id`, `userId`);
