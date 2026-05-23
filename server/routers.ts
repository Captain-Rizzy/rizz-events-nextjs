import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAdminByUsername,
  createAdminCredential,
  getEvent,
  updateEvent,
  createEvent,
  getFirstEvent,
  getTicketPackagesByEventId,
  getTicketPackage,
  createTicketPackage,
  updateTicketPackage,
  deleteTicketPackage,
  getSponsorsByEventId,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  getGalleryImagesByEventId,
  createGalleryImage,
  deleteGalleryImage,
  createBooking,
  getBookingByCode,
  getBookingsByEventId,
  updateBooking,
  createPayment,
  getPaymentsByBookingId,
} from "./db";
import {
  hashPassword,
  verifyPassword,
  generateAdminToken,
  verifyAdminToken,
  generateBookingCode,
} from "./auth";
import { sendBookingNotification } from "./notifications";
import { TRPCError } from "@trpc/server";

/**
 * Admin middleware to verify JWT token from cookies
 */
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.["admin_token"];
  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No admin token" });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return next({
    ctx: {
      ...ctx,
      adminId: payload.adminId,
      adminUsername: payload.username,
    },
  });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin Authentication
  admin: router({
    login: publicProcedure
      .input(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const token = generateAdminToken(admin.id, admin.username);
        const cookieOptions = getSessionCookieOptions(ctx.req);

        ctx.res.setHeader("Set-Cookie", [
          `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${24 * 60 * 60}`,
        ]);

        return {
          success: true,
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.setHeader("Set-Cookie", [
        "admin_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
      ]);
      return { success: true };
    }),

    me: adminProcedure.query(async ({ ctx }) => {
      return {
        adminId: ctx.adminId,
        username: ctx.adminUsername,
      };
    }),
  }),

  // Event Management
  event: router({
    get: publicProcedure.input(z.number().optional()).query(async ({ input }) => {
      if (input) {
        return await getEvent(input);
      }
      return await getFirstEvent();
    }),

    update: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          name: z.string().optional(),
          date: z.date().optional(),
          venue: z.string().optional(),
          description: z.string().optional(),
          contactEmail: z.string().optional(),
          contactPhone: z.string().optional(),
          contactAddress: z.string().optional(),
          logoUrl: z.string().optional(),
          logoKey: z.string().optional(),
          brandColorPrimary: z.string().optional(),
          brandColorSecondary: z.string().optional(),
          theme: z.enum(["dark", "light"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { eventId, ...data } = input;
        await updateEvent(eventId, data);
        return await getEvent(eventId);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          date: z.date(),
          venue: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createEvent({
          name: input.name,
          date: input.date,
          venue: input.venue,
          description: input.description,
        });
        return result;
      }),
  }),

  // Ticket Packages
  packages: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await getTicketPackagesByEventId(input);
    }),

    get: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await getTicketPackage(input);
    }),

    create: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          capacity: z.number(),
          benefits: z.array(z.string()).optional(),
          installmentOptions: z
            .array(
              z.object({
                numberOfPayments: z.number(),
                paymentAmount: z.number(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createTicketPackage({
          eventId: input.eventId,
          name: input.name,
          description: input.description,
          price: input.price as any,
          capacity: input.capacity,
          benefits: input.benefits || [],
          installmentOptions: input.installmentOptions || [],
        });
        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          packageId: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          capacity: z.number().optional(),
          benefits: z.array(z.string()).optional(),
          installmentOptions: z
            .array(
              z.object({
                numberOfPayments: z.number(),
                paymentAmount: z.number(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { packageId, ...data } = input;
        await updateTicketPackage(packageId, data as any);
        return await getTicketPackage(packageId);
      }),

    delete: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await deleteTicketPackage(input);
        return { success: true };
      }),
  }),

  // Sponsors
  sponsors: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await getSponsorsByEventId(input);
    }),

    create: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          name: z.string(),
          logoUrl: z.string().optional(),
          logoKey: z.string().optional(),
          website: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createSponsor(input);
        return result;
      }),

    update: adminProcedure
      .input(
        z.object({
          sponsorId: z.number(),
          name: z.string().optional(),
          logoUrl: z.string().optional(),
          logoKey: z.string().optional(),
          website: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { sponsorId, ...data } = input;
        await updateSponsor(sponsorId, data);
        return data;
      }),

    delete: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await deleteSponsor(input);
        return { success: true };
      }),
  }),

  // Gallery
  gallery: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      return await getGalleryImagesByEventId(input);
    }),

    create: adminProcedure
      .input(
        z.object({
          eventId: z.number(),
          imageUrl: z.string(),
          imageKey: z.string(),
          caption: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createGalleryImage(input);
        return result;
      }),

    delete: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await deleteGalleryImage(input);
        return { success: true };
      }),
  }),

  // Bookings
  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          eventId: z.number(),
          packageId: z.number(),
          attendeeName: z.string(),
          attendeeEmail: z.string().email(),
          attendeePhone: z.string().optional(),
          quantity: z.number().default(1),
          totalPrice: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const bookingCode = generateBookingCode();
        const result = await createBooking({
          eventId: input.eventId,
          packageId: input.packageId,
          bookingCode,
          attendeeName: input.attendeeName,
          attendeeEmail: input.attendeeEmail,
          attendeePhone: input.attendeePhone,
          quantity: input.quantity,
          totalPrice: input.totalPrice as any,
          paymentStatus: "pending",
        });

        // Get package and event details for notification
        const pkg = await getTicketPackage(input.packageId);
        const event = await getEvent(input.eventId);

        // Send booking notification
        await sendBookingNotification({
          bookingCode,
          attendeeName: input.attendeeName,
          attendeeEmail: input.attendeeEmail,
          packageName: pkg?.name || "Unknown Package",
          quantity: input.quantity,
          totalPrice: parseFloat(input.totalPrice as string),
          eventName: event?.name || "Event",
        });

        return { bookingCode, ...result };
      }),

    getByCode: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await getBookingByCode(input);
      }),

    list: adminProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getBookingsByEventId(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          bookingId: z.number(),
          paymentStatus: z.enum(["pending", "partial", "completed"]).optional(),
          ticketUrl: z.string().optional(),
          ticketKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { bookingId, ...data } = input;
        await updateBooking(bookingId, data);
        return data;
      }),
  }),

  // Payments
  payments: router({
    create: publicProcedure
      .input(
        z.object({
          bookingId: z.number(),
          amount: z.string(),
          paymentMethod: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createPayment({
          bookingId: input.bookingId,
          amount: input.amount as any,
          status: "pending",
          paymentMethod: input.paymentMethod,
        });
        return result;
      }),

    list: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getPaymentsByBookingId(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
