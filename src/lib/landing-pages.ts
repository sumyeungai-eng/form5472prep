// SEO landing pages — each one targets a specific keyword phrase.
// One page per long-tail query that buyers actually search for.
// All content funnels back to /start.

export type LandingSection = {
  heading: string;
  body: string; // supports double-newline paragraphs
};

export type LandingFaq = { q: string; a: string };

export type LandingPage = {
  slug: string;
  title: string; // <title>
  metaDescription: string;
  h1: string;
  intro: string; // 2-3 sentence answer-up-front for AI snippets
  keyword: string; // primary target phrase
  sections: LandingSection[];
  faqs: LandingFaq[];
  relatedSlugs?: string[]; // for internal linking
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "file-form-5472",
    keyword: "how to file form 5472",
    title: "How to File IRS Form 5472 (2026 Step-by-Step Guide)",
    metaDescription:
      "Step-by-step guide to filing IRS Form 5472 with pro forma Form 1120 for foreign-owned US LLCs. Avoid the $25,000 penalty. File online in 15 minutes.",
    h1: "How to File IRS Form 5472",
    intro:
      "Foreign-owned US single-member LLCs must file Form 5472 with an attached pro forma Form 1120 by April 15 each year. You can't e-file — the IRS only accepts these forms by mail or fax to the Ogden PIN Unit. Below is the full step-by-step process, or skip the work and use our 15-minute online filer for $169.",
    sections: [
      {
        heading: "Who has to file Form 5472?",
        body: "You must file Form 5472 if all three are true:\n\n1. You own a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, or any state)\n2. You are NOT a US person — meaning you're not a US citizen, green card holder, or US tax resident\n3. Your LLC had at least one reportable transaction during the year (capital contributions in, distributions out, payments to or from the owner, or any related-party transaction)\n\nEven if your LLC had zero revenue, you still have to file — capital contributions and distributions count as reportable transactions.",
      },
      {
        heading: "What forms do you actually file?",
        body: "Form 5472 by itself is not enough. The IRS requires you to file it as an attachment to a pro forma Form 1120 (US Corporation Income Tax Return). The 1120 is \"pro forma\" — meaning you don't fill in most of it. You only complete the entity identification section and stamp \"Foreign-Owned U.S. DE\" across the top.\n\nIf you're filing late, you'll also need a Reasonable Cause Statement under the IRS Delinquent International Information Return Submission Procedure (DIIRSP) to request penalty abatement.",
      },
      {
        heading: "Step-by-step process",
        body: "1. Gather your LLC info: legal name, EIN, US address, formation date, NAICS code\n2. Gather your owner info: full legal name, foreign tax ID (FTIN), residential address, country of citizenship\n3. Add up your year-end financials: capital contributions, distributions, total assets at year-end\n4. Fill in Form 1120 (entity info only) and stamp it \"Foreign-Owned U.S. DE\"\n5. Fill in Form 5472 Parts I, II, III, IV, V, and VII\n6. Create a Part V supporting statement listing each related-party transaction\n7. Sign every page that requires a signature (in pen, not digital)\n8. Mail or fax to the IRS Ogden PIN Unit at +1-855-887-7737",
      },
      {
        heading: "Why can't I e-file?",
        body: "Foreign-owned US disregarded entities are explicitly excluded from IRS e-filing for Form 5472 and the attached pro forma Form 1120. The IRS publishes their fax number specifically for these filings. Fax is faster than mail and gives you a transmission receipt — which is your proof of timely filing.",
      },
      {
        heading: "The fastest way: use Form5472 Prep",
        body: "We built form5472 because preparing these forms by hand takes hours and any mistake can trigger the $25,000 penalty. Our service costs $169 + a $29 IRS fax delivery fee — total $198. We generate every form, you sign one PDF, we fax it to the IRS, and we send you the fax confirmation as proof of filing. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "What's the deadline to file Form 5472?",
        a: "April 15 of the year following the tax year, with an automatic 6-month extension to October 15 if you file Form 7004 by April 15.",
      },
      {
        q: "What happens if I file late?",
        a: "The IRS automatically assesses a $25,000 penalty per form, per year. You can request penalty abatement under DIIRSP by attaching a Reasonable Cause Statement.",
      },
      {
        q: "Can a CPA file Form 5472 for me?",
        a: "Yes, but most US CPAs are unfamiliar with Form 5472 for foreign-owned disregarded entities. Expect to pay $400-$800 and wait 1-2 weeks. Our service is $198 total and takes 15 minutes.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "form-5472-instructions", "diirsp"],
  },
  {
    slug: "form-5472-penalty",
    keyword: "form 5472 $25,000 penalty",
    title: "Form 5472 $25,000 Penalty — How to Avoid or Reduce It",
    metaDescription:
      "The IRS automatically charges $25,000 per missed or late Form 5472. Learn how to avoid it, request abatement under DIIRSP, and file safely online.",
    h1: "The Form 5472 $25,000 Penalty Explained",
    intro:
      "Under IRC § 6038A(d), the IRS automatically assesses a $25,000 penalty per Form 5472 that is filed late, filed incompletely, or not filed at all — per year. The penalty doubles if you don't fix it within 90 days of an IRS notice. Here's how the penalty works and how to either avoid it or get it abated.",
    sections: [
      {
        heading: "How the penalty is calculated",
        body: "$25,000 per Form 5472, per tax year. If you missed 3 years of filing for one LLC, that's $75,000 in automatic penalties. If you own multiple LLCs and missed all of them, multiply accordingly.\n\nThe penalty is automatic — the IRS computer system assesses it without a human reviewing your case. You'll receive a CP-15 notice in the mail.",
      },
      {
        heading: "The continuation penalty",
        body: "If you receive an IRS notice about a missed Form 5472 and fail to file within 90 days, an additional $25,000 penalty is assessed for each 30-day period (or fraction) that passes. There is no cap — penalties can stack indefinitely.",
      },
      {
        heading: "How to avoid the penalty",
        body: "1. File on time — by April 15, or by October 15 if you filed an extension\n2. File completely — Parts I, II, III, IV, V, and VII of Form 5472, plus a pro forma 1120 and a Part V supporting statement\n3. File by the right method — fax to +1-855-887-7737 or mail to IRS Ogden PIN Unit\n4. Keep your fax confirmation as proof",
      },
      {
        heading: "How to get the penalty abated (DIIRSP)",
        body: "If you've already missed filings, the IRS Delinquent International Information Return Submission Procedure (DIIRSP) lets you submit late returns with a Reasonable Cause Statement requesting penalty abatement. The statement must:\n\n• Explain why the form wasn't filed on time\n• Show you acted in good faith and exercised ordinary business care\n• Be specific about the circumstances (illness, reliance on a professional, language barrier, lack of awareness)\n\nThe IRS does NOT guarantee abatement, but well-written reasonable cause statements have a high success rate for first-time delinquencies.",
      },
      {
        heading: "We handle the whole process",
        body: "Form5472 Prep generates the Reasonable Cause Statement for you automatically when you file a late return. We're $169 per filing + $29 fax fee. Single year, two-year DIIRSP catch-up, or three-year catch-up are all available. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "Is the $25,000 penalty per LLC or per year?",
        a: "Both. It's $25,000 per Form 5472 you should have filed. If you own 2 LLCs and missed 3 years, that's 6 forms × $25,000 = $150,000.",
      },
      {
        q: "Will the IRS waive the penalty automatically?",
        a: "No. You must affirmatively request abatement with a Reasonable Cause Statement filed alongside the late return.",
      },
      {
        q: "Has the IRS actually enforced this?",
        a: "Yes. The IRS has automated penalty assessment for Form 5472 since 2018. Thousands of foreign LLC owners have received $25,000+ CP-15 notices in the mail.",
      },
    ],
    relatedSlugs: ["diirsp", "late-form-5472", "file-form-5472"],
  },
  {
    slug: "diirsp",
    keyword: "DIIRSP filing",
    title: "DIIRSP Filing — Delinquent International Information Return Procedure",
    metaDescription:
      "DIIRSP lets foreign-owned US LLC owners file late Form 5472 with a reasonable cause statement and request penalty abatement. Full guide + filing service.",
    h1: "DIIRSP: Filing Late Form 5472 with Penalty Abatement",
    intro:
      "The IRS Delinquent International Information Return Submission Procedure (DIIRSP) is the official way to catch up on missed Form 5472 filings while requesting that the $25,000 penalty be waived. Filing under DIIRSP requires a properly written Reasonable Cause Statement attached to each late return.",
    sections: [
      {
        heading: "Who qualifies for DIIRSP?",
        body: "DIIRSP is available to any taxpayer who:\n\n• Hasn't been contacted by the IRS about the specific delinquency yet\n• Hasn't been notified that they are under criminal investigation\n• Is not currently in IRS examination or under audit for the year in question\n\nIf the IRS has already sent you a CP-15 notice for the $25,000 penalty, you can still respond — but it's an appeal, not DIIRSP. DIIRSP is preventative.",
      },
      {
        heading: "How DIIRSP works",
        body: "1. Prepare the late Form 5472 + pro forma 1120 for each missed year\n2. Write a Reasonable Cause Statement explaining why the filing was late\n3. Attach the statement to the front of each year's package\n4. File all years together — mail or fax to the IRS Ogden PIN Unit\n5. Keep the fax confirmation as proof of timely DIIRSP submission",
      },
      {
        heading: "What makes a good Reasonable Cause Statement",
        body: "The IRS evaluates whether you acted with \"ordinary business care and prudence.\" Strong statements include:\n\n• A clear timeline of when and how you became aware of the filing requirement\n• Specific circumstances (you reasonably relied on a professional who didn't know about Form 5472, you live abroad and don't speak English fluently, you only recently learned the LLC needed this filing)\n• Evidence you took corrective action immediately upon learning\n• A statement that you will comply going forward\n\nGeneric statements like \"I didn't know\" are weak. Specific, factual statements work.",
      },
      {
        heading: "Multi-year DIIRSP filings",
        body: "If you've missed 2 or 3+ years, file them all at once with one comprehensive Reasonable Cause Statement covering the entire period. We offer flat-rate DIIRSP catch-up packages:\n\n• 2-year DIIRSP: $299 + $29 fax = $328 total\n• 3-year DIIRSP: $399 + $29 fax = $428 total\n\nThe per-year price is cheaper than filing separately, and we use one consistent reasonable cause narrative across all years.",
      },
    ],
    faqs: [
      {
        q: "Does DIIRSP guarantee my penalty is waived?",
        a: "No, but it's the official IRS process for requesting abatement. Well-written first-time DIIRSP submissions have a high success rate.",
      },
      {
        q: "How long after a DIIRSP filing will I hear back?",
        a: "Usually 3-6 months. The IRS will either accept the reasonable cause and close the matter, or send a CP-15 notice with the penalty assessed (which you can then appeal).",
      },
      {
        q: "Can I do DIIRSP myself?",
        a: "Yes, but writing a strong Reasonable Cause Statement is the hardest part. Our service generates one based on your specific situation.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "late-form-5472", "file-form-5472"],
  },
  {
    slug: "form-5472-instructions",
    keyword: "form 5472 instructions",
    title: "Form 5472 Instructions (2026) — Plain-English Walkthrough",
    metaDescription:
      "Plain-English Form 5472 instructions for foreign-owned US LLCs. Every part explained, common mistakes, and how to file safely with the IRS Ogden PIN Unit.",
    h1: "Form 5472 Instructions: Plain-English Walkthrough",
    intro:
      "The official IRS instructions for Form 5472 are 12 pages of dense regulatory language. Here's what each part actually means, what to write in each box, and the common mistakes that trigger the $25,000 penalty.",
    sections: [
      {
        heading: "Part I — Reporting Corporation",
        body: "This is your LLC's information.\n\n• Line 1a-1d: LLC legal name and address as shown on your EIN confirmation letter (CP-575)\n• Line 1b: EIN — your 9-digit IRS-issued number\n• Line 1c: Total assets at year-end (the ending balance from your books)\n• Line 1d: Principal business activity code (NAICS) — look up at naics.com\n• Line 1e: Total value of gross payments made or received reportable on this form\n• Line 1f: Total reportable transactions — this MUST include Part V amounts for foreign-owned DEs",
      },
      {
        heading: "Part II — 25% Foreign Shareholder",
        body: "This is YOU — the foreign owner.\n\n• Name and address (your residential address in your home country)\n• Foreign Tax ID Number (FTIN) — your tax ID from your country of residence\n• US identifying number if you have one (ITIN/SSN) — leave blank if you don't\n• Country of citizenship\n• Country of incorporation (only if the owner is itself a foreign entity)\n• Principal country where business is conducted",
      },
      {
        heading: "Part III — Related Party",
        body: "If the foreign shareholder (Part II) is also the related party (transactions occurred between you and the LLC), repeat the same information here. For most single-member LLCs owned by one individual, Part III mirrors Part II.",
      },
      {
        heading: "Part IV — Monetary Transactions",
        body: "List the transactions between you and the LLC. For most foreign-owned DEs, this section is blank because contributions and distributions go in Part V, not Part IV. If your LLC paid you for services or paid rent to you, put it here.",
      },
      {
        heading: "Part V — Reportable Transactions",
        body: "This is THE critical section for foreign-owned DEs.\n\n• Capital contributions you made to the LLC during the year\n• Distributions the LLC made to you during the year\n• Other amounts paid or received between you and the LLC\n\nAttach a supporting statement listing each transaction by date and amount. The total of Part V must equal Line 1f on Part I.",
      },
      {
        heading: "Part VII — Additional Information",
        body: "Check the boxes that apply. For most foreign-owned single-member LLCs, this section is brief — you'll check the box for \"foreign-owned domestic disregarded entity\" and the others stay blank.",
      },
      {
        heading: "Common mistakes that trigger penalties",
        body: "• Forgetting to attach pro forma Form 1120 — Form 5472 by itself isn't valid\n• Forgetting the Part V supporting statement\n• Mismatching Line 1f and the Part V total\n• Signing in pencil or with a digital signature (IRS requires wet ink)\n• Missing the April 15 deadline without filing Form 7004 for extension\n• Filing by email or trying to e-file — neither is accepted",
      },
    ],
    faqs: [
      {
        q: "Do I need a US address to file Form 5472?",
        a: "Your LLC needs a US address (your registered agent's address works). Your personal address is your foreign residential address.",
      },
      {
        q: "What's an FTIN if my country doesn't issue tax IDs?",
        a: "Write 'NOT LEGALLY REQUIRED' in the FTIN box. The IRS accepts this for residents of countries without tax ID systems.",
      },
      {
        q: "Do I need to attach financial statements?",
        a: "No. Only the Part V supporting statement listing each reportable transaction is required.",
      },
    ],
    relatedSlugs: ["file-form-5472", "pro-forma-1120", "form-5472-vs-1120"],
  },
  {
    slug: "foreign-owned-llc-tax",
    keyword: "foreign owned LLC tax filing",
    title: "Foreign-Owned US LLC Tax Filing Requirements (2026 Guide)",
    metaDescription:
      "Complete guide to tax filing requirements for foreign-owned US single-member LLCs: Form 5472, pro forma 1120, FBAR, ITIN, and state filings. File online in 15 minutes.",
    h1: "Foreign-Owned US LLC Tax Filing Requirements",
    intro:
      "If you're a non-US person who owns a US single-member LLC, you have specific federal tax filing obligations even if your LLC made zero revenue. The main requirement is Form 5472 with a pro forma Form 1120, but there are other potential filings depending on your situation.",
    sections: [
      {
        heading: "Federal filings every foreign-owned US LLC needs",
        body: "Form 5472 + pro forma Form 1120 is the universal requirement. Due April 15 each year (October 15 with extension). $25,000 penalty if missed.\n\nIf your LLC has US-source income that's effectively connected with a US trade or business, you may also need to file a personal Form 1040-NR — but for most ecommerce/SaaS/consulting LLCs serving non-US customers, there's no US-source income to report.",
      },
      {
        heading: "State filings",
        body: "Wyoming, Delaware, and New Mexico LLCs have no state income tax and require only an annual report ($60-$300 depending on state).\n\nFlorida, Nevada, and Texas LLCs similarly have no state income tax.\n\nIf you formed in a state with income tax (California, New York), you have additional state filing requirements regardless of where you live.",
      },
      {
        heading: "FBAR and FATCA",
        body: "FBAR (Form 114) is filed by US persons with foreign financial accounts — generally NOT required for non-US owners of US LLCs.\n\nFATCA Form 8938 similarly applies to US persons, not foreign owners.\n\nThe rare case where you need these: if your LLC has financial accounts in countries other than the US AND the LLC itself is treated as a US person (which it is for some federal tax purposes).",
      },
      {
        heading: "Do you need an ITIN?",
        body: "Most foreign-owned LLC owners do NOT need an ITIN. Form 5472 lets you list your foreign tax ID (FTIN) instead. You only need an ITIN if you have US-source income requiring you to file Form 1040-NR personally.",
      },
      {
        heading: "Sales tax",
        body: "If your LLC sells physical goods to US customers, you may have state sales tax obligations after crossing economic nexus thresholds (typically $100K in sales or 200 transactions in a state). Services and digital products are generally exempt in most states.",
      },
    ],
    faqs: [
      {
        q: "My LLC made zero revenue. Do I still file?",
        a: "Yes. Form 5472 is required even with zero revenue, as long as you had ANY reportable transaction (including the initial capital you put in to form the LLC).",
      },
      {
        q: "Do I owe US income tax on my LLC's profits?",
        a: "Generally no, if your LLC has no US trade or business and no US-source income. Profits flow through to you as the owner, taxable in your country of residence — not the US.",
      },
      {
        q: "What if I have employees in the US?",
        a: "Then you have significantly more requirements: payroll taxes (Form 941), worker's comp insurance, and likely state tax filings. Consult a CPA for that situation.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472", "file-form-5472"],
  },
  {
    slug: "late-form-5472",
    keyword: "late form 5472",
    title: "Late Form 5472 — How to File Late and Avoid the Penalty",
    metaDescription:
      "Filed Form 5472 late or didn't file at all? Catch up under DIIRSP with a Reasonable Cause Statement. Single year and multi-year catch-up filings, $169 each.",
    h1: "Filed Form 5472 Late? Here's What to Do Now",
    intro:
      "If you missed the April 15 deadline for Form 5472, file as soon as possible. The IRS Delinquent International Information Return Submission Procedure (DIIRSP) lets you submit late filings with a Reasonable Cause Statement requesting that the $25,000 penalty be waived. The longer you wait, the higher the risk of an automatic CP-15 penalty notice.",
    sections: [
      {
        heading: "What happens if you do nothing",
        body: "Within 6-18 months of the missed deadline, the IRS automated system issues a CP-15 notice assessing the $25,000 penalty. Once that notice arrives, your options narrow:\n\n• You can pay it\n• You can appeal it (much harder than filing under DIIRSP preemptively)\n• You can ignore it — but then the IRS starts collection action against the LLC's US assets, and continuation penalties accrue at $25,000 per 30-day period",
      },
      {
        heading: "What to do right now",
        body: "1. Don't panic. The IRS has not yet assessed the penalty if you haven't received a CP-15 notice.\n2. Prepare the late return immediately. Each missed year requires its own Form 5472 + pro forma 1120.\n3. Write a Reasonable Cause Statement (or use our service to generate one).\n4. File via DIIRSP — mail or fax to the IRS Ogden PIN Unit.\n5. Keep the fax confirmation as proof of timely DIIRSP filing.",
      },
      {
        heading: "What if you've missed multiple years",
        body: "File ALL missed years in one DIIRSP package. Don't space them out. The IRS treats a comprehensive catch-up filing more favorably than serial late filings.\n\nOur multi-year DIIRSP packages handle the common cases:\n• 2-year catch-up: $299 + $29 fax\n• 3-year catch-up: $399 + $29 fax\n\nThe reasonable cause statement covers all years with one consistent narrative.",
      },
      {
        heading: "What if you've already received a CP-15 notice",
        body: "DIIRSP is no longer available for that specific year. You need to:\n\n1. Respond to the CP-15 within 30 days\n2. Submit a Form 843 (Claim for Refund and Request for Abatement) with a strong reasonable cause explanation\n3. Consider hiring a CPA or tax attorney for the appeal\n\nWe currently don't handle CP-15 appeals — only preventative DIIRSP filings. If you have a CP-15 notice, talk to a US tax professional.",
      },
    ],
    faqs: [
      {
        q: "How late can I be before DIIRSP no longer works?",
        a: "There's no hard deadline — DIIRSP is available until the IRS contacts you about the specific delinquency. Once a CP-15 arrives, you must use a different appeal process.",
      },
      {
        q: "Is there a chance the IRS just won't notice?",
        a: "Unlikely. The IRS automated system cross-references EIN holders, and foreign-owned DEs are a known compliance focus area since 2018.",
      },
      {
        q: "Can I file under DIIRSP myself?",
        a: "Yes. The procedure is publicly documented. The hardest part is writing a strong Reasonable Cause Statement — our service generates one for you.",
      },
    ],
    relatedSlugs: ["diirsp", "form-5472-penalty", "file-form-5472"],
  },
  {
    slug: "form-5472-vs-1120",
    keyword: "form 5472 vs 1120",
    title: "Form 5472 vs Form 1120 — What's the Difference?",
    metaDescription:
      "Form 5472 reports related-party transactions. Form 1120 is the US corporate income tax return. For foreign-owned US LLCs, you file both — here's how they work together.",
    h1: "Form 5472 vs Form 1120 — What's the Difference?",
    intro:
      "Form 5472 and Form 1120 are two separate IRS forms that foreign-owned US LLCs must file together. Form 1120 is the US corporate income tax return. Form 5472 is an information return about related-party transactions. For most foreign-owned single-member LLCs, the 1120 is filed \"pro forma\" — meaning most boxes are blank.",
    sections: [
      {
        heading: "What is Form 1120?",
        body: "Form 1120 (U.S. Corporation Income Tax Return) is the standard tax return that domestic corporations use to report income, deductions, and calculate corporate income tax. For a real C-corporation, it's a 6-page tax calculation.\n\nFor a foreign-owned US single-member LLC, your LLC is treated as a disregarded entity — meaning it doesn't pay corporate income tax. So you file the form \"pro forma\" with only the identification fields completed and \"Foreign-Owned U.S. DE\" written across the top.",
      },
      {
        heading: "What is Form 5472?",
        body: "Form 5472 (Information Return of a 25% Foreign-Owned U.S. Corporation) is an information return — meaning it reports transactions but does NOT calculate tax. It's specifically designed for cases where a foreign person owns 25% or more of a US corporation or disregarded entity.\n\nIt reports things like: capital you contributed to the LLC, distributions you took out, payments to or from related parties.",
      },
      {
        heading: "Why both?",
        body: "Form 5472 by itself isn't a valid IRS submission. The IRS requires it to be attached to a tax return. For foreign-owned disregarded entities, the IRS chose Form 1120 as the attachment vehicle — even though the LLC doesn't owe corporate income tax.\n\nThink of it like an envelope: the 1120 is the envelope, the 5472 is the letter inside. The IRS won't accept the letter without the envelope.",
      },
      {
        heading: "What information goes on each form?",
        body: "Form 1120 (pro forma version for foreign-owned DEs):\n• Entity name, EIN, address\n• Total assets at year-end\n• \"Foreign-Owned U.S. DE\" stamp at the top\n• Most other fields: blank\n\nForm 5472:\n• Reporting corporation info (your LLC)\n• 25% foreign shareholder info (you)\n• Related party info\n• Monetary and reportable transactions\n• Supporting statements",
      },
      {
        heading: "Does this trigger US corporate income tax?",
        body: "No. Filing pro forma Form 1120 does NOT make your LLC subject to US corporate income tax. The LLC remains a disregarded entity for tax purposes. The 1120 is just the procedural vehicle for filing Form 5472. Tax on LLC profits (if any) flows through to you personally, taxable in your home country.",
      },
    ],
    faqs: [
      {
        q: "If I don't owe corporate tax, why file Form 1120?",
        a: "Because Form 5472 by itself isn't a valid submission. The IRS requires it to be attached to Form 1120 as an information envelope.",
      },
      {
        q: "Is Form 1120 the same as Form 1120-S?",
        a: "No. Form 1120-S is for S-corporations. You file pro forma 1120 (not 1120-S) for a foreign-owned disregarded LLC.",
      },
      {
        q: "Do I file Form 1040 too?",
        a: "Only if you have US-source income personally requiring you to file 1040-NR. Most foreign LLC owners with no US trade or business don't need 1040-NR.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "file-form-5472", "form-5472-instructions"],
  },
  {
    slug: "wyoming-llc-form-5472",
    keyword: "Wyoming LLC form 5472",
    title: "Wyoming LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Wyoming LLCs owned by non-US persons must file Form 5472 with pro forma Form 1120. Full guide + 15-minute online filing for $169 + $29 fax fee.",
    h1: "Wyoming LLC Form 5472 Filing Guide",
    intro:
      "Wyoming is the most popular state for foreign-owned US LLCs because of its low fees, no state income tax, and strong privacy laws. But Wyoming residency doesn't exempt you from federal filings — every foreign-owned Wyoming LLC must file IRS Form 5472 with pro forma Form 1120 by April 15 each year.",
    sections: [
      {
        heading: "Why Wyoming is the #1 state for foreign LLC owners",
        body: "• No state income tax\n• No state-level franchise tax on LLCs\n• Cheap annual report ($60/year)\n• Strong owner privacy (Wyoming doesn't require disclosing the owner in public records)\n• Online filing for state-level requirements\n\nThese benefits make Wyoming attractive — but they're STATE-level. Federal Form 5472 obligations apply regardless of which state you incorporated in.",
      },
      {
        heading: "Wyoming-specific tax timeline",
        body: "April 15 — Federal Form 5472 + pro forma Form 1120 due\nFirst day of formation month — Wyoming Annual Report due ($60), filed with Wyoming Secretary of State\n\nThat's it. No state income tax return, no franchise tax, no state-level information return.",
      },
      {
        heading: "Common Wyoming LLC scenarios",
        body: "1. Solo founder, no US activity (ecommerce, SaaS, consulting): file Form 5472 + 1120 only. Often the LLC made no taxable US-source income.\n\n2. Stripe Atlas LLC formed in Wyoming/Delaware: same as above. The fact that Stripe Atlas helped you form doesn't change anything — you still need to file Form 5472.\n\n3. Wyoming holding LLC with subsidiaries: file Form 5472 for each LLC where you're a 25%+ foreign owner.",
      },
      {
        heading: "Filing Form 5472 for your Wyoming LLC",
        body: "The process is identical to any other state:\n\n1. Gather LLC info (legal name, EIN, Wyoming registered agent address)\n2. Gather your owner info (legal name, FTIN, country of residence)\n3. Add up year-end financials\n4. Fill and sign the forms\n5. Fax to the IRS Ogden PIN Unit\n\nOur service handles all of this for $169 + $29 fax fee. Just answer the wizard questions and we generate the package.",
      },
    ],
    faqs: [
      {
        q: "Does Wyoming notify the IRS about my LLC?",
        a: "Wyoming reports your LLC's existence to the IRS when you get your EIN. After that, federal filings are your responsibility — the state doesn't track them.",
      },
      {
        q: "Do I need a Wyoming registered agent address on Form 5472?",
        a: "Use the address on your EIN confirmation letter (CP-575). Usually that's your registered agent's address.",
      },
      {
        q: "I dissolved my Wyoming LLC last year. Do I still file Form 5472?",
        a: "Yes — for the partial year the LLC was active, you still need to file a final Form 5472 + 1120 covering that period.",
      },
    ],
    relatedSlugs: ["foreign-owned-llc-tax", "delaware-llc-form-5472", "file-form-5472"],
  },
  {
    slug: "delaware-llc-form-5472",
    keyword: "Delaware LLC form 5472",
    title: "Delaware LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Delaware LLCs with foreign owners must file IRS Form 5472 + pro forma Form 1120. Complete guide and 15-minute online filing service for $169 + $29 fax.",
    h1: "Delaware LLC Form 5472 Filing Guide",
    intro:
      "Delaware is the #2 most popular state for foreign-owned US LLCs after Wyoming. Stripe Atlas defaults to Delaware. If you formed a Delaware LLC and you're not a US person, you must file IRS Form 5472 with pro forma Form 1120 every year — even if your LLC had zero revenue.",
    sections: [
      {
        heading: "Why Delaware?",
        body: "Delaware's appeal: well-developed business law, the Chancery Court for business disputes, brand recognition with US investors. Stripe Atlas chose it as the default for its incorporation product.\n\nDownsides for solo foreign owners: Delaware has a $300/year franchise tax for LLCs (higher than Wyoming's $60). It also requires more disclosure than Wyoming.",
      },
      {
        heading: "Delaware-specific tax timeline",
        body: "April 15 — Federal Form 5472 + pro forma Form 1120 due (filed with the IRS, not Delaware)\nJune 1 — Delaware Annual LLC Franchise Tax due ($300/year, filed with Delaware Division of Corporations)\n\nDelaware has NO state income tax on LLCs that don't conduct business in Delaware (which is most foreign-owned LLCs).",
      },
      {
        heading: "Stripe Atlas LLCs",
        body: "If you used Stripe Atlas to incorporate, your LLC is most likely Delaware. Stripe Atlas provides excellent help with formation, but they explicitly do NOT handle Form 5472 — that's your responsibility.\n\nWe handle Form 5472 specifically for foreign-owned Stripe Atlas LLCs. Same flat $169 + $29 fax fee, same 15-minute filing process.",
      },
      {
        heading: "Filing Form 5472 for your Delaware LLC",
        body: "Identical to filing for any other state:\n\n1. Gather LLC info (legal name, EIN, Delaware registered agent address)\n2. Gather your owner info (legal name, FTIN, country of residence)\n3. Add up year-end financials\n4. Fill and sign the forms\n5. Fax to the IRS Ogden PIN Unit at +1-855-887-7737\n\nDelaware doesn't change the federal process at all.",
      },
    ],
    faqs: [
      {
        q: "Does Delaware notify the IRS about my LLC?",
        a: "Delaware reports the LLC at formation when you got your EIN. Annual federal filings (including Form 5472) are your responsibility going forward.",
      },
      {
        q: "Is the Delaware franchise tax separate from Form 5472?",
        a: "Yes. The $300 Delaware franchise tax is paid to the Delaware Division of Corporations. Form 5472 is filed with the IRS. They're completely separate.",
      },
      {
        q: "Can I move my LLC from Delaware to Wyoming to avoid the franchise tax?",
        a: "Yes, via domestication. But Form 5472 still applies to whichever state you're in. The federal filing requirement doesn't change.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "foreign-owned-llc-tax", "file-form-5472"],
  },
  {
    slug: "pro-forma-1120",
    keyword: "pro forma 1120",
    title: "Pro Forma Form 1120 — What It Is and How to Fill It Out",
    metaDescription:
      "Pro forma Form 1120 is filed by foreign-owned US LLCs as the attachment to Form 5472. Most fields stay blank. Full walkthrough + 15-minute online filing.",
    h1: "Pro Forma Form 1120 — Plain-English Guide",
    intro:
      "Foreign-owned US single-member LLCs file pro forma Form 1120 as the procedural vehicle for filing Form 5472. \"Pro forma\" means most of the form stays blank — you only fill in entity identification fields and stamp \"Foreign-Owned U.S. DE\" at the top. This guide shows exactly what to fill in.",
    sections: [
      {
        heading: "What does 'pro forma' mean here?",
        body: "Pro forma means \"as a matter of form\" — you file the form for procedural compliance, not to calculate tax. The IRS requires Form 5472 to be attached to a tax return, but a foreign-owned disregarded LLC isn't subject to US corporate income tax. So the 1120 becomes a near-empty envelope.\n\nDon't fill in income, deductions, or tax calculations. Doing so would incorrectly subject your LLC to US corporate tax.",
      },
      {
        heading: "Fields you DO fill in",
        body: "• Entity name (matching your EIN confirmation letter)\n• EIN\n• US address\n• Date of incorporation\n• Total assets at year-end (Schedule L, line 15, column (d))\n• \"Foreign-Owned U.S. DE\" stamped or written across the top of page 1",
      },
      {
        heading: "Fields you LEAVE BLANK",
        body: "• Income section (lines 1-11)\n• Deductions (lines 12-29)\n• Tax computation (lines 30-37)\n• Most schedules (Schedule C, D, J, K, M-1, M-2)\n\nLeave them empty. Don't write \"0\" — write nothing. The IRS instructions specifically say pro forma 1120s for foreign-owned DEs have these sections blank.",
      },
      {
        heading: "The 'Foreign-Owned U.S. DE' stamp",
        body: "This is a literal requirement from the IRS instructions. At the top of page 1 of Form 1120, write or stamp:\n\n\"Foreign-Owned U.S. DE\"\n\nThis tells the IRS this is a pro forma filing for Form 5472 purposes, not a real corporate income tax return. Without this stamp, the IRS may try to process it as a regular 1120 and trigger problems.",
      },
      {
        heading: "Filing the package",
        body: "Once your pro forma 1120 is filled and stamped, attach Form 5472 (and its Part V supporting statement) behind it. Sign the 1120 in pen on the signature line. Fax the entire package to the IRS Ogden PIN Unit at +1-855-887-7737.\n\nOur service generates the entire correctly-formatted package automatically. You sign one PDF and we handle the fax.",
      },
    ],
    faqs: [
      {
        q: "Do I need to fill in Schedule L (balance sheet)?",
        a: "Only the total assets line (Schedule L, line 15, column (d)). The other balance sheet detail isn't required for pro forma filings.",
      },
      {
        q: "Can I e-file the pro forma 1120?",
        a: "No. Foreign-owned disregarded entities are excluded from e-filing for 1120 and 5472. Mail or fax only.",
      },
      {
        q: "Do I need to attach Form 1125-A or 1125-E?",
        a: "No. Those schedules are for active C-corporations. Pro forma 1120 for foreign-owned DEs doesn't require them.",
      },
    ],
    relatedSlugs: ["form-5472-vs-1120", "file-form-5472", "form-5472-instructions"],
  },
  {
    slug: "form-1120-foreign-owned-llc",
    keyword: "form 1120 foreign owned LLC",
    title: "Form 1120 for Foreign-Owned LLC — Pro Forma Filing Guide",
    metaDescription:
      "Foreign-owned US LLCs must file pro forma Form 1120 with Form 5472. Learn what to fill in, what to leave blank, and how to file in 15 minutes.",
    h1: "Form 1120 for Foreign-Owned LLCs",
    intro:
      "If you're a non-US person who owns a US single-member LLC, you must file Form 1120 — but in a special \"pro forma\" version. Almost every field stays blank. The 1120 exists only as an envelope for Form 5472 (the form that actually matters). Here's exactly how it works and what to file.",
    sections: [
      {
        heading: "Why a foreign-owned LLC files 1120 at all",
        body: "Your LLC is a \"disregarded entity\" by default — meaning it doesn't pay corporate income tax. So why file Form 1120 (the corporate income tax return)?\n\nBecause IRS regulations require Form 5472 to be attached to a tax return. For foreign-owned disregarded entities, the IRS picked Form 1120 as the procedural attachment vehicle. So you file a pro forma (mostly blank) 1120 as the cover sheet for your Form 5472.\n\nThis does NOT make your LLC subject to US corporate tax. The pro forma 1120 is paperwork only.",
      },
      {
        heading: "Boxes you fill in",
        body: "Page 1, header section:\n• Entity name\n• EIN\n• US business address\n• Date of incorporation\n• Total assets at year-end (Schedule L, line 15, column (d))\n\nWrite \"Foreign-Owned U.S. DE\" at the top of page 1.\n\nThat's it. Don't fill in income, deductions, or tax calculations.",
      },
      {
        heading: "Boxes you LEAVE BLANK",
        body: "• Income (lines 1-11)\n• Deductions (lines 12-29)\n• Tax computation (lines 30-37)\n• Most schedules — A, C, D, J, K, M-1, M-2 are all blank\n\nThis isn't a mistake or oversight. The IRS instructions explicitly state pro forma 1120 for foreign-owned DEs is filed with these sections empty. Filling them in could incorrectly trigger US corporate income tax.",
      },
      {
        heading: "Signing the pro forma 1120",
        body: "The signature line at the bottom of page 1 must be signed by you (the owner) in pen — not digitally. Title yourself \"Member\" or \"Owner.\"\n\nDate the form. The date should match when you actually sign, not the tax year end.",
      },
      {
        heading: "Filing the package",
        body: "1. Attach Form 5472 (with Part V supporting statement) behind your signed pro forma 1120\n2. Fax everything to the IRS Ogden PIN Unit at +1-855-887-7737\n3. Keep the fax confirmation receipt as proof of filing\n\nDo NOT mail Form 1120 to the regular IRS processing center. The Ogden PIN Unit is the only correct destination for foreign-owned DE filings.",
      },
      {
        heading: "Get it done in 15 minutes",
        body: "Our service generates a perfectly-formatted pro forma 1120 + Form 5472 package automatically. You answer 12 questions in a wizard, we generate the PDF, you sign one page, we fax it to the IRS. Total cost: $169 + $29 fax fee = $198. 100% money-back guarantee.",
      },
    ],
    faqs: [
      {
        q: "Does filing pro forma 1120 mean my LLC owes US corporate income tax?",
        a: "No. The pro forma 1120 is procedural only. Your LLC remains a disregarded entity for tax purposes and doesn't pay US corporate income tax.",
      },
      {
        q: "Do I file a state Form 1120?",
        a: "Only if you formed in a state with corporate income tax (California, New York, etc.). Wyoming, Delaware, Florida, Nevada, and Texas have no state corporate income tax.",
      },
      {
        q: "Can I file Form 1120 electronically (e-file)?",
        a: "No. Foreign-owned disregarded entities are excluded from e-filing for Form 1120 and Form 5472. Fax or mail only.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-5472-vs-1120", "file-form-5472"],
  },
  {
    slug: "form-1120-disregarded-entity",
    keyword: "form 1120 disregarded entity",
    title: "Form 1120 for a Disregarded Entity — Foreign Owner Filing",
    metaDescription:
      "How to file pro forma Form 1120 for a foreign-owned disregarded entity. Required as an attachment to Form 5472. Step-by-step guide + online filing service.",
    h1: "Form 1120 for a Disregarded Entity (Foreign Owner)",
    intro:
      "A US LLC owned by a single non-US person is a \"disregarded entity\" — meaning the IRS treats it as if it doesn't exist for income tax purposes. So why does it file Form 1120? Because Treasury Regulation § 1.6038A-1 requires Form 5472 to be attached to a tax return, and a pro forma Form 1120 is the IRS-specified vehicle.",
    sections: [
      {
        heading: "What is a disregarded entity?",
        body: "A disregarded entity (DE) is a business entity (usually an LLC) that has just one owner and hasn't elected to be taxed as a corporation. The IRS \"disregards\" the entity for federal income tax purposes — meaning income and deductions flow through to the owner directly, as if the entity didn't exist.\n\nFor a US LLC owned by one non-US person, the LLC is automatically a disregarded entity unless you affirmatively elect C-corp or S-corp taxation (which most foreign owners shouldn't do).",
      },
      {
        heading: "Why a disregarded entity files Form 1120",
        body: "Disregarded entities don't normally file Form 1120 — that's a corporate income tax return for actual corporations.\n\nThe exception is foreign-owned single-member LLCs treated as DEs. Treasury Regulation § 1.6038A-1 says these entities are treated as separate domestic corporations \"solely for purposes of\" Form 5472 reporting. So they file Form 5472 — and the only way the IRS accepts Form 5472 is as an attachment to Form 1120.\n\nThe 1120 is filed \"pro forma\" — mostly empty — as a procedural cover sheet.",
      },
      {
        heading: "What the pro forma 1120 looks like",
        body: "Header section: fully filled in (name, EIN, address, date of incorporation, total assets at year-end).\n\nBody: empty. No income, no deductions, no tax calculation, no schedules.\n\nTop of page 1: stamped \"Foreign-Owned U.S. DE\" (literal IRS requirement).\n\nSignature line: signed in pen by the owner.\n\nThat's the entire filing. Plus Form 5472 + Part V supporting statement attached behind it.",
      },
      {
        heading: "Where to file",
        body: "Foreign-owned DE filings go ONLY to the IRS Ogden PIN Unit:\n\n• Fax: +1-855-887-7737\n• Mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201\n\nDo NOT send to the regular Form 1120 processing addresses. Doing so risks the filing being misprocessed as a real corporate income tax return — which can trigger collection notices and tax liability for tax you don't actually owe.",
      },
      {
        heading: "What if you elect C-corp taxation?",
        body: "If you actively elect C-corp taxation by filing Form 8832, your LLC is no longer a disregarded entity. It becomes a real US corporation that owes corporate income tax (currently 21% federal) on its worldwide income.\n\nFor most foreign owners, this is a bad idea — you'd owe US tax on profits earned abroad. Keep the default disregarded entity classification unless you've consulted a US tax professional about a specific reason to elect C-corp status.",
      },
      {
        heading: "Skip the paperwork — 15-minute filing",
        body: "Form5472 Prep generates the complete disregarded entity filing package: pro forma 1120, Form 5472, Part V supporting statement, all correctly formatted per IRS rules. Total cost $169 + $29 fax = $198. We fax to the Ogden PIN Unit and send you the confirmation receipt as proof of filing.",
      },
    ],
    faqs: [
      {
        q: "How do I know if my LLC is a disregarded entity?",
        a: "If your LLC has one owner and you've never filed Form 8832 to elect C-corp or S-corp taxation, it's a disregarded entity by default.",
      },
      {
        q: "What if my disregarded entity has more than one owner?",
        a: "If a US LLC has multiple owners, it's a partnership by default — not a disregarded entity. Partnerships file Form 1065, not 1120, and Form 5472 doesn't apply the same way.",
      },
      {
        q: "Does the disregarded entity have to file a US tax return?",
        a: "The disregarded entity doesn't compute its own tax (it's disregarded), but it must file pro forma Form 1120 + Form 5472 as an information return if it had any reportable transactions.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-5472-vs-1120"],
  },
  {
    slug: "1120-pro-forma-instructions",
    keyword: "1120 pro forma instructions",
    title: "1120 Pro Forma Instructions — What to Fill, What to Leave Blank",
    metaDescription:
      "Field-by-field instructions for filling out pro forma Form 1120 for a foreign-owned US LLC. Avoid the common mistakes that trigger IRS notices.",
    h1: "1120 Pro Forma Instructions (Foreign-Owned LLCs)",
    intro:
      "Filling out a pro forma Form 1120 is different from a real corporate tax return. You complete almost nothing. Below is the field-by-field breakdown of what to fill in, what to leave blank, and the common mistakes that cause the IRS to misprocess your filing.",
    sections: [
      {
        heading: "Page 1 header — fully filled in",
        body: "• Entity name — exactly as on your EIN confirmation letter (CP-575)\n• EIN — your 9-digit IRS-issued number\n• Number, street, and room or suite — your US business address (registered agent address is fine)\n• City, state, ZIP\n• A: Check box \"Initial return\" only if this is your LLC's first year\n• B: Employer Identification Number — same EIN as above\n• C: Date incorporated — your LLC's formation date\n• D: Total assets at year-end — from Schedule L, line 15, column (d). Round to nearest dollar\n• E: Check applicable boxes — usually all blank for a pro forma filing\n\nAt the very top of page 1, write or stamp: \"Foreign-Owned U.S. DE\"",
      },
      {
        heading: "Income section (lines 1-11) — LEAVE BLANK",
        body: "Lines 1a through 11 cover gross receipts, returns, dividends, interest, gross rents, royalties, capital gains, and other income.\n\nALL of these lines stay blank on a pro forma filing. Don't write \"0,\" don't write \"N/A,\" don't write anything. Leave the line untouched.\n\nWhy: writing zeros could be interpreted as a complete (incorrect) income tax return rather than a pro forma information envelope.",
      },
      {
        heading: "Deductions section (lines 12-29) — LEAVE BLANK",
        body: "Lines 12 through 29 cover officer compensation, salaries, repairs, bad debts, rents, taxes, interest, depreciation, depletion, advertising, pensions, employee benefits, reserves, and other deductions.\n\nALL blank on a pro forma filing.",
      },
      {
        heading: "Tax, refundable credits, and payments (lines 30-37) — LEAVE BLANK",
        body: "All blank. Your LLC isn't computing tax. The pro forma 1120 is informational only.",
      },
      {
        heading: "Schedules — what to do",
        body: "Schedule C (Dividends): blank\nSchedule J (Tax Computation): blank\nSchedule K (Other Information): blank\nSchedule L (Balance Sheet): only line 15, column (d) — Total Assets at end of year. All other balance sheet lines blank.\nSchedule M-1 (Reconciliation of Income): blank\nSchedule M-2 (Analysis of Retained Earnings): blank",
      },
      {
        heading: "Signature block",
        body: "Sign on the signature line at the bottom of page 1 in PEN. Digital signatures are not accepted by the IRS for these filings.\n\nDate: when you actually sign\nTitle: \"Member\" or \"Owner\" (or \"Sole Member\")\nPaid preparer section: leave blank if you're filing yourself (or completed by your preparer if using one)",
      },
      {
        heading: "Common mistakes that trigger IRS notices",
        body: "• Writing zeros in the income section — IRS may process it as a real (zero-income) tax return and ask questions later\n• Forgetting the \"Foreign-Owned U.S. DE\" stamp at the top of page 1\n• Filling in Schedule L with a complete balance sheet (only line 15 column (d) is needed)\n• Signing digitally instead of in pen\n• Mailing to the wrong IRS address — must go to Ogden PIN Unit, not regular 1120 processing center\n• Forgetting to attach Form 5472 + Part V supporting statement",
      },
    ],
    faqs: [
      {
        q: "Should I write 'N/A' or 'None' in blank fields?",
        a: "No. Leave the fields completely untouched. The IRS instructions for pro forma filings specify the unused sections stay blank, not marked.",
      },
      {
        q: "What if I don't know my LLC's total assets at year-end?",
        a: "It's usually the ending balance in your business bank account, plus any equipment or receivables. If your LLC only has a bank account, use that ending balance.",
      },
      {
        q: "Can I print a blank 1120 PDF and fill it by hand?",
        a: "Yes, the IRS accepts handwritten Form 1120. Use blue or black ink, write neatly, and stamp \"Foreign-Owned U.S. DE\" at the top. Our service generates a typed PDF you can sign — fewer errors.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-1120-disregarded-entity"],
  },
];

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_PAGES.find((p) => p.slug === slug) ?? null;
}
