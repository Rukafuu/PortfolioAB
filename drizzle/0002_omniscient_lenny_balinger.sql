CREATE TABLE `guestbook_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`ip_hash` text NOT NULL,
	`user_agent_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guestbook_entries_status_created_idx` ON `guestbook_entries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `guestbook_entries_ip_created_idx` ON `guestbook_entries` (`ip_hash`,`created_at`);