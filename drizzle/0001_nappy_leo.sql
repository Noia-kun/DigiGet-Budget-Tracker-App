CREATE TABLE `ledger_snapshots` (
	`deviceId` varchar(96) NOT NULL,
	`snapshot` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ledger_snapshots_deviceId` PRIMARY KEY(`deviceId`)
);
