import { z } from "zod";

export const LimitBehaviorSchema = z.enum(["stop", "wrap"]);

export const CounterHistoryEntrySchema = z.object({
  t: z.number().int().positive(),
  delta: z.number(),
  value: z.number(),
});

export const CounterSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1, "Name is required").max(40, "Name must be 40 characters or fewer"),
    value: z.number(),
    initialValue: z.number(),
    step: z.number().positive("Step must be positive"),
    min: z.number().nullable(),
    max: z.number().nullable(),
    limitBehavior: LimitBehaviorSchema,
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
    icon: z.string().optional(),
    pinned: z.boolean().default(false),
    order: z.number().int(),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
    history: z.array(CounterHistoryEntrySchema).max(100),
  })
  .refine(
    (data) => {
      if (data.min !== null && data.max !== null) {
        return data.min < data.max;
      }
      return true;
    },
    {
      message: "Minimum limit must be strictly less than maximum limit",
      path: ["max"],
    }
  );

export const AppSettingsSchema = z.object({
  theme: z.enum(["system", "dark", "light"]),
  sound: z.boolean(),
  haptics: z.boolean(),
  defaultStep: z.number().positive(),
  defaultLimitBehavior: LimitBehaviorSchema,
  schemaVersion: z.number().int().positive(),
});

export const ExportDataSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.number().int().positive(),
  counters: z.array(CounterSchema),
  settings: AppSettingsSchema,
});

export type ExportData = z.infer<typeof ExportDataSchema>;
