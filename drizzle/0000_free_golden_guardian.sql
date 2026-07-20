CREATE TABLE `lira_transmissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`status` text DEFAULT 'answered' NOT NULL,
	`created_at` integer NOT NULL
);
