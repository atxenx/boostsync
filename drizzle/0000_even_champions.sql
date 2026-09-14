CREATE TABLE `AuditLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`action` text NOT NULL,
	`metadata` text,
	`ip` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Order` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`serviceId` text NOT NULL,
	`providerId` text,
	`providerOrderId` text,
	`link` text NOT NULL,
	`quantity` integer NOT NULL,
	`charge` real NOT NULL,
	`providerCost` real DEFAULT 0 NOT NULL,
	`sellingPrice` real DEFAULT 0 NOT NULL,
	`profit` real DEFAULT 0 NOT NULL,
	`startCount` integer,
	`remains` integer,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `Payment` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`provider` text NOT NULL,
	`externalPaymentId` text,
	`amount` real NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`metadata` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Provider` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`apiUrl` text NOT NULL,
	`encryptedApiKey` text,
	`active` integer DEFAULT true NOT NULL,
	`defaultMarkupType` text DEFAULT 'PERCENTAGE' NOT NULL,
	`defaultMarkupValue` real DEFAULT 30 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Service` (
	`id` text PRIMARY KEY NOT NULL,
	`providerServiceId` text NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`type` text,
	`minQuantity` integer NOT NULL,
	`maxQuantity` integer NOT NULL,
	`providerRate` real NOT NULL,
	`customerRate` real NOT NULL,
	`markupType` text DEFAULT 'PERCENTAGE' NOT NULL,
	`markupValue` real DEFAULT 30 NOT NULL,
	`refillSupported` integer DEFAULT false NOT NULL,
	`cancelSupported` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`providerId` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Service_providerId_providerServiceId_key` ON `Service` (`providerId`,`providerServiceId`);--> statement-breakpoint
CREATE TABLE `TicketMessage` (
	`id` text PRIMARY KEY NOT NULL,
	`ticketId` text NOT NULL,
	`senderId` text NOT NULL,
	`message` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Ticket` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`balanceBefore` real NOT NULL,
	`balanceAfter` real NOT NULL,
	`reference` text,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`username` text,
	`email` text NOT NULL,
	`passwordHash` text,
	`role` text DEFAULT 'USER' NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_username_key` ON `User` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_key` ON `User` (`email`);