import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { form5472FieldMap } from "./fieldMaps";
import { generatePackage } from "./generatePackage";
import { filingToPackageInput } from "./packageInput";
import { runPreflight } from "./preflight";
import { F1, finalisedAt } from "./__fixtures__/filings";
import { encryptPii } from "@/lib/crypto/pii";

// SSN capture spec S7: Form 5472 lines 4b(1)/8b(1) print the decrypted SSN
// when one is on file, else the ITIN field exactly as before. Decryption
// happens only in filingToPackageInput; an undecryptable value never crashes
// generation and fails pre-flight A36. Synthetic SSN/ITIN only.

const PDF_TIMEOUT = 30_000;
const SSN = "123456789";
const ITIN = "912-70-1234";

function usIds(pkg: Awaited<ReturnType<typeof generatePackage>>) {
  return pkg.record.taxYears.map((year) => {
    const value = (field: string) => {
      const write = year.form5472.fields.find((w) => w.field === field && typeof w.value === "string");
      return typeof write?.value === "string" ? write.value : "";
    };
    return {
      line4b1: value(form5472FieldMap["4b1_usId"]),
      line8b1: value(form5472FieldMap["8b1_usId"]),
      line4b2: value(form5472FieldMap["4b2_referenceId"]),
    };
  });
}

let savedKey: string | undefined;
beforeEach(() => {
  savedKey = process.env.PII_ENCRYPTION_KEY;
  process.env.PII_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
});
afterEach(() => {
  if (savedKey === undefined) delete process.env.PII_ENCRYPTION_KEY;
  else process.env.PII_ENCRYPTION_KEY = savedKey;
});

describe("owner SSN on Form 5472 lines 4b(1)/8b(1)", () => {
  it("prints the decrypted SSN (123-45-6789) instead of the ITIN when one is on file", async () => {
    const input = filingToPackageInput({ ...F1, ownerItin: ITIN, ownerSsnCiphertext: encryptPii(SSN) });
    expect(input.ownerSsn).toBe(SSN);
    expect(input.ownerSsnUndecryptable).toBe(false);
    const pkg = await generatePackage(input, finalisedAt);
    for (const ids of usIds(pkg)) {
      expect(ids.line4b1).toBe("123-45-6789");
      expect(ids.line8b1).toBe("123-45-6789");
    }
    expect(pkg.record.ownerUsIdSource).toBe("ssn");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures.map((f) => f.id)).not.toContain("A36");
    // No finding ever quotes the number.
    expect(JSON.stringify(preflight)).not.toContain("123-45-6789");
  }, PDF_TIMEOUT);

  it("prints the ITIN exactly as before when no SSN is on file (reference ID unchanged)", async () => {
    const withItin = await generatePackage(filingToPackageInput({ ...F1, ownerItin: ITIN }), finalisedAt);
    const withSsn = await generatePackage(
      filingToPackageInput({ ...F1, ownerItin: ITIN, ownerSsnCiphertext: encryptPii(SSN) }),
      finalisedAt,
    );
    for (const ids of usIds(withItin)) {
      expect(ids.line4b1).toBe(ITIN);
      expect(ids.line8b1).toBe(ITIN);
    }
    expect(withItin.record.ownerUsIdSource).toBe("itin");
    // Same reference-ID behaviour whichever U.S. ID prints.
    expect(usIds(withSsn).map((ids) => ids.line4b2)).toEqual(usIds(withItin).map((ids) => ids.line4b2));
  }, PDF_TIMEOUT);

  it("never crashes on an undecryptable SSN: falls back to the ITIN and fails pre-flight A36", async () => {
    const stored = encryptPii(SSN);
    process.env.PII_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64"); // key changed
    const input = filingToPackageInput({ ...F1, ownerItin: ITIN, ownerSsnCiphertext: stored });
    expect(input.ownerSsn).toBeNull();
    expect(input.ownerSsnUndecryptable).toBe(true);
    const pkg = await generatePackage(input, finalisedAt);
    for (const ids of usIds(pkg)) expect(ids.line4b1).toBe(ITIN);
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    const a36 = preflight.failures.find((f) => f.id === "A36");
    expect(a36?.message).toContain("SSN on file could not be decrypted — check PII_ENCRYPTION_KEY");
  }, PDF_TIMEOUT);

  it("treats a missing key like an undecryptable value (A36), not a crash", () => {
    const stored = encryptPii(SSN);
    delete process.env.PII_ENCRYPTION_KEY;
    const input = filingToPackageInput({ ...F1, ownerSsnCiphertext: stored });
    expect(input.ownerSsnUndecryptable).toBe(true);
    expect(input.ownerSsn).toBeNull();
  });
});
