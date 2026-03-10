CREATE TABLE `complianceImprovementActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`status` enum('open','in_progress','completed','cancelled') DEFAULT 'open',
	`estimatedEffort` varchar(50),
	`actualEffort` varchar(50),
	`deadline` datetime,
	`completedAt` datetime,
	`relatedNIS2Articles` json,
	`relatedISO27001Controls` json,
	`relatedCVEs` json,
	`expectedImpact` text,
	`actualImpact` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceImprovementActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`actionId` int,
	`snapshotType` enum('baseline','before_action','after_action','periodic') NOT NULL,
	`nis2Score` decimal(5,2),
	`iso27001Score` decimal(5,2),
	`mitreAttackCoverage` decimal(5,2),
	`overallRiskScore` decimal(5,2),
	`vulnerabilityCount` int,
	`criticalVulnerabilities` int,
	`complianceGaps` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceTrends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`nis2ScoreAverage` decimal(5,2),
	`iso27001ScoreAverage` decimal(5,2),
	`mitreAttackCoverageAverage` decimal(5,2),
	`actionsCompletedCount` int,
	`vulnerabilitiesResolvedCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceTrends_id` PRIMARY KEY(`id`)
);
