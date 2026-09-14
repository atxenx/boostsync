import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updatedAt").notNull(),
};

export const users = sqliteTable("User", {
  id: text("id").primaryKey(),
  name: text("name"),
  username: text("username"),
  email: text("email").notNull(),
  passwordHash: text("passwordHash"),
  role: text("role").notNull().default("USER"),
  balance: real("balance").notNull().default(0),
  ...timestamps,
}, (table) => [
  uniqueIndex("User_username_key").on(table.username),
  uniqueIndex("User_email_key").on(table.email),
]);

export const providers = sqliteTable("Provider", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  apiUrl: text("apiUrl").notNull(),
  encryptedApiKey: text("encryptedApiKey"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  defaultMarkupType: text("defaultMarkupType").notNull().default("PERCENTAGE"),
  defaultMarkupValue: real("defaultMarkupValue").notNull().default(30),
  ...timestamps,
});

export const services = sqliteTable("Service", {
  id: text("id").primaryKey(),
  providerServiceId: text("providerServiceId").notNull(),
  name: text("name").notNull(),
  platform: text("platform").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  type: text("type"),
  minQuantity: integer("minQuantity").notNull(),
  maxQuantity: integer("maxQuantity").notNull(),
  providerRate: real("providerRate").notNull(),
  customerRate: real("customerRate").notNull(),
  markupType: text("markupType").notNull().default("PERCENTAGE"),
  markupValue: real("markupValue").notNull().default(30),
  refillSupported: integer("refillSupported", { mode: "boolean" }).notNull().default(false),
  cancelSupported: integer("cancelSupported", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  providerId: text("providerId").notNull().references(() => providers.id, { onDelete: "cascade", onUpdate: "cascade" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("Service_providerId_providerServiceId_key").on(table.providerId, table.providerServiceId),
]);

export const orders = sqliteTable("Order", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  serviceId: text("serviceId").notNull().references(() => services.id, { onDelete: "restrict", onUpdate: "cascade" }),
  providerId: text("providerId").references(() => providers.id, { onDelete: "set null", onUpdate: "cascade" }),
  providerOrderId: text("providerOrderId"),
  link: text("link").notNull(),
  quantity: integer("quantity").notNull(),
  charge: real("charge").notNull(),
  providerCost: real("providerCost").notNull().default(0),
  sellingPrice: real("sellingPrice").notNull().default(0),
  profit: real("profit").notNull().default(0),
  startCount: integer("startCount"),
  remains: integer("remains"),
  status: text("status").notNull().default("PENDING"),
  ...timestamps,
});

export const transactions = sqliteTable("Transaction", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  balanceBefore: real("balanceBefore").notNull(),
  balanceAfter: real("balanceAfter").notNull(),
  reference: text("reference"),
  status: text("status").notNull().default("COMPLETED"),
  createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const payments = sqliteTable("Payment", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  provider: text("provider").notNull(),
  externalPaymentId: text("externalPaymentId"),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("PENDING"),
  metadata: text("metadata"),
  ...timestamps,
});

export const tickets = sqliteTable("Ticket", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("OPEN"),
  priority: text("priority").notNull().default("MEDIUM"),
  ...timestamps,
});

export const ticketMessages = sqliteTable("TicketMessage", {
  id: text("id").primaryKey(),
  ticketId: text("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade", onUpdate: "cascade" }),
  senderId: text("senderId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  message: text("message").notNull(),
  createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable("AuditLog", {
  id: text("id").primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  action: text("action").notNull(),
  metadata: text("metadata"),
  ip: text("ip"),
  createdAt: text("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});
