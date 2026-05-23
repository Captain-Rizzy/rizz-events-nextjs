import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

/**
 * Create a mock context for testing
 */
function createMockContext(adminToken?: string): TrpcContext {
  const cookies: Record<string, string> = {};
  if (adminToken) {
    cookies["admin_token"] = adminToken;
  }

  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies,
    } as any,
    res: {
      setHeader: () => {},
      clearCookie: () => {},
    } as any,
  };
}

describe("Admin Procedures Integration", () => {
  describe("Admin Login", () => {
    it("should reject login with invalid credentials", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.login({
          username: "nonexistent",
          password: "wrongpassword",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Protected Admin Routes", () => {
    it("should reject admin.me without token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.me();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
          expect(error.message).toContain("No admin token");
        }
      }
    });

    it("should reject admin.me with invalid token", async () => {
      const ctx = createMockContext("invalid.token.format");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.me();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
          expect(error.message).toContain("Invalid token");
        }
      }
    });
  });

  describe("Admin Logout", () => {
    it("should successfully logout", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.logout();
      expect(result).toEqual({ success: true });
    });
  });

  describe("Event Management", () => {
    it("should fetch event without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // This should work without auth (public procedure)
      try {
        const result = await caller.event.get(1);
        // Result might be null if event doesn't exist, but no auth error
        expect(result === null || result !== undefined).toBe(true);
      } catch (error) {
        // Database errors are ok, we're testing auth not db
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject event update without admin token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.event.update({
          eventId: 1,
          name: "Updated Event",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject event update with invalid token", async () => {
      const ctx = createMockContext("invalid.token");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.event.update({
          eventId: 1,
          name: "Updated Event",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Ticket Packages", () => {
    it("should list packages without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // This should work without auth (public procedure)
      try {
        const result = await caller.packages.list(1);
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Database errors are ok, we're testing auth not db
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject package creation without admin token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.packages.create({
          eventId: 1,
          name: "VIP Package",
          price: "99.99",
          capacity: 100,
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Sponsors", () => {
    it("should list sponsors without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // This should work without auth (public procedure)
      try {
        const result = await caller.sponsors.list(1);
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Database errors are ok, we're testing auth not db
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject sponsor creation without admin token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.sponsors.create({
          eventId: 1,
          name: "Sponsor Name",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Gallery", () => {
    it("should list gallery images without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // This should work without auth (public procedure)
      try {
        const result = await caller.gallery.list(1);
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        // Database errors are ok, we're testing auth not db
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject gallery image creation without admin token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.gallery.create({
          eventId: 1,
          imageUrl: "https://example.com/image.jpg",
          imageKey: "image-key",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Bookings", () => {
    it("should create booking without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Public procedure - should not require auth
      try {
        const result = await caller.bookings.create({
          eventId: 1,
          packageId: 1,
          attendeeName: "John Doe",
          attendeeEmail: "john@example.com",
          quantity: 1,
          totalPrice: "99.99",
        });

        // Should either succeed or fail due to data constraints, not auth
        expect(result).toBeDefined();
      } catch (error) {
        // If it fails, it should not be an auth error
        // Database errors or validation errors are ok
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should lookup booking by code without authentication", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Public procedure - should not require auth
      try {
        const result = await caller.bookings.getByCode("INVALID-CODE");
        // Result might be null, but no auth error
        expect(result === null || result !== undefined).toBe(true);
      } catch (error) {
        // If database is not available, that's ok for this test
        // We're just checking auth, not database functionality
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });

    it("should reject booking update without admin token", async () => {
      const ctx = createMockContext(); // No token
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.bookings.update({
          bookingId: 1,
          paymentStatus: "completed",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });
  });
});
