CREATE TABLE `ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ingredientId` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`costPerUnit` decimal(10,6) NOT NULL,
	`currentStock` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ingredients_id` PRIMARY KEY(`id`),
	CONSTRAINT `ingredients_ingredientId_unique` UNIQUE(`ingredientId`)
);
--> statement-breakpoint
CREATE TABLE `menuItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` varchar(32) NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`salesPrice` decimal(10,2) NOT NULL,
	`taxRate` decimal(5,4) DEFAULT '0.08',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `menuItems_itemId_unique` UNIQUE(`itemId`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipeId` varchar(32) NOT NULL,
	`menuItemId` varchar(32) NOT NULL,
	`ingredientId` varchar(32) NOT NULL,
	`quantity` decimal(10,4) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `recipes_recipeId_unique` UNIQUE(`recipeId`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(32) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`menuItemId` varchar(32) NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalSales` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(64) NOT NULL,
	`paymentDetail` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
