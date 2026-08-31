import { z } from "zod";
import {
  WIZARD_STATE_VERSION,
  type WizardFamilyState,
  type WizardState,
} from "./wizardState";
import type { YearOfAssessment } from "../tax/types";

const MIN_BIRTH_YEAR = 1900;

export const yearOfAssessmentSchema = z.enum(["2024_25", "2025_26"]);
export const personIdSchema = z.enum(["A", "B"]);
export const maritalStatusSchema = z.enum(["single", "married"]);

export const hkdAmountSchema = z
  .number({ invalid_type_error: "validation.amount.number" })
  .int("validation.amount.integer")
  .nonnegative("validation.amount.nonnegative");

export const nonnegativeIntegerSchema = z
  .number({ invalid_type_error: "validation.count.number" })
  .int("validation.count.integer")
  .nonnegative("validation.count.nonnegative");

const optionalHkdAmountSchema = hkdAmountSchema.optional();
const optionalNonnegativeIntegerSchema = nonnegativeIntegerSchema.optional();

export function yearOfAssessmentEndYear(year: YearOfAssessment): number {
  return year === "2024_25" ? 2025 : 2026;
}

function birthYearSchema(maxYear: number) {
  return z
    .number({ invalid_type_error: "validation.birthYear.number" })
    .int("validation.birthYear.integer")
    .min(MIN_BIRTH_YEAR, "validation.birthYear.tooEarly")
    .max(maxYear, "validation.birthYear.future");
}

export function createBirthYearSchema(year: YearOfAssessment) {
  return birthYearSchema(yearOfAssessmentEndYear(year));
}

export const bilingualLabelSchema = z.object({
  labelZh: z.string().min(1, "validation.label.required"),
  labelEn: z.string().min(1, "validation.label.required"),
});

export const moneyItemSchema = bilingualLabelSchema.extend({
  key: z.string().min(1, "validation.key.required"),
  amount: hkdAmountSchema,
});

export const incomeItemSchema = moneyItemSchema.extend({
  relateBack: z
    .object({
      elected: z.boolean(),
      months: nonnegativeIntegerSchema.max(36, "validation.relateBack.maxMonths"),
      currentYearMonths: nonnegativeIntegerSchema,
    })
    .superRefine((value, ctx) => {
      if (value.elected && value.months < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["months"],
          message: "validation.relateBack.minMonths",
        });
      }
      if (value.currentYearMonths > value.months) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentYearMonths"],
          message: "validation.relateBack.currentYearMonths",
        });
      }
    })
    .optional(),
});

export const employerAccommodationSchema = bilingualLabelSchema.extend({
  key: z.string().min(1, "validation.key.required"),
  type: z.enum(["residence", "twoRoomHotel", "oneRoomHotel"]),
  employerAssessableIncomeBeforeAccommodation: hkdAmountSchema,
  employerOutgoingsAndExpenses: optionalHkdAmountSchema,
  rateableValueElection: optionalHkdAmountSchema,
});

export const propertySchema = z.object({
  id: z.string().min(1, "validation.property.id.required"),
  rentReceived: hkdAmountSchema,
  leasePremium: optionalHkdAmountSchema,
  leaseTermMonths: optionalNonnegativeIntegerSchema,
  premiumMonthsInYear: optionalNonnegativeIntegerSchema,
  irrecoverableRent: optionalHkdAmountSchema,
  irrecoverableRentRecovered: optionalHkdAmountSchema,
  ratesPaidByOwner: optionalHkdAmountSchema,
  ownershipShare: z.number().min(0, "validation.ownershipShare.range").max(1, "validation.ownershipShare.range").optional(),
  letPropertyMortgageInterestForPA: optionalHkdAmountSchema,
});

export const capitalAllowancePoolSchema = z.object({
  rate: z.union([z.literal(0.1), z.literal(0.2), z.literal(0.3)]),
  broughtForward: hkdAmountSchema,
  additions: hkdAmountSchema,
});

export const businessSchema = z.object({
  id: z.string().min(1, "validation.business.id.required"),
  name: z.string().optional(),
  revenue: hkdAmountSchema,
  deductibleExpenses: hkdAmountSchema,
  addBacks: z
    .object({
      privatePortion: optionalHkdAmountSchema,
      capitalExpenditure: optionalHkdAmountSchema,
      proprietorSalaries: optionalHkdAmountSchema,
      nonDeductibleDonations: optionalHkdAmountSchema,
    })
    .optional(),
  capitalAllowances: z
    .object({
      pmInitialAdditions: optionalHkdAmountSchema,
      pools: z.array(capitalAllowancePoolSchema).optional(),
      buildingAllowance: optionalHkdAmountSchema,
    })
    .optional(),
  lossBroughtForward: optionalHkdAmountSchema,
});

export const housingDeductionSchema = z.object({
  kind: z.enum(["none", "homeLoanInterest", "domesticRent"]),
  amount: hkdAmountSchema,
  eligibleForElevatedCap: z.boolean().nullable().optional(),
});

export const deductionsSchema = z.object({
  selfEducation: optionalHkdAmountSchema,
  charitableDonations: optionalHkdAmountSchema,
  elderlyCare: optionalHkdAmountSchema,
  housing: housingDeductionSchema,
  mpfMandatory: optionalHkdAmountSchema,
  annuityAndTvc: optionalHkdAmountSchema,
  vhisPremiums: optionalHkdAmountSchema,
  vhisInsuredPersons: optionalNonnegativeIntegerSchema,
  assistedReproduction: optionalHkdAmountSchema,
});

export const paEligibilitySchema = z.object({
  ageDuringYear: optionalNonnegativeIntegerSchema,
  bothParentsDeceased: z.boolean().optional(),
  isHongKongPermanentResident: z.boolean().optional(),
  ordinarilyResidentInHongKong: z.boolean().optional(),
  presentInHongKongMoreThan180Days: z.boolean().optional(),
  presentInHongKongMoreThan300DaysAcrossTwoYears: z.boolean().optional(),
});

export const incomeSourcesSchema = z.object({
  hasSalary: z.boolean(),
  hasProperty: z.boolean(),
  hasBusiness: z.boolean(),
});

export const salaryDetailSchema = z.object({
  incomeItems: z.array(incomeItemSchema),
  outgoingsAndExpenses: z.array(moneyItemSchema),
  depreciationAllowances: z.array(moneyItemSchema),
  employerAccommodation: z.array(employerAccommodationSchema),
});

export const personBaseSchema = z.object({
  personId: personIdSchema,
  paEligibility: paEligibilitySchema,
  incomeSources: incomeSourcesSchema,
  salary: salaryDetailSchema,
  properties: z.array(propertySchema),
  businesses: z.array(businessSchema),
  electedTwoTierBusinessId: z.string().nullable(),
  paLossBroughtForward: optionalHkdAmountSchema,
  deductions: deductionsSchema,
});

type PersonSchemaValue = z.infer<typeof personBaseSchema>;

function validateTwoTierSelection(person: Pick<PersonSchemaValue, "businesses" | "electedTwoTierBusinessId">, ctx: z.RefinementCtx): void {
  if (
    person.electedTwoTierBusinessId !== null
    && !person.businesses.some((business) => business.id === person.electedTwoTierBusinessId)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["electedTwoTierBusinessId"],
      message: "validation.business.twoTierSelectionMissing",
    });
  }
}

export const personSchema = personBaseSchema.superRefine(validateTwoTierSelection);

export function createFamilyStepSchema(year: YearOfAssessment) {
  const childSchema = z.object({
    key: z.string().optional(),
    birthYear: createBirthYearSchema(year),
    bornDuringYearOfAssessment: z.boolean().optional(),
  });

  const parentSchema = z
    .object({
      key: z.string().optional(),
      birthYear: createBirthYearSchema(year).optional(),
      ageDuringYear: optionalNonnegativeIntegerSchema,
      residedWithTaxpayer: z.boolean().optional(),
      inCareHome: z.boolean().optional(),
      careHomeExpenses: optionalHkdAmountSchema,
    })
    .superRefine((parent, ctx) => {
      if (parent.birthYear === undefined && parent.ageDuringYear === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthYear"],
          message: "validation.parent.ageOrBirthYearRequired",
        });
      }
    });

  return z.object({
    children: z.array(childSchema),
    parents: z.array(parentSchema),
    siblingCount: nonnegativeIntegerSchema,
    singleParent: z.boolean(),
    disabledDependantCount: nonnegativeIntegerSchema,
    personalDisability: z.object({
      A: z.boolean(),
      B: z.boolean(),
    }),
  });
}

export const familyStepSchema = createFamilyStepSchema("2025_26");

export const basicsStepSchema = z.object({
  year: yearOfAssessmentSchema,
  maritalStatus: maritalStatusSchema,
  personA: z.object({
    personId: z.literal("A"),
    paEligibility: paEligibilitySchema,
  }),
  personB: z.object({
    personId: z.literal("B"),
    paEligibility: paEligibilitySchema,
  }),
  claimingSpouseForFamilyAllowances: personIdSchema,
  claimMarriedAllowanceBy: z.union([personIdSchema, z.literal("none")]),
});

export const incomeSourcesStepSchema = z.object({
  personA: z.object({
    personId: z.literal("A"),
    incomeSources: incomeSourcesSchema,
  }),
  personB: z.object({
    personId: z.literal("B"),
    incomeSources: incomeSourcesSchema,
  }),
});

export const sourceDetailsStepSchema = z.object({
  personA: personBaseSchema.pick({
    personId: true,
    salary: true,
    properties: true,
    businesses: true,
    electedTwoTierBusinessId: true,
    paLossBroughtForward: true,
  }).superRefine(validateTwoTierSelection),
  personB: personBaseSchema.pick({
    personId: true,
    salary: true,
    properties: true,
    businesses: true,
    electedTwoTierBusinessId: true,
    paLossBroughtForward: true,
  }).superRefine(validateTwoTierSelection),
});

export const deductionsStepSchema = z.object({
  personA: z.object({
    personId: z.literal("A"),
    deductions: deductionsSchema,
  }),
  personB: z.object({
    personId: z.literal("B"),
    deductions: deductionsSchema,
  }),
});

export const wizardStateSchema: z.ZodType<WizardState> = z
  .object({
    version: z.literal(WIZARD_STATE_VERSION),
    year: yearOfAssessmentSchema,
    maritalStatus: maritalStatusSchema,
    personA: personSchema,
    personB: personSchema,
    claimingSpouseForFamilyAllowances: personIdSchema,
    claimMarriedAllowanceBy: z.union([personIdSchema, z.literal("none")]),
    family: z.custom<WizardFamilyState>(() => true),
  })
  .superRefine((state, ctx) => {
    if (state.personA.personId !== "A") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["personA", "personId"],
        message: "validation.personA.expected",
      });
    }
    if (state.personB.personId !== "B") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["personB", "personId"],
        message: "validation.personB.expected",
      });
    }
    const result = createFamilyStepSchema(state.year).safeParse(state.family);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          ...issue,
          path: ["family", ...issue.path],
        });
      }
    }
    if (state.maritalStatus === "single") {
      if (state.claimingSpouseForFamilyAllowances !== "A") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["claimingSpouseForFamilyAllowances"],
          message: "validation.family.singleClaimsA",
        });
      }
      if (state.claimMarriedAllowanceBy !== "none") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["claimMarriedAllowanceBy"],
          message: "validation.marriedAllowance.singleCannotClaim",
        });
      }
    }
  });

export type YearOfAssessmentFormValues = z.infer<typeof yearOfAssessmentSchema>;
export type BasicsStepFormValues = z.infer<typeof basicsStepSchema>;
export type IncomeSourcesStepFormValues = z.infer<typeof incomeSourcesStepSchema>;
export type SourceDetailsStepFormValues = z.infer<typeof sourceDetailsStepSchema>;
export type FamilyStepFormValues = z.infer<typeof familyStepSchema>;
export type DeductionsStepFormValues = z.infer<typeof deductionsStepSchema>;
export type WizardStateFormValues = z.infer<typeof wizardStateSchema>;
