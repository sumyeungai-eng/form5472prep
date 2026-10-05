// Pure text helpers for the filing-package generator. No pdf-lib, no clock:
// everything here is a string-in / string-out rule with its own unit tests
// (textFormat.test.ts).

// ─────────────────────────────────────────────────────────────────────────────
// Display casing for city and state/province tokens.
//
// Customers type addresses into free-text inputs, and a city typed entirely in
// lower case ("kowloon") or entirely in capitals ("NEW YORK") prints that way
// on every IRS form. For PRINTING we title-case a value only when it carries
// no casing signal at all (all lower or all upper). Mixed-case input is the
// customer's deliberate spelling ("McAllen", "deLeon", "Hong Kong SAR") and is
// returned untouched.
//
// Short all-letter values in a state/province slot are abbreviations ("WY",
// "nsw", "on"), so they print in capitals instead. A small set of well-known
// acronyms stays upper case inside longer names ("HONG KONG SAR" ->
// "Hong Kong SAR"), and a few joining particles stay lower case when they are
// not the first word ("RIO DE JANEIRO" -> "Rio de Janeiro").
// ─────────────────────────────────────────────────────────────────────────────

export type AddressPartKind = "city" | "region";

const KEEP_UPPER = new Set(["SAR", "PRC", "UAE", "USA", "UK", "US", "DC", "NCR", "BC"]);
const LOWER_PARTICLES = new Set([
  "and", "da", "das", "de", "del", "della", "der", "des", "di", "do", "dos", "du",
  "en", "la", "le", "les", "of", "on", "sur", "the", "upon", "van", "von", "y",
]);

// The letters of `value` that have case (Latin, Greek, Cyrillic, ...). Scripts
// without case, digits and punctuation are dropped.
function letters(value: string): string {
  return Array.from(value)
    .filter((ch) => ch.toLocaleUpperCase("en-US") !== ch.toLocaleLowerCase("en-US"))
    .join("");
}

// Lower-case the word and upper-case its first LETTER (skipping a leading
// bracket or quote, so "(kowloon)" becomes "(Kowloon)").
function capitaliseFirstLetter(word: string): string {
  const lower = word.toLocaleLowerCase("en-US");
  const chars = Array.from(lower);
  const firstLetter = chars.findIndex((ch) => ch.toLocaleUpperCase("en-US") !== ch);
  if (firstLetter === -1) return lower;
  chars[firstLetter] = chars[firstLetter].toLocaleUpperCase("en-US");
  return chars.join("");
}

function titleCaseWord(word: string, isFirst: boolean): string {
  // Hyphenated names ("stratford-upon-avon", "ILE-DE-FRANCE") are title-cased
  // part by part; particles inside them stay lower case.
  return word
    .split("-")
    .map((part, index) => {
      // Look the bare word up, so "SAR," or "(SAR)" still match.
      const core = letters(part);
      if (KEEP_UPPER.has(core.toLocaleUpperCase("en-US"))) return part.toLocaleUpperCase("en-US");
      if (!(isFirst && index === 0) && LOWER_PARTICLES.has(core.toLocaleLowerCase("en-US"))) {
        return part.toLocaleLowerCase("en-US");
      }
      // A one-letter elided particle that is NOT the first word stays lower
      // case: "coeur d'alene" -> "Coeur d'Alene", "val-d'oise" -> "Val-d'Oise".
      if (!(isFirst && index === 0) && /^[dl]['\u2019]/i.test(part)) {
        const rest = capitaliseFirstLetter(part.slice(2));
        return part.slice(0, 2).toLocaleLowerCase("en-US") + rest;
      }
      return capitaliseApostropheName(capitaliseFirstLetter(part));
    })
    .join("-");
}

// "o'fallon" -> "O'Fallon", "l'aquila" -> "L'Aquila": a ONE-letter prefix
// before an apostrophe (O', D', L') is an elided particle, so the next letter
// is capitalised too. Longer prefixes are a single word ("xi'an" -> "Xi'an").
function capitaliseApostropheName(word: string): string {
  const chars = Array.from(word);
  const isLetter = (ch: string | undefined) =>
    !!ch && ch.toLocaleUpperCase("en-US") !== ch.toLocaleLowerCase("en-US");
  const first = chars.findIndex((ch) => isLetter(ch));
  if (first === -1) return word;
  const apostrophe = chars[first + 1];
  if ((apostrophe === "'" || apostrophe === "\u2019") && isLetter(chars[first + 2])) {
    chars[first + 2] = chars[first + 2].toLocaleUpperCase("en-US");
  }
  return chars.join("");
}

/**
 * Normalise the display casing of a city or state/province value for printing.
 * Only an all-lower-case or all-upper-case value is changed; anything with
 * mixed case is returned exactly as typed (trimmed).
 */
export function displayCaseAddressPart(
  value: string | null | undefined,
  kind: AddressPartKind = "city",
): string {
  const trimmed = (value ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const onlyLetters = letters(trimmed);
  // Nothing with case to normalise (digits only, or a caseless script such as Chinese).
  if (!onlyLetters) return trimmed;
  const isAllLower = onlyLetters === onlyLetters.toLocaleLowerCase("en-US");
  const isAllUpper = onlyLetters === onlyLetters.toLocaleUpperCase("en-US");
  if (!isAllLower && !isAllUpper) return trimmed;
  // A one-to-three-letter state/province value is an abbreviation.
  if (kind === "region" && onlyLetters.length <= 3 && !trimmed.includes(" ")) {
    return trimmed.toLocaleUpperCase("en-US");
  }
  // A one-to-three-letter all-caps city value is most likely an abbreviation too.
  if (kind === "city" && isAllUpper && onlyLetters.length <= 3 && !trimmed.includes(" ")) {
    return trimmed;
  }
  return trimmed
    .split(" ")
    .map((word, index) => titleCaseWord(word, index === 0))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Owner nationality / residence clause for the reasonable-cause statement.
//
// The statement is signed under penalties of perjury, so it may only say what
// the intake answers support:
//  - Hong Kong and Macau are Special Administrative Regions, not countries with
//    their own citizenship. An owner whose country of citizenship is recorded
//    as Hong Kong (or Macau) holds that region's permanent residency (that is
//    what the HKSAR / MSAR passport the wizard's citizenship answer stands for),
//    so the clause reads "a Hong Kong permanent resident". We never infer
//    PERMANENT residency from tax residence alone (a work-visa holder is tax
//    resident in Hong Kong without being a permanent resident), so an owner who
//    is a citizen of another country and lives in Hong Kong is "a citizen of X
//    and a resident of Hong Kong".
//  - Same country for both answers: "a citizen and resident of X".
//  - Different countries: "a citizen of X and a resident of Y".
//  - A missing answer is left out rather than guessed.
// Inputs are expected to be already normalised country names
// (normalizeCountry in generatePackage.ts maps demonyms like "Canadian").
// ─────────────────────────────────────────────────────────────────────────────

const SAR_REGIONS: Record<string, string> = {
  "hong kong": "Hong Kong",
  "hong kong sar": "Hong Kong",
  "hksar": "Hong Kong",
  "hong kong, china": "Hong Kong",
  "macau": "Macau",
  "macao": "Macau",
  "macau sar": "Macau",
  "macao sar": "Macau",
  "macau, china": "Macau",
};

function sarRegion(value: string): string | null {
  return SAR_REGIONS[value.trim().toLowerCase()] ?? null;
}

function sameJurisdiction(a: string, b: string): boolean {
  const sarA = sarRegion(a);
  const sarB = sarRegion(b);
  if (sarA || sarB) return sarA === sarB;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Country names that take "the" in running prose ("a resident of the United
// Kingdom", "a citizen of the Philippines").
const THE_COUNTRIES = new Set([
  "bahamas", "central african republic", "comoros", "czech republic", "democratic republic of the congo",
  "dominican republic", "gambia", "maldives", "marshall islands", "netherlands", "philippines",
  "solomon islands", "united arab emirates", "united kingdom", "united states", "vatican city",
]);

/** A country name as it reads mid-sentence: "the United Kingdom", "Canada". */
export function countryForProse(country: string): string {
  const trimmed = country.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed || lower.startsWith("the ")) return trimmed;
  if (THE_COUNTRIES.has(lower) || /^(united|republic of)\b/.test(lower) || /\bislands$/.test(lower)) {
    return `the ${trimmed}`;
  }
  return trimmed;
}

/**
 * The predicate describing the owner's citizenship and residence, e.g.
 * "is a Hong Kong permanent resident" or "is a citizen of Canada and a
 * resident of Singapore". Returns null when neither answer is on file.
 */
export function ownerNationalityClause(
  citizenship: string | null | undefined,
  residence: string | null | undefined,
): string | null {
  const cit = (citizenship ?? "").trim();
  const res = (residence ?? "").trim();
  const citSar = cit ? sarRegion(cit) : null;
  const resSar = res ? sarRegion(res) : null;

  const resProse = resSar ?? countryForProse(res);
  const citProse = countryForProse(cit);

  if (!cit && !res) return null;
  if (!cit) return `is a resident of ${resProse}`;
  if (citSar) {
    if (!res || sameJurisdiction(cit, res)) return `is a ${citSar} permanent resident`;
    return `is a ${citSar} permanent resident and a resident of ${resProse}`;
  }
  if (!res) return `is a citizen of ${citProse}`;
  if (sameJurisdiction(cit, res)) return `is a citizen and resident of ${citProse}`;
  return `is a citizen of ${citProse} and a resident of ${resProse}`;
}
