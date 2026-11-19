-- AlterTable
ALTER TABLE `MediaAsset` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `ImageAsset` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `CardTemplate` ADD COLUMN `releaseRequestHash` VARCHAR(191) NULL,
    ADD COLUMN `releaseRequestId` VARCHAR(191) NULL,
    ADD COLUMN `storefrontId` VARCHAR(191) NULL,
    ADD COLUMN `templateId` VARCHAR(191) NULL,
    ADD COLUMN `templateRevision` INTEGER NULL,
    ADD COLUMN `templateSnapshotJson` JSON NULL;

-- AlterTable
ALTER TABLE `SourceReference` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `Dispute` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `Follow` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `Reaction` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `FeedItem` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NOT NULL;

-- AlterTable
ALTER TABLE `AdminAuditLog` MODIFY `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_DESIGN', 'CARD_ISSUE', 'ARTICLE') NULL;

-- CreateTable
CREATE TABLE `CardDesign` (
    `id` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 1,
    `rendererVersion` VARCHAR(191) NOT NULL DEFAULT 'rdc-composition-v1',
    `compositionJson` JSON NOT NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CardDesign_createdByUserId_updatedAt_idx`(`createdByUserId`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Storefront` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Storefront_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CardTemplate_templateId_idx` ON `CardTemplate`(`templateId`);

-- CreateIndex
CREATE INDEX `CardTemplate_storefrontId_status_visibility_publishedAt_idx` ON `CardTemplate`(`storefrontId`, `status`, `visibility`, `publishedAt`);

-- CreateIndex
CREATE UNIQUE INDEX `CardTemplate_creator_releaseRequest_key` ON `CardTemplate`(`createdByUserId`, `releaseRequestId`);

-- AddForeignKey
ALTER TABLE `CardDesign` ADD CONSTRAINT `CardDesign_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Storefront` ADD CONSTRAINT `Storefront_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CardDesign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_storefrontId_fkey` FOREIGN KEY (`storefrontId`) REFERENCES `Storefront`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Provision creator catalogs without inferring historical publishing authority.
INSERT INTO Storefront (id, userId, createdAt, updatedAt)
SELECT CONCAT('store_', SHA2(id, 256)), id, NOW(3), NOW(3) FROM User
ON DUPLICATE KEY UPDATE userId = VALUES(userId);
UPDATE CardTemplate r JOIN Storefront s ON s.userId = r.createdByUserId
SET r.storefrontId = s.id WHERE r.storefrontId IS NULL;
