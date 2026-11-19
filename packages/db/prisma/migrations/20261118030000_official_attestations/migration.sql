-- Additive only: legacy controls/approvals are not silently upgraded to publishing grants.
ALTER TABLE `Claim`
  MODIFY `status` ENUM('PENDING','APPROVED','REJECTED','REVOKED') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `publishingApprovedAt` DATETIME(3) NULL,
  ADD COLUMN `publishingApprovedByUserId` VARCHAR(191) NULL,
  ADD COLUMN `revokedAt` DATETIME(3) NULL,
  ADD COLUMN `revokedByUserId` VARCHAR(191) NULL,
  ADD COLUMN `revocationReason` TEXT NULL,
  ADD CONSTRAINT `Claim_publishingApprovedByUserId_fkey` FOREIGN KEY (`publishingApprovedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Claim_revokedByUserId_fkey` FOREIGN KEY (`revokedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CardTemplate`
  ADD COLUMN `authorizationClaimId` VARCHAR(191) NULL,
  ADD COLUMN `attestationVersion` INTEGER NULL,
  ADD COLUMN `manifestJson` JSON NULL,
  ADD COLUMN `manifestHash` VARCHAR(191) NULL,
  ADD COLUMN `manifestSignature` TEXT NULL,
  ADD COLUMN `signingKeyId` VARCHAR(191) NULL,
  ADD INDEX `CardTemplate_authorizationClaimId_idx` (`authorizationClaimId`),
  ADD CONSTRAINT `CardTemplate_authorizationClaimId_fkey` FOREIGN KEY (`authorizationClaimId`) REFERENCES `Claim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- No release, issue hash, approval timestamp, or historical content is rewritten.
