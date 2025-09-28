CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`last_used_cbdb_path` text,
	`cbdb_opened_at` text,
	`theme` text DEFAULT 'light',
	`language` text DEFAULT 'en',
	`window_state` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `recent_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_path` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer,
	`last_opened_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`open_count` integer DEFAULT 1 NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recent_files_file_path_unique` ON `recent_files` (`file_path`);--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`search_query` text NOT NULL,
	`search_type` text NOT NULL,
	`results_count` integer DEFAULT 0,
	`cbdb_path` text,
	`searched_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL
);
