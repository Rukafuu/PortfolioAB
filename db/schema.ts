import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liraTransmissions = sqliteTable(
  "lira_transmissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull(),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    status: text("status").notNull().default("answered"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("lira_transmissions_session_idx").on(table.sessionId, table.createdAt)],
);

export const guestbookEntries = sqliteTable(
  "guestbook_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    message: text("message").notNull(),
    url: text("url"),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash").notNull(),
  },
  (table) => [
    index("guestbook_entries_status_created_idx").on(table.status, table.createdAt),
    index("guestbook_entries_ip_created_idx").on(table.ipHash, table.createdAt),
  ],
);
