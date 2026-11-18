-- AlterTable
ALTER TABLE `CardTemplate` ADD COLUMN `batchRequestId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `CardGenerationJob` ADD COLUMN `attempt` INTEGER NOT NULL DEFAULT 1,
    MODIFY `provider` ENUM('STUB', 'GEMINI') NOT NULL DEFAULT 'STUB';

-- CreateTable
CREATE TABLE `ExternalEntityMapping` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('API_SPORTS_BASKETBALL') NOT NULL,
    `entityType` ENUM('LEAGUE', 'SEASON', 'TEAM', 'PLAYER', 'GAME', 'STANDING', 'STAT_LINE') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `localId` VARCHAR(191) NOT NULL,
    `externalName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ExternalEntityMapping_entityType_localId_idx`(`entityType`, `localId`),
    UNIQUE INDEX `ExternalEntityMapping_provider_entityType_externalId_key`(`provider`, `entityType`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportRun` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('API_SPORTS_BASKETBALL') NOT NULL,
    `status` ENUM('PREVIEWING', 'READY', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL') NOT NULL DEFAULT 'PREVIEWING',
    `requestedById` VARCHAR(191) NOT NULL,
    `leagueExternalId` VARCHAR(191) NOT NULL,
    `seasonExternalId` VARCHAR(191) NOT NULL,
    `scopes` JSON NOT NULL,
    `options` JSON NULL,
    `capabilities` JSON NULL,
    `estimatedRequestCost` INTEGER NOT NULL DEFAULT 0,
    `detailRequestCap` INTEGER NOT NULL DEFAULT 10,
    `detailRequestsCompleted` INTEGER NOT NULL DEFAULT 0,
    `requestedCount` INTEGER NOT NULL DEFAULT 0,
    `createdCount` INTEGER NOT NULL DEFAULT 0,
    `updatedCount` INTEGER NOT NULL DEFAULT 0,
    `unchangedCount` INTEGER NOT NULL DEFAULT 0,
    `conflictCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `errorSummary` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ImportRun_provider_createdAt_idx`(`provider`, `createdAt`),
    INDEX `ImportRun_requestedById_idx`(`requestedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportRecord` (
    `id` VARCHAR(191) NOT NULL,
    `importRunId` VARCHAR(191) NOT NULL,
    `entityType` ENUM('LEAGUE', 'SEASON', 'TEAM', 'PLAYER', 'GAME', 'STANDING', 'STAT_LINE') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `externalName` VARCHAR(191) NULL,
    `action` ENUM('CREATE', 'UPDATE', 'UNCHANGED', 'CONFLICT', 'SKIP', 'ERROR') NOT NULL,
    `localId` VARCHAR(191) NULL,
    `normalized` JSON NOT NULL,
    `differences` JSON NULL,
    `resolution` JSON NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ImportRecord_importRunId_action_idx`(`importRunId`, `action`),
    UNIQUE INDEX `ImportRecord_importRunId_entityType_externalId_key`(`importRunId`, `entityType`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportRawSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `importRunId` VARCHAR(191) NOT NULL,
    `provider` ENUM('API_SPORTS_BASKETBALL') NOT NULL,
    `requestKey` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `parameters` JSON NOT NULL,
    `payload` JSON NOT NULL,
    `payloadHash` VARCHAR(191) NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `ImportRawSnapshot_provider_requestKey_expiresAt_idx`(`provider`, `requestKey`, `expiresAt`),
    UNIQUE INDEX `ImportRawSnapshot_importRunId_requestKey_key`(`importRunId`, `requestKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportRequestLog` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('API_SPORTS_BASKETBALL') NOT NULL,
    `requestKey` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `responseStatus` INTEGER NOT NULL,
    `cacheHit` BOOLEAN NOT NULL DEFAULT false,
    `quotaLimit` INTEGER NULL,
    `quotaRemaining` INTEGER NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `durationMs` INTEGER NOT NULL,

    INDEX `ImportRequestLog_provider_requestedAt_idx`(`provider`, `requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportedStatLine` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('API_SPORTS_BASKETBALL') NOT NULL,
    `externalId` VARCHAR(191) NOT NULL,
    `sportSlug` VARCHAR(191) NOT NULL,
    `leagueId` VARCHAR(191) NULL,
    `seasonId` VARCHAR(191) NULL,
    `gameId` VARCHAR(191) NULL,
    `teamId` VARCHAR(191) NULL,
    `playerId` VARCHAR(191) NULL,
    `subjectType` ENUM('LEAGUE', 'SEASON', 'TEAM', 'PLAYER', 'GAME', 'STANDING', 'STAT_LINE') NOT NULL,
    `statKind` VARCHAR(191) NOT NULL,
    `availability` ENUM('AVAILABLE', 'UNSUPPORTED', 'NOT_AVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `stats` JSON NOT NULL,
    `sourceUpdatedAt` DATETIME(3) NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ImportedStatLine_gameId_teamId_idx`(`gameId`, `teamId`),
    INDEX `ImportedStatLine_seasonId_teamId_idx`(`seasonId`, `teamId`),
    UNIQUE INDEX `ImportedStatLine_provider_externalId_key`(`provider`, `externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardDownloadEvent` (
    `id` VARCHAR(191) NOT NULL,
    `cardTemplateId` VARCHAR(191) NOT NULL,
    `cardIssueId` VARCHAR(191) NOT NULL,
    `downloadedByUserId` VARCHAR(191) NOT NULL,
    `context` ENUM('PROFILE', 'HOME', 'EXPLORE', 'CARD_STUDIO', 'SHARED_LINK', 'DIRECT') NOT NULL DEFAULT 'DIRECT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CardDownloadEvent_cardTemplateId_createdAt_idx`(`cardTemplateId`, `createdAt`),
    INDEX `CardDownloadEvent_downloadedByUserId_createdAt_idx`(`downloadedByUserId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardSave` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cardTemplateId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CardSave_cardTemplateId_idx`(`cardTemplateId`),
    UNIQUE INDEX `CardSave_userId_cardTemplateId_key`(`userId`, `cardTemplateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ImageAsset_objectKey_idx` ON `ImageAsset`(`objectKey`);

-- CreateIndex
CREATE INDEX `CardTemplate_athleteProfileId_batchRequestId_idx` ON `CardTemplate`(`athleteProfileId`, `batchRequestId`);

-- AddForeignKey
ALTER TABLE `ImportRun` ADD CONSTRAINT `ImportRun_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportRecord` ADD CONSTRAINT `ImportRecord_importRunId_fkey` FOREIGN KEY (`importRunId`) REFERENCES `ImportRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportRawSnapshot` ADD CONSTRAINT `ImportRawSnapshot_importRunId_fkey` FOREIGN KEY (`importRunId`) REFERENCES `ImportRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardDownloadEvent` ADD CONSTRAINT `CardDownloadEvent_cardTemplateId_fkey` FOREIGN KEY (`cardTemplateId`) REFERENCES `CardTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardDownloadEvent` ADD CONSTRAINT `CardDownloadEvent_cardIssueId_fkey` FOREIGN KEY (`cardIssueId`) REFERENCES `CardIssue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardDownloadEvent` ADD CONSTRAINT `CardDownloadEvent_downloadedByUserId_fkey` FOREIGN KEY (`downloadedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardSave` ADD CONSTRAINT `CardSave_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardSave` ADD CONSTRAINT `CardSave_cardTemplateId_fkey` FOREIGN KEY (`cardTemplateId`) REFERENCES `CardTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
