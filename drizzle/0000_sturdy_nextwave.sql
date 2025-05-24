CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`todo` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`priority` text NOT NULL,
	`notification_id` text
);
