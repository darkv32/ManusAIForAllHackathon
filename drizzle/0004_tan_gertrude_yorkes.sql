CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(64) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotionId` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`promotionType` enum('featured','limited_time','bundle','discount','seasonal') NOT NULL,
	`affectedMenuItems` text NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('planned','running','completed','cancelled') NOT NULL DEFAULT 'planned',
	`expectedSalesVolume` int,
	`expectedInventoryDepletion` decimal(5,2),
	`expectedProfitContribution` decimal(10,2),
	`actualSalesVolume` int,
	`actualInventoryDepletion` decimal(5,2),
	`actualProfitContribution` decimal(10,2),
	`rationale` text,
	`dataInputs` text,
	`assumptions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_promotionId_unique` UNIQUE(`promotionId`)
);
