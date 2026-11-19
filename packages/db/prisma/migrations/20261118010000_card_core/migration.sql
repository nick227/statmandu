-- AlterTable
ALTER TABLE `CardTemplate` ADD COLUMN `contentSnapshotJson` JSON NULL,
    ADD COLUMN `generationKey` VARCHAR(191) NULL,
    ADD COLUMN `publicationType` ENUM('COMMUNITY', 'OFFICIAL') NOT NULL DEFAULT 'COMMUNITY',
    ADD COLUMN `publishedByUserId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CardTemplate_generationKey_key` ON `CardTemplate`(`generationKey`);

-- CreateIndex
CREATE INDEX `CardTemplate_publishedByUserId_idx` ON `CardTemplate`(`publishedByUserId`);

-- AddForeignKey
ALTER TABLE `CardTemplate` ADD CONSTRAINT `CardTemplate_publishedByUserId_fkey` FOREIGN KEY (`publishedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Legacy publisher and profile-creator attribution stay NULL: do not guess.
-- Capture currently available legacy content, explicitly marked as migration capture.
UPDATE CardTemplate c JOIN AthleteProfile p ON p.id = c.athleteProfileId
LEFT JOIN ImageAsset i ON i.id = c.frontImageAssetId
SET c.contentSnapshotJson = JSON_OBJECT(
  'schemaVersion', 1, 'captureOrigin', 'migration-current-content',
  'title', c.title, 'createdByUserId', c.createdByUserId, 'publishedByUserId', NULL,
  'publicationType', 'COMMUNITY', 'facts', c.statsSnapshotJson,
  'person', JSON_OBJECT('id', p.id, 'slug', p.slug, 'displayName', p.displayName,
    'aliases', COALESCE(p.aliases, JSON_ARRAY()), 'bio', p.bio, 'hometown', p.hometown,
    'avatarUrl', p.avatarUrl, 'claimedByUserId', p.claimedByUserId),
  'frontImage', IF(i.id IS NULL, NULL, JSON_OBJECT('id', i.id, 'url', i.url))
) WHERE c.publishedAt IS NOT NULL AND c.contentSnapshotJson IS NULL;
