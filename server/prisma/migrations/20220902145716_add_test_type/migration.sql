-- AlterTable
ALTER TABLE `TestQuestion` ADD COLUMN `testTypeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TestQuestionGenerated` ADD COLUMN `testTypeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TestType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT '',
    `rating` INTEGER NOT NULL DEFAULT 0,
    `completed` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestType` ADD CONSTRAINT `TestType_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestion` ADD CONSTRAINT `TestQuestion_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionGenerated` ADD CONSTRAINT `TestQuestionGenerated_testTypeId_fkey` FOREIGN KEY (`testTypeId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
