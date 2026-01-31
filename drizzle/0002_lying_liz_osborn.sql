CREATE TABLE `draftMenuItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`recommendedPrice` decimal(10,2) NOT NULL,
	`totalCogs` decimal(10,4) NOT NULL,
	`projectedMargin` decimal(5,2) NOT NULL,
	`strategicJustification` text,
	`recipe` text NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `draftMenuItems_id` PRIMARY KEY(`id`)
);
