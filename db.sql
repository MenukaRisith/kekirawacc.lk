SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- CLUBS
CREATE TABLE `Club` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(191)  NOT NULL,
  `slug`         VARCHAR(191)  NOT NULL,
  `shortName`    VARCHAR(191)  NULL,
  `category`     VARCHAR(191)  NULL,
  `description`  TEXT          NOT NULL,
  `coverImage`   VARCHAR(512)  NULL,
  `logoImage`    VARCHAR(512)  NULL,
  `createdAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Club_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USERS
CREATE TABLE `User` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `email`        VARCHAR(191)  NOT NULL,
  `passwordHash` VARCHAR(255)  NOT NULL,
  `fullName`     VARCHAR(191)  NOT NULL,
  `role`         ENUM('ADMIN','AUTHOR','CLUB_REP') NOT NULL,
  `clubId`       INT UNSIGNED  NULL,
  `createdAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_clubId_idx` (`clubId`),
  CONSTRAINT `User_clubId_fkey`
    FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SESSIONS
CREATE TABLE `Session` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    INT UNSIGNED NOT NULL,
  `createdAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Session_userId_idx` (`userId`),
  CONSTRAINT `Session_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STAFF
CREATE TABLE `StaffMember` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(191) NOT NULL,
  `photoUrl`      VARCHAR(512) NULL,
  `roleTitle`     VARCHAR(191) NOT NULL,
  `department`    VARCHAR(191) NULL,
  `isInAdminPage` TINYINT(1)   NOT NULL DEFAULT 0,
  `sortOrder`     INT          NOT NULL DEFAULT 0,
  `createdAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALUMNI
CREATE TABLE `Alumni` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(191) NOT NULL,
  `slug`         VARCHAR(191) NOT NULL,
  `gradYear`     INT          NULL,
  `photoUrl`     VARCHAR(512) NULL,
  `headline`     VARCHAR(255) NULL,
  `bio`          TEXT         NULL,
  `achievements` TEXT         NULL,
  `isFeatured`   TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Alumni_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NEWS POSTS
CREATE TABLE `NewsPost` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `excerpt`     VARCHAR(512) NULL,
  `content`     LONGTEXT     NOT NULL,
  `coverImage`  VARCHAR(512) NULL,
  `status`      ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `publishedAt` DATETIME     NULL,
  `authorId`    INT UNSIGNED NOT NULL,
  `clubId`      INT UNSIGNED NULL,
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NewsPost_slug_key` (`slug`),
  KEY `NewsPost_authorId_idx` (`authorId`),
  KEY `NewsPost_clubId_idx` (`clubId`),
  KEY `NewsPost_status_publishedAt_idx` (`status`, `publishedAt`),
  CONSTRAINT `NewsPost_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `NewsPost_clubId_fkey`
    FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EVENTS
CREATE TABLE `Event` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `description` LONGTEXT     NOT NULL,
  `location`    VARCHAR(255) NOT NULL,
  `startDate`   DATETIME     NOT NULL,
  `endDate`     DATETIME     NULL,
  `coverImage`  VARCHAR(512) NULL,
  `category`    VARCHAR(191) NULL,
  `status`      ENUM('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `publishedAt` DATETIME     NULL,
  `clubId`      INT UNSIGNED NULL,
  `createdById` INT UNSIGNED NOT NULL,
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Event_slug_key` (`slug`),
  KEY `Event_clubId_idx` (`clubId`),
  KEY `Event_createdById_idx` (`createdById`),
  KEY `Event_status_startDate_idx` (`status`, `startDate`),
  CONSTRAINT `Event_clubId_fkey`
    FOREIGN KEY (`clubId`) REFERENCES `Club`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `Event_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE Club
  ADD COLUMN teacherInChargeJson JSON NULL AFTER logoImage,
  ADD COLUMN committeeMembersJson JSON NULL AFTER teacherInChargeJson;

ALTER TABLE Alumni
  ADD COLUMN category VARCHAR(100) NULL AFTER achievements;

-- Optional but recommended if you'll filter by category later
CREATE INDEX idx_alumni_category ON Alumni (category);

ALTER TABLE NewsPost
  ADD COLUMN metaKeywords VARCHAR(500) NULL AFTER excerpt;
