-- CreateTable
CREATE TABLE `TestStatistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wordId` INTEGER NULL,
    `sentenceId` INTEGER NULL,
    `rating` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestStatistic` ADD CONSTRAINT `TestStatistic_wordId_fkey` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestStatistic` ADD CONSTRAINT `TestStatistic_sentenceId_fkey` FOREIGN KEY (`sentenceId`) REFERENCES `Sentence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
