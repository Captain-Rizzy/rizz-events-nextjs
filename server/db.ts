import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  adminCredentials,
  events,
  ticketPackages,
  sponsors,
  galleryImages,
  bookings,
  payments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Admin Credentials
export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminCredentials)
    .where(eq(adminCredentials.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminCredential(
  username: string,
  passwordHash: string,
  email: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(adminCredentials).values({
    username,
    passwordHash,
    email,
  });
}

// Events
export async function getEvent(eventId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFirstEvent() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(events).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEvent(eventId: number, data: Partial<typeof events.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(events).set(data).where(eq(events.id, eventId));
}

export async function createEvent(data: typeof events.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(events).values(data);
  return result;
}

// Ticket Packages
export async function getTicketPackagesByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(ticketPackages)
    .where(eq(ticketPackages.eventId, eventId));
}

export async function getTicketPackage(packageId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(ticketPackages)
    .where(eq(ticketPackages.id, packageId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createTicketPackage(data: typeof ticketPackages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ticketPackages).values(data);
  return result;
}

export async function updateTicketPackage(
  packageId: number,
  data: Partial<typeof ticketPackages.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(ticketPackages).set(data).where(eq(ticketPackages.id, packageId));
}

export async function deleteTicketPackage(packageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(ticketPackages).where(eq(ticketPackages.id, packageId));
}

// Sponsors
export async function getSponsorsByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.eventId, eventId));
}

export async function createSponsor(data: typeof sponsors.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sponsors).values(data);
  return result;
}

export async function updateSponsor(
  sponsorId: number,
  data: Partial<typeof sponsors.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(sponsors).set(data).where(eq(sponsors.id, sponsorId));
}

export async function deleteSponsor(sponsorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(sponsors).where(eq(sponsors.id, sponsorId));
}

// Gallery Images
export async function getGalleryImagesByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.eventId, eventId));
}

export async function createGalleryImage(data: typeof galleryImages.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galleryImages).values(data);
  return result;
}

export async function deleteGalleryImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(galleryImages).where(eq(galleryImages.id, imageId));
}

// Bookings
export async function createBooking(data: typeof bookings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bookings).values(data);
  return result;
}

export async function getBookingByCode(bookingCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingCode, bookingCode))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingsByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(bookings).where(eq(bookings.eventId, eventId));
}

export async function updateBooking(
  bookingId: number,
  data: Partial<typeof bookings.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set(data).where(eq(bookings.id, bookingId));
}

// Payments
export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
}

export async function updatePayment(
  paymentId: number,
  data: Partial<typeof payments.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set(data).where(eq(payments.id, paymentId));
}
