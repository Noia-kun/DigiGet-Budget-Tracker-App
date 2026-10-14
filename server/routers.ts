import { z } from "zod";
import { getLedgerSnapshot, saveLedgerSnapshot } from "./db";
import { getSessionCookieName, getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const deviceIdSchema = z
  .string()
  .min(8)
  .max(96)
  .regex(/^[a-zA-Z0-9_-]+$/);
const categorySchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(24),
  kind: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1).max(64),
  builtIn: z.boolean().optional(),
});
const snapshotSchema = z.object({
  transactions: z
    .array(
      z.object({
        id: z.string().min(1).max(96),
        kind: z.enum(["income", "expense"]),
        amountCents: z.number().int().positive().max(100_000_000_000),
        categoryId: z.string().min(1).max(80),
        note: z.string().max(100),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        updatedAt: z.string().datetime(),
      }),
    )
    .max(10000),
  categories: z.array(categorySchema).max(200),
  preferences: z.object({
    currency: z.string().length(3),
    reminderEnabled: z.boolean(),
    reminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  onboardingComplete: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(getSessionCookieName(ctx.req), {
        ...cookieOptions,
        maxAge: -1,
      });
      return {
        success: true,
      } as const;
    }),
  }),
  ledger: router({
    getSnapshot: publicProcedure
      .input(z.object({ deviceId: deviceIdSchema }))
      .query(({ input }) => getLedgerSnapshot(input.deviceId)),
    saveSnapshot: publicProcedure
      .input(
        z.object({
          deviceId: deviceIdSchema,
          snapshot: z.string().max(2_000_000),
        }),
      )
      .mutation(async ({ input }) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(input.snapshot);
        } catch {
          throw new Error("Invalid ledger snapshot");
        }
        const validated = snapshotSchema.safeParse(parsed);
        if (!validated.success)
          throw new Error("Ledger snapshot did not pass validation");
        await saveLedgerSnapshot(
          input.deviceId,
          JSON.stringify(validated.data),
        );
        return { ok: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
