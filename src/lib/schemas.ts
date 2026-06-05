import { z } from "zod";

// EIN must be 9 digits, optionally formatted XX-XXXXXXX
export const einSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-?\d{7}$/, "EIN must be 9 digits (XX-XXXXXXX)")
  .transform((s) => (s.includes("-") ? s : `${s.slice(0, 2)}-${s.slice(2)}`));

export const entitySchema = z.object({
  llcName: z.string().trim().min(2, "Required"),
  llcEin: einSchema,
  llcAddress: z.string().trim().min(3, "Required"),
  llcCity: z.string().trim().min(1, "Required"),
  llcState: z.string().trim().length(2, "2-letter state code"),
  llcZip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP"),
  llcDateIncorporated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  llcBusinessActivity: z.string().trim().min(2, "Required"),
  llcBusinessCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6-digit NAICS code"),
});

// Raw object schema — used as the base for derived form schemas (e.g. the
// wizard's OwnerStep splits ownerName into first/middle/last). Kept separate
// from the refined `ownerSchema` because `.omit()` / `.extend()` can't be
// called on a ZodEffects (the result of `.superRefine()`).
export const ownerBaseSchema = z.object({
  ownerName: z.string().trim().min(2, "Required"),
  ownerAddress: z.string().trim().min(3, "Required"),
  ownerCountryCitizenship: z.string().trim().min(2, "Required"),
  ownerCountryTaxResidence: z.string().trim().min(2, "Required"),
  ownerCountryBusiness: z.string().trim().min(2, "Required"),
  ownerFtin: z.string().trim().min(2, "Required"),
  ownerItin: z.string().trim().optional().or(z.literal("")),
  // IRS Instructions for Form 5472: the reference ID must be alphanumeric with
  // no special characters or spaces, 50 chars or less. Reject hyphens etc. so
  // a manually-entered ID like "SMITH-J-A7B2" can't reach the PDF.
  ownerReferenceId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{1,50}$/, "Letters and numbers only, no spaces or symbols (max 50)")
    .optional()
    .or(z.literal("")),
});

// Per IRS Form 5472 line 4b: must have either US ITIN OR a reference ID.
// Exported as a plain refiner callback so derived schemas in the wizard can
// reuse the same rule (they can't import a refined schema and then call
// `.omit()` on it — `.omit()` is only defined on ZodObject, not ZodEffects).
export function refineUsIdOrReferenceId(
  val: { ownerItin?: string; ownerReferenceId?: string },
  ctx: z.RefinementCtx,
) {
  const hasItin = !!val.ownerItin && val.ownerItin.length > 0;
  const hasRef = !!val.ownerReferenceId && val.ownerReferenceId.length > 0;
  if (!hasItin && !hasRef) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Required if you don't have a US ITIN",
      path: ["ownerReferenceId"],
    });
  }
}

export const ownerSchema = ownerBaseSchema.superRefine(refineUsIdOrReferenceId);

const currentYear = new Date().getFullYear();

export const yearScopeSchema = z.object({
  taxYears: z
    .array(z.number().int().min(2018).max(currentYear))
    .min(1, "Select at least one year"),
});

export const yearDataSchema = z.object({
  taxYear: z.number().int().min(2018).max(currentYear),
  totalAssetsYearEnd: z.coerce.number().min(0),
  contributions: z.coerce.number().min(0),
  distributions: z.coerce.number().min(0),
});

export const yearDataListSchema = z.object({
  years: z.array(yearDataSchema).min(1),
});

export type EntityForm = z.infer<typeof entitySchema>;
export type OwnerForm = z.infer<typeof ownerSchema>;
export type YearScopeForm = z.infer<typeof yearScopeSchema>;
export type YearDataForm = z.infer<typeof yearDataSchema>;
