-- CreateTable
CREATE TABLE `TestQuestionGenerated` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NULL,
    `questionId` INTEGER NULL,
    `wordId` INTEGER NULL,
    `sentenceId` INTEGER NULL,
    `answer` INTEGER NULL DEFAULT 0,
    `customerAnswer` INTEGER NULL DEFAULT 0,
    `completed` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestQuestionGenerated` ADD CONSTRAINT `TestQuestionGenerated_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionGenerated` ADD CONSTRAINT `TestQuestionGenerated_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `TestQuestion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionGenerated` ADD CONSTRAINT `TestQuestionGenerated_wordId_fkey` FOREIGN KEY (`wordId`) REFERENCES `Word`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionGenerated` ADD CONSTRAINT `TestQuestionGenerated_sentenceId_fkey` FOREIGN KEY (`sentenceId`) REFERENCES `Sentence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
