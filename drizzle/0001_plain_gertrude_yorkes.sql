CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('server','network','workstation','iot','other') NOT NULL,
	`ipAddress` varchar(45),
	`hostname` varchar(255),
	`description` text,
	`criticality` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('active','inactive','monitoring') DEFAULT 'active',
	`lastScanned` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(50),
	`resourceId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cveCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cveId` varchar(20) NOT NULL,
	`data` text,
	`source` enum('nvd','vulners','both') NOT NULL,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` datetime,
	CONSTRAINT `cveCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `cveCache_cveId_unique` UNIQUE(`cveId`)
);
--> statement-breakpoint
CREATE TABLE `nis2Mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vulnerabilityId` int NOT NULL,
	`article` varchar(20) NOT NULL,
	`requirement` varchar(255) NOT NULL,
	`status` enum('compliant','non_compliant','partial') NOT NULL,
	`riskLevel` enum('critical','high','medium','low') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nis2Mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int,
	`type` enum('critical_vulnerability','compliance_violation','scan_complete','report_ready') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`relatedVulnerabilityId` int,
	`relatedScanId` int,
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sector` varchar(100),
	`country` varchar(2) DEFAULT 'PT',
	`employees` int,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vulnerabilityId` int NOT NULL,
	`organizationId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`estimatedEffort` varchar(50),
	`steps` text,
	`resources` text,
	`status` enum('open','in_progress','resolved','ignored') DEFAULT 'open',
	`assignedTo` int,
	`dueDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`scanId` int,
	`title` varchar(255) NOT NULL,
	`reportType` enum('executive','technical','compliance','full') NOT NULL,
	`format` enum('json','html','pdf') NOT NULL,
	`content` text,
	`complianceScore` decimal(3,1),
	`nis2ArticlesCovered` int,
	`vulnerabilitiesSummary` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`assetId` int,
	`scanName` varchar(255) NOT NULL,
	`mode` enum('sme','supply') NOT NULL,
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`startTime` timestamp,
	`endTime` timestamp,
	`scanType` enum('network','web','supply_chain') NOT NULL,
	`targetRange` varchar(255),
	`portsScanned` text,
	`vulnerabilitiesFound` int DEFAULT 0,
	`criticalCount` int DEFAULT 0,
	`highCount` int DEFAULT 0,
	`mediumCount` int DEFAULT 0,
	`lowCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`cveId` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`cvssScore` decimal(3,1),
	`cvssVector` varchar(255),
	`severity` enum('critical','high','medium','low','info') NOT NULL,
	`affectedSoftware` varchar(255),
	`affectedVersion` varchar(100),
	`publishedDate` datetime,
	`exploitAvailable` boolean DEFAULT false,
	`exploitUrl` varchar(500),
	`remediationAvailable` boolean DEFAULT false,
	`remediationDetails` text,
	`nis2Articles` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vulnerabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `organizationId` int;