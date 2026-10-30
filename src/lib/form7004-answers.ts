// Form 7004 answer capsules (plan 2026-10-30 P0-6). The same words are the
// question H2s on /form-7004-extension, that page's FAQPage JSON-LD and the
// llms.txt quick answers. Facts are from the IRS pages cited on each answer;
// the price comes from pricing.ts. Each answer stays at or under 60 words
// (form7004-answers.test.ts).
import { EXTENSION_PRICE_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

export type IrsSource = { label: string; url: string };

const I7004: IrsSource = { label: "Instructions for Form 7004 (IRS)", url: "https://www.irs.gov/instructions/i7004" };
const I5472: IrsSource = { label: "Instructions for Form 5472 (IRS)", url: "https://www.irs.gov/instructions/i5472" };
const I1120: IrsSource = { label: "Instructions for Form 1120 (IRS)", url: "https://www.irs.gov/instructions/i1120" };

const PRICE = formatPrice(EXTENSION_PRICE_CENTS);

export const FORM_7004_ANSWERS: ReadonlyArray<{ q: string; a: string; sources: IrsSource[] }> = [
  {
    q: "Can someone file Form 7004 for my foreign-owned LLC?",
    a: "Yes. The IRS says no signature is required on Form 7004, so Form5472 Prep can prepare it for your LLC, write “Foreign-owned U.S. DE” across the top as the Form 5472 instructions direct, and fax it to the IRS Ogden PIN Unit. You give us the LLC's name, EIN, address and tax year.",
    sources: [I7004, I5472],
  },
  {
    q: "When is Form 7004 due for a foreign-owned LLC?",
    a: "By the regular due date of the pro forma Form 1120 and Form 5472, generally the 15th day of the 4th month after the tax year ends: 15 April for a calendar-year LLC, or the next business day after a weekend or legal holiday. A Form 7004 filed later extends nothing; a valid one usually gives 6 more months.",
    sources: [I7004, I1120],
  },
  {
    q: "How much does Form5472 Prep charge to file Form 7004?",
    a: `Form5472 Prep charges ${PRICE} per LLC per tax year to prepare Form 7004 and fax it to the IRS Ogden PIN Unit, with the fax confirmation emailed to you. Orders are faxed within 2 business days; a tax year that has not ended yet is faxed in the first business days after 1 January.`,
    sources: [I5472],
  },
  {
    q: "Does Form 7004 extend the time to pay?",
    a: "No. Form 7004 extends the time to file, not the time to pay: the IRS instructions say it “does not extend the time to pay any tax due.” A foreign-owned LLC's pro forma Form 1120 normally reports no tax, but its Form 5472 and pro forma 1120 must still be filed by the extended due date.",
    sources: [I7004],
  },
];
