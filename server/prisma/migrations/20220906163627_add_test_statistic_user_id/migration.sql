-- AlterTable
ALTER TABLE `TestStatistic` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TestStatistic` ADD CONSTRAINT `TestStatistic_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
