// House paid preparer for the Form 1120 "Paid Preparer Use Only" block
// (generator 2.3.0, docs/filing-package-rules.md "Paid preparer block").
//
// The details live in config (env vars), never in code: an order opts in with
// Filing.paidPreparerMode = "house". When any required value is missing the
// generator leaves the block blank and records the config as incomplete, so
// pre-flight can stop the package instead of printing half a preparer.

export type HousePreparer = {
  name: string;
  ptin: string;
  firmName: string;
  firmEin: string;
  firmAddress: string;
  phone: string | null;
};

export const HOUSE_PREPARER_ENV = {
  name: "HOUSE_PREPARER_NAME",
  ptin: "HOUSE_PREPARER_PTIN",
  firmName: "HOUSE_PREPARER_FIRM_NAME",
  firmEin: "HOUSE_PREPARER_FIRM_EIN",
  firmAddress: "HOUSE_PREPARER_FIRM_ADDRESS",
  phone: "HOUSE_PREPARER_PHONE",
} as const;

const REQUIRED = ["name", "ptin", "firmName", "firmEin", "firmAddress"] as const;

export type HousePreparerConfigStatus = {
  // True when every required value is present and well formed.
  complete: boolean;
  // Env var names that are missing or blank (required ones only).
  missing: string[];
  // Env var names whose value is present but malformed. The Form 1120 PTIN
  // field holds at most 11 characters and the firm EIN field at most 10, and
  // pdf-lib refuses longer text, so a malformed value would silently vanish.
  invalid: string[];
};

type Env = Record<string, string | undefined>;

function read(env: Env, key: string): string {
  return (env[key] ?? "").trim();
}

// PTIN: "P" followed by 8 digits. EIN: NN-NNNNNNN.
const FORMAT: Partial<Record<keyof typeof HOUSE_PREPARER_ENV, RegExp>> = {
  ptin: /^P\d{8}$/,
  firmEin: /^\d{2}-\d{7}$/,
};

export function housePreparerConfigStatus(env: Env = process.env): HousePreparerConfigStatus {
  const missing = REQUIRED.filter((field) => !read(env, HOUSE_PREPARER_ENV[field])).map(
    (field) => HOUSE_PREPARER_ENV[field],
  );
  const invalid = (Object.keys(FORMAT) as Array<keyof typeof FORMAT>)
    .filter((field) => {
      const value = read(env, HOUSE_PREPARER_ENV[field]);
      return value !== "" && !FORMAT[field]!.test(value);
    })
    .map((field) => HOUSE_PREPARER_ENV[field]);
  return { complete: missing.length === 0 && invalid.length === 0, missing, invalid };
}

// The configured house preparer, or null when the config is incomplete.
export function housePreparerFromEnv(env: Env = process.env): HousePreparer | null {
  if (!housePreparerConfigStatus(env).complete) return null;
  return {
    name: read(env, HOUSE_PREPARER_ENV.name),
    ptin: read(env, HOUSE_PREPARER_ENV.ptin),
    firmName: read(env, HOUSE_PREPARER_ENV.firmName),
    firmEin: read(env, HOUSE_PREPARER_ENV.firmEin),
    firmAddress: read(env, HOUSE_PREPARER_ENV.firmAddress),
    phone: read(env, HOUSE_PREPARER_ENV.phone) || null,
  };
}
