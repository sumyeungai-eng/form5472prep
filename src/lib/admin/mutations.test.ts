import type { FilingStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { isLegalTransition } from "./mutations";

const ALL_STATUSES: FilingStatus[] = [
  "DRAFT",
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
];

const LEGAL_DESTINATIONS: Record<FilingStatus, FilingStatus[]> = {
  DRAFT: ["DRAFT", "PAID", "FAILED"],
  PAID: ["PAID", "PDF_GENERATED", "FAILED"],
  PDF_GENERATED: ["PDF_GENERATED", "SIGNATURE_PENDING", "PAID", "FAILED"],
  SIGNATURE_PENDING: [
    "SIGNATURE_PENDING",
    "SIGNED_UPLOADED",
    "PDF_GENERATED",
    "FAILED",
  ],
  SIGNED_UPLOADED: ["SIGNED_UPLOADED", "FAXED", "SIGNATURE_PENDING", "FAILED"],
  FAXED: ["FAXED", "CONFIRMED", "FAILED"],
  CONFIRMED: ["CONFIRMED", "FAILED"],
  FAILED: [
    "FAILED",
    "PAID",
    "PDF_GENERATED",
    "SIGNATURE_PENDING",
    "SIGNED_UPLOADED",
    "FAXED",
    "CONFIRMED",
  ],
};

describe("isLegalTransition", () => {
  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      const expected = LEGAL_DESTINATIONS[from].includes(to);

      it(`${from} -> ${to} is ${expected ? "legal" : "illegal"}`, () => {
        expect(isLegalTransition(from, to)).toBe(expected);
      });
    }
  }
});
