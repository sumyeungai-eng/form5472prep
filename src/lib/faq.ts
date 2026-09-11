export type FaqCategoryId =
  | "before-you-order"
  | "the-filing"
  | "deadlines-penalties"
  | "ein-itin"
  | "how-our-service-works"
  | "after-we-file";

export type FaqCategory = { id: FaqCategoryId; title: string; eyebrow: string; blurb: string };

export type FaqItem = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
  learnMore?: { href: string; label: string };
  source: string;
  speakable?: boolean;
};

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: "before-you-order",
    title: "Before You Order",
    eyebrow: "Basics",
    blurb: "What it is, whether you need it, what it costs.",
  },
  {
    id: "the-filing",
    title: "The Filing",
    eyebrow: "The forms",
    blurb: "What the forms are and how they are submitted.",
  },
  {
    id: "deadlines-penalties",
    title: "Deadlines & Penalties",
    eyebrow: "Dates & penalties",
    blurb: "When it is due and what a miss costs.",
  },
  {
    id: "ein-itin",
    title: "EIN & ITIN",
    eyebrow: "Tax IDs",
    blurb: "The numbers your LLC and its owner need.",
  },
  {
    id: "how-our-service-works",
    title: "How Our Service Works",
    eyebrow: "Our process",
    blurb: "From questionnaire to fax.",
  },
  {
    id: "after-we-file",
    title: "After We File",
    eyebrow: "Afterwards",
    blurb: "Proof, records, and next year.",
  },
] as const;

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "what-is-form-5472-who-files",
    category: "before-you-order",
    question: "What is Form 5472, and who has to file it?",
    answer:
      "Form 5472 is the information return that reports related-party transactions. A foreign-owned US single-member LLC treated as a disregarded entity usually files Form 5472 with a pro forma Form 1120 when it has a reportable transaction during the tax year.",
    learnMore: { href: "/do-i-need-to-file-form-5472", label: "Check whether you need to file" },
    source:
      "src/lib/landing-pages.ts:1586 (slug: irs-form-5472); src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx:33",
    speakable: true,
  },
  {
    id: "no-income-form-5472-form-1120",
    category: "before-you-order",
    question: "Do I really need Form 5472 and a Form 1120 if my LLC made no money?",
    answer:
      "Form 5472 and the pro forma Form 1120 are likely still needed even when your LLC made no money. No income is different from no reportable transactions, and formation costs, owner contributions, reimbursements, loans, or owner draws can create a filing requirement.",
    source: "src/app/(marketing)/page.tsx:56; src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx:37",
    speakable: true,
  },
  {
    id: "can-you-tell-me-whether-i-need-to-file",
    category: "before-you-order",
    question: "Can you tell me whether I need to file?",
    answer:
      "We can confirm whether your described situation fits our filing profile. If your US LLC is a single-member LLC owned by a non-US person and it had any reportable transaction during the year, including money moved in to open its bank account, it must file Form 5472 with a pro forma Form 1120.",
    learnMore: { href: "/do-i-need-to-file-form-5472", label: "Use the filing checker" },
    source: "src/app/(marketing)/contact/page.tsx:30",
  },
  {
    id: "how-much-does-it-cost",
    category: "before-you-order",
    question: "How much does it cost?",
    answer:
      "Form 5472 filing costs $149 for Standard filing, ready in 5-7 business days, or $199 for Express filing, ready within 3 business days. Additional past tax years are $99 each on either tier, and IRS fax delivery to the Ogden PIN Unit is included.",
    learnMore: { href: "/pricing", label: "See pricing" },
    source: "src/app/(marketing)/pricing/page.tsx:34; src/lib/pricing.ts:40; src/lib/pricing.ts:41; src/lib/pricing.ts:60; src/lib/pricing.ts:67; src/lib/pricing.ts:86",
  },
  {
    id: "standard-vs-express",
    category: "before-you-order",
    question: "What's the difference between Standard and Express?",
    answer:
      "Standard and Express differ only by turnaround. Standard is ready in 5-7 business days at $149, while Express is ready within 3 business days at $199 and adds priority email support. Both include the same documents and accountant review.",
    source: "src/app/(marketing)/form-5472-filing/page.tsx:59; src/lib/pricing.ts:40; src/lib/pricing.ts:41; src/lib/pricing.ts:60; src/lib/pricing.ts:67",
  },
  {
    id: "whats-included-for-the-price",
    category: "before-you-order",
    question: "What's included for the price?",
    answer:
      "The filing price includes Form 5472, pro forma Form 1120, the Part V supporting statement, review by a qualified tax accountant, a reasonable cause letter if you are late, IRS fax delivery, a timestamped receipt, filing confirmation, and a reminder before next year’s deadline.",
    source: "src/app/(marketing)/form-5472-filing/page.tsx:55",
  },
  {
    id: "hidden-fees",
    category: "before-you-order",
    question: "Are there any hidden fees?",
    answer:
      "We do not add hidden fees. The price you see is the price you pay, with no setup fee, no monthly subscription, and no per-page fax surcharge. Multi-year filings add a flat $99 per additional past year, disclosed up front.",
    source: "src/app/(marketing)/page.tsx:68; src/lib/pricing.ts:86",
  },
  {
    id: "information-to-have-ready",
    category: "before-you-order",
    question: "What information do I need to have ready?",
    answer:
      "You should have your LLC name, EIN, address, formation date, NAICS code, owner name, foreign tax ID, residential address, country of citizenship, country of tax residence, capital contributions, distributions, and year-end total assets ready. These are standard fields and simple manual entry.",
    source: "src/app/(marketing)/page.tsx:423; src/app/(marketing)/page.tsx:429; src/app/(marketing)/page.tsx:434",
  },
  {
    id: "guarantee",
    category: "before-you-order",
    question: "What's your guarantee?",
    answer:
      "We offer a 100% money-back guarantee if we fail to submit your filing to the IRS. If the fax does not deliver on the first send, we automatically retry, and if it still fails, you get a full refund.",
    source: "src/app/(marketing)/page.tsx:76",
  },
  {
    id: "are-you-a-cpa-firm",
    category: "before-you-order",
    question: "Are you a CPA firm? Who prepares my filing?",
    answer:
      "We are not a CPA firm and do not provide tax advice. We prepare and submit your information return as you provide it, with every package reviewed by a qualified tax accountant before submission.",
    learnMore: { href: "/about", label: "Read about Form5472 Prep" },
    source: "src/app/(marketing)/pricing/page.tsx:161; src/app/(marketing)/about/page.tsx:134; src/app/(marketing)/about/page.tsx:122",
  },
  {
    id: "what-is-pro-forma-form-1120",
    category: "the-filing",
    question: "What is the pro forma Form 1120, and why is it attached?",
    answer:
      "The pro forma Form 1120 is the cover document that lets Form 5472 be submitted as a valid IRS package. For foreign-owned single-member LLCs, Form 5472 is filed as an attachment to the pro forma Form 1120; neither form alone is valid for this filing.",
    learnMore: { href: "/1120-pro-forma-instructions", label: "Read the 1120 pro forma instructions" },
    source: "src/lib/landing-pages.ts:121 (slug: file-form-5472); src/lib/landing-pages.ts:720 (slug: form-5472-vs-1120)",
  },
  {
    id: "what-counts-as-reportable-transaction",
    category: "the-filing",
    question: "What counts as a reportable transaction?",
    answer:
      "Reportable transactions are defined broadly and can include capital in, distributions out, any payment between you and the LLC, any loan, and any related-party transaction. Form 5472 reports related-party transactions in dollar amounts.",
    source: "src/lib/landing-pages.ts:432 (slug: form-5472-instructions); src/lib/landing-pages.ts:728 (slug: form-5472-vs-1120)",
  },
  {
    id: "capital-contributions-owner-reimbursements",
    category: "the-filing",
    question: "Do capital contributions and owner reimbursements count as reportable transactions?",
    answer:
      "Capital contributions and owner reimbursements can count as reportable transactions. Capital contributions and distributions count, the seed money wired to open the bank account counts, and a reimbursement you took out for a business expense counts.",
    source: "src/lib/landing-pages.ts:60 (slug: file-form-5472)",
  },
  {
    id: "can-form-5472-be-e-filed",
    category: "the-filing",
    question: "Can Form 5472 be e-filed?",
    answer:
      "Form 5472 cannot be e-filed for this filer type. Form 5472 for foreign-owned disregarded entities is fax or mail only, and we prepare the package and fax it to the IRS Ogden PIN Unit.",
    source: "src/app/(marketing)/form-5472-deadline-calculator/page.tsx:73; src/app/(marketing)/page.tsx:64",
  },
  {
    id: "first-year-llc-file",
    category: "the-filing",
    question: "Does a first-year LLC still have to file?",
    answer:
      "A first-year LLC still follows the Form 5472 deadline rules if it had reportable transactions during its formation year. The year of formation counts, and the Form 5472 package follows the same deadline rules.",
    source: "src/app/(marketing)/form-5472-deadline-calculator/page.tsx:81",
  },
  {
    id: "dissolved-llc-still-file",
    category: "the-filing",
    question: "My LLC was dissolved this year — do I still file?",
    answer:
      "A dissolved LLC still files Form 5472 for the partial year ending at dissolution. The deadline is the 15th day of the 4th month after the LLC’s final month, using the annual deadline logic for a short tax year.",
    source: "src/lib/landing-pages.ts:534 (slug: foreign-owned-llc-tax)",
  },
  {
    id: "form-5472-deadline",
    category: "deadlines-penalties",
    question: "What is the Form 5472 deadline?",
    answer:
      "The Form 5472 deadline for a calendar-year LLC is generally April 15, filed with the pro forma Form 1120. Extensions may be available, but the extension process must be handled correctly.",
    learnMore: { href: "/form-5472-deadline-calculator", label: "Calculate your deadline" },
    source: "src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx:41",
    speakable: true,
  },
  {
    id: "form-7004-extension",
    category: "deadlines-penalties",
    question: "How does the Form 7004 extension work?",
    answer:
      "Form 7004 must be filed by the original April 15 deadline. If Form 7004 is timely, it extends the Form 5472 package due date to October 15 because Form 5472 is attached to Form 1120.",
    source: "src/app/(marketing)/form-5472-deadline-calculator/page.tsx:77; src/lib/landing-pages.ts:1687 (slug: form-5472-deadline)",
  },
  {
    id: "no-income-no-transactions-deadline",
    category: "deadlines-penalties",
    question: "Does having no income or no transactions change the deadline?",
    answer:
      "No income or no transactions does not change the Form 5472 deadline. The deadline itself does not change; Form 5472 is triggered by reportable transactions, not income, and if reportable transactions exist, the same due date applies.",
    source: "src/app/(marketing)/form-5472-deadline-calculator/page.tsx:69",
  },
  {
    id: "missed-form-5472",
    category: "deadlines-penalties",
    question: "What happens if Form 5472 is missed?",
    answer:
      "The IRS penalty is generally $25,000 for a missing or incomplete Form 5472. Late filings can sometimes include a reasonable cause explanation, but the best answer depends on the exact facts.",
    learnMore: { href: "/form-5472-penalty-calculator", label: "Estimate the penalty" },
    source: "src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx:45",
    speakable: true,
  },
  {
    id: "automatic-penalty",
    category: "deadlines-penalties",
    question: "Is the penalty really automatic?",
    answer:
      "The Form 5472 penalty is automatic. IRC §6038A(d) provides an initial $25,000 penalty when a reporting corporation fails to furnish required Form 5472 information on time or files an incomplete return.",
    source: "src/app/(marketing)/form-5472-penalty-calculator/page.tsx:37; src/lib/penalty.ts:1",
  },
  {
    id: "can-penalty-be-abated",
    category: "deadlines-penalties",
    question: "Can the penalty be abated?",
    answer:
      "The Form 5472 penalty can be abated, but there are no guarantees. Many late filers pursue reasonable-cause relief through DIIRSP, and first-time late filers are frequently successful when the facts support reasonable cause.",
    source: "src/app/(marketing)/form-5472-penalty-calculator/page.tsx:41",
  },
  {
    id: "cp15-notice",
    category: "deadlines-penalties",
    question: "What is a CP15 notice?",
    answer:
      "A CP15 notice is an IRS notice assessing a civil penalty. For Form 5472, it is commonly the notice that starts the post-notice timeline for continuation penalties if the filing is still not corrected.",
    source: "src/app/(marketing)/form-5472-penalty-calculator/page.tsx:45",
  },
  {
    id: "statute-of-limitations",
    category: "deadlines-penalties",
    question: "Is there a statute of limitations?",
    answer:
      "There is effectively no statute of limitations until a complete or substantially complete Form 5472 return is filed. Filing the return, even late, is what starts the clock; until then the year stays open indefinitely.",
    source: "src/app/(marketing)/form-5472-penalty-calculator/page.tsx:53",
  },
  {
    id: "missed-prior-years",
    category: "deadlines-penalties",
    question: "What if I've missed prior years?",
    answer:
      "If you missed prior years, you can pick all the years you need to file when you start. We auto-flag the filing as DIIRSP and include a reasonable cause statement requesting penalty abatement, with additional past tax years priced at $99 each.",
    learnMore: { href: "/pricing", label: "See multi-year pricing" },
    source: "src/app/(marketing)/page.tsx:52; src/app/(marketing)/pricing/page.tsx:46; src/app/(marketing)/form-5472-filing/page.tsx:67; src/lib/pricing.ts:86",
  },
  {
    id: "deadline-already-passed",
    category: "deadlines-penalties",
    question: "The deadline already passed this year — what should I do now?",
    answer:
      "If the Form 5472 deadline already passed, DIIRSP with a reasonable-cause statement is the standard remedy for a late Form 5472 package. If April 15 was missed without Form 7004, file the actual return under DIIRSP.",
    source: "src/app/(marketing)/form-5472-deadline-calculator/page.tsx:65; src/lib/landing-pages.ts:1715 (slug: form-5472-deadline)",
  },
  {
    id: "irs-notice-help",
    category: "deadlines-penalties",
    question: "I've received an IRS notice — can you still help, and what do you need from me?",
    answer:
      "We can help owners who received an IRS CP-15 notice or §6038A letter and need a properly prepared late filing. Send the notice number, such as CP15, and the tax year it covers; we will explain what a corrected or late filing involves before you pay. We prepare the late filing itself; we do not handle CP-15 penalty appeals, so for an appeal contact a tax attorney or enrolled agent.",
    learnMore: { href: "/contact", label: "Contact support" },
    source: "src/app/(marketing)/form-5472-filing/page.tsx:71; src/app/(marketing)/contact/page.tsx:38; src/lib/landing-pages.ts:644",
  },
  {
    id: "ein-needed-for-form-5472",
    category: "ein-itin",
    question: "Do I need an EIN to file Form 5472?",
    answer:
      "Yes, Form 5472 requires your LLC’s EIN in the header. We can handle both an EIN and a Form 5472 filing if you need both.",
    source: "src/app/(marketing)/ein/page.tsx:56",
    speakable: true,
  },
  {
    id: "what-is-an-ein",
    category: "ein-itin",
    question: "What is an EIN, and why does my LLC need one?",
    answer:
      "An EIN is a 9-digit US tax ID issued by the IRS to business entities. Your LLC needs an EIN to open a US business bank account, set up Stripe or PayPal, hire US contractors, file Form 5472, and sign certain contracts.",
    learnMore: { href: "/ein", label: "Read about EINs" },
    source: "src/app/(marketing)/ein/page.tsx:32",
  },
  {
    id: "apply-for-ein-myself",
    category: "ein-itin",
    question: "Can't I just apply for an EIN myself on the IRS website?",
    answer:
      "The online EIN application on irs.gov is only available if you have a US Social Security Number or ITIN. Foreign nationals without a US tax ID cannot use the online tool, so the remaining route is Form SS-4 by fax or phone.",
    source: "src/app/(marketing)/ein/page.tsx:36",
  },
  {
    id: "ssn-itin-needed-for-ein",
    category: "ein-itin",
    question: "Do I need a US Social Security Number or ITIN to get an EIN?",
    answer:
      "No, a non-resident owner without an SSN or ITIN can obtain an EIN. Form SS-4 allows the responsible party’s tax ID to be marked “Foreign,” and the application goes to the IRS international unit.",
    source: "src/lib/einApplicationFaq.ts:9",
  },
  {
    id: "ein-timing",
    category: "ein-itin",
    question: "How long does the EIN take?",
    answer:
      "An EIN typically takes 1-5 business days once we have your documents. We call the IRS Business & Specialty Tax Line on your behalf and can often obtain the EIN on the call, while complex cases may take slightly longer.",
    source: "src/app/(marketing)/ein/page.tsx:48",
  },
  {
    id: "already-have-ein",
    category: "ein-itin",
    question: "What if my LLC already has an EIN?",
    answer:
      "If your LLC already has an EIN, you do not need the EIN service. We can also help retrieve a lost or forgotten EIN; contact support@form5472prep.com.",
    source: "src/app/(marketing)/ein/page.tsx:60",
  },
  {
    id: "what-is-itin",
    category: "ein-itin",
    question: "What is an ITIN, and do I need one to run my US LLC?",
    answer:
      "An ITIN is a 9-digit tax ID issued by the IRS to individuals who need to file or be identified on a US tax return but are not eligible for a Social Security Number. Many foreign-owned US LLC owners operate with just an EIN and never need an ITIN.",
    learnMore: { href: "/itin", label: "Read about ITINs" },
    source: "src/app/(marketing)/itin/page.tsx:32; src/app/(marketing)/itin/page.tsx:40",
  },
  {
    id: "ein-vs-itin",
    category: "ein-itin",
    question: "What is the difference between an EIN and an ITIN?",
    answer:
      "An EIN is assigned to a business entity, while an ITIN is assigned to an individual. Your LLC has an EIN; you as a person would have an ITIN or SSN. Most foreign-owned single-member LLC owners need an EIN but may or may not need an ITIN.",
    source: "src/app/(marketing)/itin/page.tsx:56",
  },
  {
    id: "certifying-acceptance-agent",
    category: "ein-itin",
    question: "What is a Certifying Acceptance Agent, and how do you work with one?",
    answer:
      "A Certifying Acceptance Agent (CAA) can authenticate permitted identity documents for an ITIN application. We forward your application to an IRS-authorized CAA for the applicable document checks. A plain uploaded copy is not itself sufficient certification; follow the CAA's instructions. This route can avoid mailing an original passport to the IRS, but it does not guarantee ITIN eligibility or approval.",
    source:
      "src/app/(marketing)/itin/page.tsx:44; src/app/(marketing)/itin/page.tsx:78; src/app/(marketing)/itin/page.tsx:243; owner directive 2026-09-05: applications are forwarded to a CAA",
  },
  {
    id: "itin-timing",
    category: "ein-itin",
    question: "How long does the ITIN take?",
    answer:
      "The IRS says to allow 7 weeks for an ITIN application status notice, or 9-11 weeks when applying from overseas or during January 15 through April 30. These are processing estimates, not a guaranteed issuance date; requests for additional information can delay a decision.",
    source: "src/app/(marketing)/itin/page.tsx:52",
  },
  {
    id: "itin-and-ein-same-time",
    category: "ein-itin",
    question: "Can I apply for an ITIN and an EIN at the same time?",
    answer:
      "Yes, contact us to coordinate separate EIN and ITIN applications when both are actually needed. The LLC's EIN and the individual's ITIN serve different purposes. Each application has its own eligibility, documentation and IRS processing timeline; obtaining one does not guarantee or automatically require the other.",
    source: "src/app/(marketing)/itin/page.tsx:60",
  },
  {
    id: "process-start-to-finish",
    category: "how-our-service-works",
    question: "How does the process work, start to finish?",
    answer:
      "You provide LLC and owner information, related-party transactions and year-end assets. We prepare the supported package for review, resolve signing requirements, and arrange IRS fax delivery. Keep the exact submitted package and provider transmission receipt together; the receipt documents transmission, not an IRS determination that the filing is complete or accepted.",
    source: "src/app/(marketing)/page.tsx:423; src/app/(marketing)/page.tsx:429; src/app/(marketing)/page.tsx:434; src/app/(marketing)/page.tsx:439; src/app/(marketing)/page.tsx:444; src/app/(marketing)/page.tsx:449",
    speakable: true,
  },
  {
    id: "fax-filing-included",
    category: "how-our-service-works",
    question: "Is fax filing to the IRS really included?",
    answer:
      "Yes, fax delivery to the IRS Ogden PIN Unit is included on every plan with no separate fee, so you do not need your own fax machine. The provider's timestamped receipt is transmission evidence, not an IRS-issued acceptance or a guarantee of penalty relief.",
    source: "src/app/(marketing)/form-5472-filing/page.tsx:63; src/app/(marketing)/pricing/page.tsx:42",
  },
  {
    id: "how-do-i-sign",
    category: "how-our-service-works",
    question: "How do I sign the forms?",
    answer:
      "Review the completed package and establish who is authorized to sign. Form 5472 has no taxpayer signature block; the pro forma Form 1120 has the relevant block. Ink signing the completed cover and scanning it for fax is a conservative approach. A browser signature feature does not by itself establish IRS authorization for every document or submission route; contact us to resolve the method before submission.",
    source: "src/app/(marketing)/page.tsx:444; src/app/(marketing)/form-5472-filing/page.tsx:460; src/lib/landing-pages.ts:425; src/app/(marketing)/page.tsx:72",
  },
  {
    id: "how-long-whole-thing",
    category: "how-our-service-works",
    question: "How long does the whole thing take?",
    answer:
      "The filing takes about 15 minutes of your time in the wizard. On our side, Standard is reviewed and faxed to the IRS Ogden PIN Unit within 5-7 business days of your signature; Express is the same package within 3 business days.",
    source: "src/lib/landing-pages.ts:2199 (slug: pro-form-5472)",
  },
  {
    id: "store-bank-statements-signed-forms",
    category: "how-our-service-works",
    question: "Do you store my bank statements or signed forms?",
    answer:
      "No, we do not permanently store bank statements or signed forms. Bank statements are processed in memory to extract transaction totals and discarded; signed PDFs are held only long enough to fax to the IRS and deliver the fax confirmation receipt, then deleted.",
    learnMore: { href: "/data-retention", label: "Read the data retention policy" },
    source: "src/app/(marketing)/page.tsx:72",
  },
  {
    id: "message-reply-time",
    category: "how-our-service-works",
    question: "How quickly will you reply to a message?",
    answer:
      "We reply to messages within one business day, Monday to Friday, from support@form5472prep.com. Check your spam folder if you do not see the reply after you contact us.",
    learnMore: { href: "/contact", label: "Contact Form5472 Prep" },
    source: "src/app/(marketing)/contact/page.tsx:22",
  },
  {
    id: "accountants-formation-agents",
    category: "how-our-service-works",
    question: "Do you work with accountants and formation agents?",
    answer:
      "Yes, we work with formation agencies, registered agents, CPA and accounting firms, and consultants who manage US LLCs for multiple foreign-owned clients. Our partner program groups client filings under one partner account so one login shows live status for every client filing.",
    learnMore: { href: "/partners", label: "Read about partners" },
    source: "src/app/(marketing)/partners/page.tsx:32; src/app/(marketing)/partners/page.tsx:36",
  },
  {
    id: "irs-received-filing-proof",
    category: "after-we-file",
    question: "How do I know the IRS received my filing?",
    answer:
      "Inspect the provider receipt for the destination, timestamp, page count and reported transmission result. Keep it with the exact submitted package. That record is transmission evidence, not an IRS-issued acknowledgment of processing or acceptance. If delivery is uncertain or an IRS notice arrives, contact us and follow the notice's instructions and deadline.",
    source: "src/components/FaxReceiptProof.tsx:10; src/lib/email.ts:719",
  },
  {
    id: "irs-confirmation",
    category: "after-we-file",
    question: "Will the IRS send me a confirmation?",
    answer:
      "The current Form 5472 instructions do not describe a routine acceptance acknowledgment for this faxed package. A provider receipt and IRS processing are different things; silence proves neither acceptance nor rejection. Save your own submitted package and receipt rather than relying on indefinite portal storage, and do not resend solely because you have heard nothing.",
    source: "src/lib/email.ts:724; src/lib/landing-pages.ts:1795 (slug: form-5472-fax-number)",
  },
  {
    id: "next-year-reminder",
    category: "after-we-file",
    question: "Will you remind me next year?",
    answer:
      "Yes, we send a reminder in early January for the next filing obligation, with a further reminder in March. The January reminder gives over three months’ notice, and for returning customers we pre-fill LLC and owner details from your most recent paid filing.",
    source: "src/lib/email.ts:701; src/lib/pricing.ts:53; vercel.json (january-reminder + march-reminder crons); src/app/api/filings/route.ts:47",
  },
  {
    id: "keep-records",
    category: "after-we-file",
    question: "How long should I keep my records?",
    answer:
      "Keep the filed package, the IRS Fax Transmission Receipt, and our confirmation message with your LLC records for at least six years. If the filing was a final return for a dissolved LLC, keep the same documents with your permanent tax records for at least six years.",
    source: "src/lib/email.ts:686; src/lib/email.ts:571",
  },
  {
    id: "refund-policy",
    category: "after-we-file",
    question: "What is your refund policy?",
    answer:
      "Fees are non-refundable once a PDF has been generated, except as expressly stated. Fees are refundable if we are unable to transmit your filing to the IRS after three attempts.",
    learnMore: { href: "/terms", label: "Read the terms" },
    source: "src/app/(marketing)/terms/page.tsx:42",
  },
  {
    id: "data-retention",
    category: "after-we-file",
    question: "How long do you keep my data?",
    answer:
      "We retain fax transmission receipts for 7 years from the filing date, aggregated contribution and distribution totals for 7 years, entity and owner identification data for 7 years from last filing, payment records for 7 years, account email and login records for active use plus 12 months, and server access logs for 30 days.",
    learnMore: { href: "/data-retention", label: "Read the data retention policy" },
    source: "src/app/(marketing)/data-retention/page.tsx:73; src/app/(marketing)/data-retention/page.tsx:79; src/app/(marketing)/data-retention/page.tsx:84; src/app/(marketing)/data-retention/page.tsx:89; src/app/(marketing)/data-retention/page.tsx:94; src/app/(marketing)/data-retention/page.tsx:99",
  },
] as const;

export const FAQ_LAST_REVIEWED = "2026-09-06";
