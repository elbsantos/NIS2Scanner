CREATE TABLE `complianceScoreHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`nis2Score` decimal(5,2),
	`iso27001Score` decimal(5,2),
	`mitreAttackCoverage` decimal(5,2),
	`overallRiskScore` decimal(5,2),
	`vulnerabilityCount` int,
	`criticalVulnerabilities` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceScoreHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cveMitreMapping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cveId` varchar(20) NOT NULL,
	`techniqueId` varchar(20) NOT NULL,
	`confidence` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cveMitreMapping_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iso27001Controls` (
	`id` varchar(10) NOT NULL,
	`domain` varchar(10) NOT NULL,
	`controlCode` varchar(10) NOT NULL,
	`description` text NOT NULL,
	`controlObjective` text,
	`implementationGuidance` text,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iso27001Controls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mitreAttackTechniques` (
	`id` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`tactic` varchar(100) NOT NULL,
	`description` text,
	`platforms` text,
	`detectionMethods` text,
	`mitigations` text,
	`externalReferences` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mitreAttackTechniques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizationISO27001Status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`controlId` varchar(10) NOT NULL,
	`implementationStatus` enum('not_started','in_progress','implemented','optimized') DEFAULT 'not_started',
	`evidence` text,
	`responsible` varchar(255),
	`deadline` datetime,
	`lastReviewDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizationISO27001Status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilityISO27001Mapping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vulnerabilityId` int NOT NULL,
	`controlId` varchar(10) NOT NULL,
	`relevance` enum('critical','high','medium','low') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vulnerabilityISO27001Mapping_id` PRIMARY KEY(`id`)
);
