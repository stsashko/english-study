-- CreateTable
CREATE TABLE `TestDictionary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NULL,
    `dictionaryGroupId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestDictionary` ADD CONSTRAINT `TestDictionary_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestDictionary` ADD CONSTRAINT `TestDictionary_dictionaryGroupId_fkey` FOREIGN KEY (`dictionaryGroupId`) REFERENCES `DictionaryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
