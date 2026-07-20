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
