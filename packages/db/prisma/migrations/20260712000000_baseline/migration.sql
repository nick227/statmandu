-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `suspendedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Profile_userId_key`(`userId`),
    UNIQUE INDEX `Profile_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_token_idx`(`token`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sport` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Sport_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `League` (
    `id` VARCHAR(191) NOT NULL,
    `sportId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `League_slug_key`(`slug`),
    INDEX `League_sportId_idx`(`sportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `School` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `School_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Season` (
    `id` VARCHAR(191) NOT NULL,
    `leagueId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Season_slug_key`(`slug`),
    INDEX `Season_leagueId_idx`(`leagueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `sportId` VARCHAR(191) NOT NULL,
    `leagueId` VARCHAR(191) NOT NULL,
    `schoolId` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Team_slug_key`(`slug`),
    INDEX `Team_sportId_idx`(`sportId`),
    INDEX `Team_leagueId_idx`(`leagueId`),
    INDEX `Team_schoolId_idx`(`schoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AthleteProfile` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `hometown` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `sourceStatus` ENUM('PLAYER_REPORTED', 'SPECTATOR_REPORTED', 'MULTI_SPECTATOR_CONFIRMED', 'TEAM_MANAGER_ENTERED', 'OFFICIAL_SCORER_RECORDED', 'VERIFIED_TEAM_ACCOUNT', 'ONLINE_SOURCE_IMPORTED', 'PUBLIC_SOURCE_SCRAPED', 'IN_DISPUTE') NOT NULL DEFAULT 'PLAYER_REPORTED',
    `claimedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AthleteProfile_slug_key`(`slug`),
    UNIQUE INDEX `AthleteProfile_claimedByUserId_key`(`claimedByUserId`),
    INDEX `AthleteProfile_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player` (
    `id` VARCHAR(191) NOT NULL,
    `athleteProfileId` VARCHAR(191) NOT NULL,
    `sportId` VARCHAR(191) NOT NULL,
    `position` ENUM('PG', 'SG', 'SF', 'PF', 'C', 'GK', 'DEF', 'MID', 'FWD', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'SINGLES', 'DOUBLES') NULL,
    `classYear` VARCHAR(191) NULL,
    `jerseyNumber` INTEGER NULL,
    `heightInches` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'GRADUATED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Player_sportId_idx`(`sportId`),
    UNIQUE INDEX `Player_athleteProfileId_sportId_key`(`athleteProfileId`, `sportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RosterMembership` (
    `id` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `jerseyNumber` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RosterMembership_teamId_seasonId_idx`(`teamId`, `seasonId`),
    UNIQUE INDEX `RosterMembership_playerId_teamId_seasonId_key`(`playerId`, `teamId`, `seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` VARCHAR(191) NOT NULL,
    `sportId` VARCHAR(191) NOT NULL,
    `leagueId` VARCHAR(191) NULL,
    `seasonId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `venue` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'LIVE', 'FINAL', 'DISPUTED') NOT NULL DEFAULT 'SCHEDULED',
    `startedAt` DATETIME(3) NULL,
    `finalizedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Game_sportId_idx`(`sportId`),
    INDEX `Game_scheduledAt_idx`(`scheduledAt`),
    INDEX `Game_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameTeam` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `isHome` BOOLEAN NOT NULL,
    `finalScore` INTEGER NULL,

    INDEX `GameTeam_teamId_idx`(`teamId`),
    UNIQUE INDEX `GameTeam_gameId_teamId_key`(`gameId`, `teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameReporter` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NULL,
    `role` ENUM('ADMIN_OWNER', 'OFFICIAL_SCORER', 'TEAM_SCORER', 'BROADCASTER', 'CONTRIBUTOR', 'SPECTATOR_REPORTER', 'VIEWER') NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameReporter_gameId_role_idx`(`gameId`, `role`),
    UNIQUE INDEX `GameReporter_gameId_userId_key`(`gameId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameEvent` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NULL,
    `teamId` VARCHAR(191) NULL,
    `type` ENUM('FT_MADE', 'FT_MISS', 'FG2_MADE', 'FG2_MISS', 'FG3_MADE', 'FG3_MISS', 'REBOUND_OFF', 'REBOUND_DEF', 'ASSIST', 'STEAL', 'BLOCK', 'TURNOVER', 'FOUL', 'SUBSTITUTION_IN', 'SUBSTITUTION_OUT', 'SOCCER_GOAL', 'SOCCER_ASSIST', 'SOCCER_SHOT', 'SOCCER_SAVE', 'SOCCER_YELLOW_CARD', 'SOCCER_RED_CARD', 'FOOTBALL_PASS_TD', 'FOOTBALL_RUSH_TD', 'FOOTBALL_REC_TD', 'FOOTBALL_FIELD_GOAL_MADE', 'FOOTBALL_EXTRA_POINT_MADE', 'FOOTBALL_SACK', 'FOOTBALL_INTERCEPTION', 'TENNIS_MATCH_WIN', 'TENNIS_MATCH_LOSS', 'TENNIS_SET_WIN', 'TENNIS_SET_LOSS', 'TENNIS_ACE', 'TENNIS_DOUBLE_FAULT') NOT NULL,
    `payload` JSON NULL,
    `clientTimestamp` DATETIME(3) NOT NULL,
    `deviceId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CONFLICTING', 'CORRECTED', 'DISPUTED', 'FINALIZED') NOT NULL DEFAULT 'PENDING',
    `consensusGroupId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameEvent_gameId_status_idx`(`gameId`, `status`),
    INDEX `GameEvent_gameId_playerId_idx`(`gameId`, `playerId`),
    INDEX `GameEvent_consensusGroupId_idx`(`consensusGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameConsensusGroup` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `groupKey` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CONFLICTING', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `resolvedEventId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameConsensusGroup_gameId_status_idx`(`gameId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameStatLine` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `offRebounds` INTEGER NOT NULL DEFAULT 0,
    `defRebounds` INTEGER NOT NULL DEFAULT 0,
    `assists` INTEGER NOT NULL DEFAULT 0,
    `steals` INTEGER NOT NULL DEFAULT 0,
    `blocks` INTEGER NOT NULL DEFAULT 0,
    `turnovers` INTEGER NOT NULL DEFAULT 0,
    `fouls` INTEGER NOT NULL DEFAULT 0,
    `fgMade` INTEGER NOT NULL DEFAULT 0,
    `fgAttempted` INTEGER NOT NULL DEFAULT 0,
    `threeMade` INTEGER NOT NULL DEFAULT 0,
    `threeAttempted` INTEGER NOT NULL DEFAULT 0,
    `ftMade` INTEGER NOT NULL DEFAULT 0,
    `ftAttempted` INTEGER NOT NULL DEFAULT 0,
    `stats` JSON NULL,
    `sourceStatus` ENUM('PLAYER_REPORTED', 'SPECTATOR_REPORTED', 'MULTI_SPECTATOR_CONFIRMED', 'TEAM_MANAGER_ENTERED', 'OFFICIAL_SCORER_RECORDED', 'VERIFIED_TEAM_ACCOUNT', 'ONLINE_SOURCE_IMPORTED', 'PUBLIC_SOURCE_SCRAPED', 'IN_DISPUTE') NOT NULL DEFAULT 'OFFICIAL_SCORER_RECORDED',
    `disputeNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GameStatLine_teamId_idx`(`teamId`),
    UNIQUE INDEX `GameStatLine_gameId_playerId_key`(`gameId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerSeasonStat` (
    `id` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `gamesPlayed` INTEGER NOT NULL DEFAULT 0,
    `points` INTEGER NOT NULL DEFAULT 0,
    `offRebounds` INTEGER NOT NULL DEFAULT 0,
    `defRebounds` INTEGER NOT NULL DEFAULT 0,
    `assists` INTEGER NOT NULL DEFAULT 0,
    `steals` INTEGER NOT NULL DEFAULT 0,
    `blocks` INTEGER NOT NULL DEFAULT 0,
    `turnovers` INTEGER NOT NULL DEFAULT 0,
    `fouls` INTEGER NOT NULL DEFAULT 0,
    `fgMade` INTEGER NOT NULL DEFAULT 0,
    `fgAttempted` INTEGER NOT NULL DEFAULT 0,
    `threeMade` INTEGER NOT NULL DEFAULT 0,
    `threeAttempted` INTEGER NOT NULL DEFAULT 0,
    `ftMade` INTEGER NOT NULL DEFAULT 0,
    `ftAttempted` INTEGER NOT NULL DEFAULT 0,
    `stats` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlayerSeasonStat_playerId_seasonId_key`(`playerId`, `seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamSeasonStat` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `seasonId` VARCHAR(191) NOT NULL,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `pointsFor` INTEGER NOT NULL DEFAULT 0,
    `pointsAgainst` INTEGER NOT NULL DEFAULT 0,
    `stats` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamSeasonStat_teamId_seasonId_key`(`teamId`, `seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('YOUTUBE') NOT NULL DEFAULT 'YOUTUBE',
    `youtubeVideoId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `uploadedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `MediaAsset_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageAsset` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `usage` ENUM('AVATAR', 'LOGO', 'HERO', 'EVIDENCE', 'GALLERY') NOT NULL,
    `storageProvider` ENUM('LOCAL', 'R2', 'RAILWAY_VOLUME') NOT NULL DEFAULT 'LOCAL',
    `objectKey` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `originalFilename` VARCHAR(191) NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `uploadedByUserId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    INDEX `ImageAsset_targetType_targetId_usage_idx`(`targetType`, `targetId`, `usage`),
    INDEX `ImageAsset_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `athleteProfileId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NULL,
    `gameId` VARCHAR(191) NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `cardType` ENUM('PROFILE', 'BIG_GAME', 'MILESTONE', 'SEASON', 'HIGHLIGHT') NOT NULL,
    `stylePreset` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'GENERATING', 'READY', 'PUBLISHED', 'ARCHIVED', 'FAILED') NOT NULL DEFAULT 'DRAFT',
    `visibility` ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE',
    `editionMode` ENUM('UNLIMITED', 'LIMITED', 'ONE_OF_ONE') NOT NULL DEFAULT 'UNLIMITED',
    `editionSize` INTEGER NULL,
    `issuedCount` INTEGER NOT NULL DEFAULT 0,
    `frontImageAssetId` VARCHAR(191) NULL,
    `sourceImageAssetId` VARCHAR(191) NULL,
    `statsSnapshotJson` JSON NOT NULL,
    `originHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `publishedAt` DATETIME(3) NULL,

    INDEX `CardTemplate_athleteProfileId_status_idx`(`athleteProfileId`, `status`),
    INDEX `CardTemplate_visibility_status_publishedAt_idx`(`visibility`, `status`, `publishedAt`),
    INDEX `CardTemplate_createdByUserId_idx`(`createdByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardIssue` (
    `id` VARCHAR(191) NOT NULL,
    `cardTemplateId` VARCHAR(191) NOT NULL,
    `issueNumber` INTEGER NULL,
    `ownerUserId` VARCHAR(191) NULL,
    `claimedByUserId` VARCHAR(191) NULL,
    `claimedAt` DATETIME(3) NULL,
    `downloadedAt` DATETIME(3) NULL,
    `issueHash` VARCHAR(191) NOT NULL,
    `status` ENUM('CLAIMED', 'DOWNLOADED', 'REVOKED') NOT NULL DEFAULT 'CLAIMED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CardIssue_claimedByUserId_createdAt_idx`(`claimedByUserId`, `createdAt`),
    UNIQUE INDEX `CardIssue_cardTemplateId_issueNumber_key`(`cardTemplateId`, `issueNumber`),
    UNIQUE INDEX `CardIssue_issueHash_key`(`issueHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CardGenerationJob` (
    `id` VARCHAR(191) NOT NULL,
    `cardTemplateId` VARCHAR(191) NOT NULL,
    `provider` ENUM('STUB') NOT NULL DEFAULT 'STUB',
    `status` ENUM('QUEUED', 'PROCESSING', 'READY', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `inputJson` JSON NOT NULL,
    `outputJson` JSON NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CardGenerationJob_cardTemplateId_createdAt_idx`(`cardTemplateId`, `createdAt`),
    INDEX `CardGenerationJob_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SourceReference` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `sourceType` ENUM('VERIFIED_TEAM_ACCOUNT', 'TEAM_MANAGER', 'OFFICIAL_SCORER', 'PLAYER_REPORT', 'SPECTATOR_REPORT', 'MULTI_SPECTATOR_REPORT', 'TEAM_WEBSITE', 'LEAGUE_WEBSITE', 'MAXPREPS', 'HUDL', 'YOUTUBE', 'NEWS_ARTICLE', 'BOXSCORE_PDF', 'SCOREBOOK_PHOTO', 'PUBLIC_SCRAPE', 'OTHER') NOT NULL,
    `url` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,
    `importedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SourceReference_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispute` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `fieldName` VARCHAR(191) NULL,
    `submittedByUserId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `proposedValue` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `resolutionNote` VARCHAR(191) NULL,
    `resolvedByUserId` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Dispute_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `Dispute_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Claim` (
    `id` VARCHAR(191) NOT NULL,
    `athleteProfileId` VARCHAR(191) NOT NULL,
    `requestedByUserId` VARCHAR(191) NOT NULL,
    `verificationNote` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedByUserId` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Claim_athleteProfileId_status_idx`(`athleteProfileId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` VARCHAR(191) NOT NULL,
    `authorUserId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `keywords` JSON NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `rejectionNote` VARCHAR(191) NULL,
    `reviewedByUserId` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Article_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Article_authorUserId_status_idx`(`authorUserId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `id` VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Follow_targetType_targetId_idx`(`targetType`, `targetId`),
    UNIQUE INDEX `Follow_followerId_targetType_targetId_key`(`followerId`, `targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `type` ENUM('LIKE', 'FIRE', 'CLAP') NOT NULL DEFAULT 'LIKE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Reaction_targetType_targetId_idx`(`targetType`, `targetId`),
    UNIQUE INDEX `Reaction_userId_targetType_targetId_key`(`userId`, `targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameReaction` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `type` ENUM('LIKE', 'FIRE', 'CLAP') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GameReaction_gameId_createdAt_idx`(`gameId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedItem` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('GAME_FINAL', 'STAT_MILESTONE', 'MEDIA_ADDED', 'PLAYER_JOINED_TEAM', 'PROFILE_CLAIMED', 'DISPUTE_RESOLVED', 'CARD_PUBLISHED', 'CARD_CLAIMED', 'CARD_DOWNLOADED', 'ARTICLE_PUBLISHED') NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FeedItem_occurredAt_idx`(`occurredAt`),
    INDEX `FeedItem_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NOT NULL,
    `subjectUserId` VARCHAR(191) NULL,
    `action` ENUM('ADMIN_IMPERSONATE_SET', 'ADMIN_IMPERSONATE_CLEAR', 'ADMIN_BULK_CREATE_PLAYERS', 'ADMIN_BULK_ADD_ROSTER', 'ADMIN_CREATE_FEED_ITEM', 'ADMIN_MUTATION') NOT NULL DEFAULT 'ADMIN_MUTATION',
    `method` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PLAYER', 'TEAM', 'GAME', 'FEED_ITEM', 'ATHLETE_PROFILE', 'GAME_STAT_LINE', 'GAME_EVENT', 'PROFILE_FIELD', 'SOURCE_REFERENCE', 'PLAYER_SEASON_STAT', 'TEAM_SEASON_STAT', 'CARD_TEMPLATE', 'CARD_ISSUE', 'ARTICLE') NULL,
    `targetId` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `diffJson` JSON NULL,
    `requestId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminAuditLog_createdAt_idx`(`createdAt`),
    INDEX `AdminAuditLog_actorUserId_createdAt_idx`(`actorUserId`, `createdAt`),
    INDEX `AdminAuditLog_subjectUserId_createdAt_idx`(`subjectUserId`, `createdAt`),
    INDEX `AdminAuditLog_targetType_targetId_idx`(`targetType`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `League` ADD CONSTRAINT `League_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Season` ADD CONSTRAINT `Season_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_schoolId_fkey` FOREIGN KEY (`schoolId`) REFERENCES `School`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AthleteProfile` ADD CONSTRAINT `AthleteProfile_claimedByUserId_fkey` FOREIGN KEY (`claimedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_athleteProfileId_fkey` FOREIGN KEY (`athleteProfileId`) REFERENCES `AthleteProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player` ADD CONSTRAINT `Player_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RosterMembership` ADD CONSTRAINT `RosterMembership_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RosterMembership` ADD CONSTRAINT `RosterMembership_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RosterMembership` ADD CONSTRAINT `RosterMembership_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameTeam` ADD CONSTRAINT `GameTeam_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameTeam` ADD CONSTRAINT `GameTeam_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameReporter` ADD CONSTRAINT `GameReporter_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameReporter` ADD CONSTRAINT `GameReporter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameReporter` ADD CONSTRAINT `GameReporter_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameEvent` ADD CONSTRAINT `GameEvent_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameEvent` ADD CONSTRAINT `GameEvent_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `GameReporter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameEvent` ADD CONSTRAINT `GameEvent_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameEvent` ADD CONSTRAINT `GameEvent_consensusGroupId_fkey` FOREIGN KEY (`consensusGroupId`) REFERENCES `GameConsensusGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameConsensusGroup` ADD CONSTRAINT `GameConsensusGroup_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameStatLine` ADD CONSTRAINT `GameStatLine_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameStatLine` ADD CONSTRAINT `GameStatLine_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSeasonStat` ADD CONSTRAINT `PlayerSeasonStat_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerSeasonStat` ADD CONSTRAINT `PlayerSeasonStat_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSeasonStat` ADD CONSTRAINT `TeamSeasonStat_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSeasonStat` ADD CONSTRAINT `TeamSeasonStat_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageAsset` ADD CONSTRAINT `ImageAsset_uploadedByUserId_fkey` FOREIGN KEY (`uploadedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_athleteProfileId_fkey` FOREIGN KEY (`athleteProfileId`) REFERENCES `AthleteProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_frontImageAssetId_fkey` FOREIGN KEY (`frontImageAssetId`) REFERENCES `ImageAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_sourceImageAssetId_fkey` FOREIGN KEY (`sourceImageAssetId`) REFERENCES `ImageAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardIssue` ADD CONSTRAINT `CardIssue_cardTemplateId_fkey` FOREIGN KEY (`cardTemplateId`) REFERENCES `CardTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardIssue` ADD CONSTRAINT `CardIssue_ownerUserId_fkey` FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardIssue` ADD CONSTRAINT `CardIssue_claimedByUserId_fkey` FOREIGN KEY (`claimedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CardGenerationJob` ADD CONSTRAINT `CardGenerationJob_cardTemplateId_fkey` FOREIGN KEY (`cardTemplateId`) REFERENCES `CardTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_submittedByUserId_fkey` FOREIGN KEY (`submittedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_resolvedByUserId_fkey` FOREIGN KEY (`resolvedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_athleteProfileId_fkey` FOREIGN KEY (`athleteProfileId`) REFERENCES `AthleteProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_requestedByUserId_fkey` FOREIGN KEY (`requestedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD CONSTRAINT `Claim_reviewedByUserId_fkey` FOREIGN KEY (`reviewedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_reviewedByUserId_fkey` FOREIGN KEY (`reviewedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameReaction` ADD CONSTRAINT `GameReaction_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAuditLog` ADD CONSTRAINT `AdminAuditLog_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAuditLog` ADD CONSTRAINT `AdminAuditLog_subjectUserId_fkey` FOREIGN KEY (`subjectUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
