import { boolean, date, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  isSubscribed: boolean("is_subscribed").default(false),
  subscriptionEnds: date("subscription_ends"),
});

export const Todos = pgTable("todos", {
  id: serial("id").primaryKey().notNull(),
  userId: varchar("user_id", { length: 255 })
    .references(() => Users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  completed: boolean("completed").default(false),
  createdAt: date("created_at").defaultNow().notNull(),
  updatedAt: date("updated_at").defaultNow().notNull(),
});
