/*
  Warnings:

  - You are about to drop the column `ratingSentence` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `ratingWord` on the `Word` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Sentence` ADD COLUMN `numberFailures` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `numberShow` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `numberSuccesses` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Word` DROP COLUMN `ratingSentence`,
    DROP COLUMN `ratingWord`,
    ADD COLUMN `rating` INTEGER NOT NULL DEFAULT 0;
