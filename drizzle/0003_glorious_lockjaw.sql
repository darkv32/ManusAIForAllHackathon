ALTER TABLE `ingredients` ADD `minStock` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ingredients` ADD `reorderPoint` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ingredients` ADD `leadTimeDays` int DEFAULT 3;--> statement-breakpoint
ALTER TABLE `ingredients` ADD `expiryDate` timestamp;--> statement-breakpoint
ALTER TABLE `ingredients` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `ingredients` ADD `supplier` varchar(255);