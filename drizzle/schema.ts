import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table for system authentication.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin credentials table for JWT-based authentication.
 * Stores hashed passwords for admin login (separate from OAuth users).
 */
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Event configuration table.
 * Stores all event details that are displayed on the public website.
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  description: text("description"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  contactAddress: text("contactAddress"),
  logoUrl: varchar("logoUrl", { length: 500 }),
  logoKey: varchar("logoKey", { length: 500 }),
  brandColorPrimary: varchar("brandColorPrimary", { length: 7 }).default("#000000"),
  brandColorSecondary: varchar("brandColorSecondary", { length: 7 }).default("#D4AF37"),
  theme: mysqlEnum("theme", ["dark", "light"]).default("dark"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Ticket packages table.
 * Stores different ticket tiers with pricing, benefits, and capacity.
 */
export const ticketPackages = mysqlTable("ticket_packages", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: int("capacity").notNull(),
  benefits: json("benefits").$type<string[]>().default([]),
  installmentOptions: json("installmentOptions").$type<{
    numberOfPayments: number;
    paymentAmount: number;
  }[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TicketPackage = typeof ticketPackages.$inferSelect;
export type InsertTicketPackage = typeof ticketPackages.$inferInsert;

/**
 * Sponsors/Partners table.
 * Stores sponsor information with logos.
 */
export const sponsors = mysqlTable("sponsors", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  logoKey: varchar("logoKey", { length: 500 }),
  website: varchar("website", { length: 500 }),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;

/**
 * Gallery images table.
 * Stores event gallery images.
 */
export const galleryImages = mysqlTable("gallery_images", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  imageKey: varchar("imageKey", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 500 }),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

/**
 * Bookings table.
 * Stores booking information with unique booking codes.
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  packageId: int("packageId").notNull(),
  bookingCode: varchar("bookingCode", { length: 50 }).notNull().unique(),
  attendeeName: varchar("attendeeName", { length: 255 }).notNull(),
  attendeeEmail: varchar("attendeeEmail", { length: 320 }).notNull(),
  attendeePhone: varchar("attendeePhone", { length: 20 }),
  quantity: int("quantity").default(1),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "partial", "completed"]).default("pending"),
  installmentPlan: json("installmentPlan").$type<{
    totalPayments: number;
    paymentsMade: number;
    nextPaymentDue: string;
    payments: Array<{
      amount: number;
      dueDate: string;
      paidDate?: string;
      status: "pending" | "completed";
    }>;
  } | null>().default(null),
  ticketUrl: varchar("ticketUrl", { length: 500 }),
  ticketKey: varchar("ticketKey", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Payment records table.
 * Tracks individual payment transactions for bookings.
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
