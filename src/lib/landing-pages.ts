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
  // Hide from organic search (noindex + nofollow + excluded from sitemap).
  // Used for paid-ad landing pages where we don't want Google to surface
  // the page organically — only ad clicks should reach it.
  noindex?: boolean;
  // When set, the page displays PREMIUM_TIERS pricing and the filing
  // started from this page is billed at premium prices end-to-end. The
  // slug must also be added to PREMIUM_SOURCES in src/lib/pricing.ts.
  pricingMode?: "premium";
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
      "Foreign-owned US single-member LLCs must file Form 5472 with an attached pro forma Form 1120 by April 15 each year. You can't e-file — the IRS only accepts these forms by mail or fax to the Ogden PIN Unit at +1-855-887-7737. Below is the full step-by-step process, broken down into every form, field, and decision you'll face — or skip the work entirely and use our accountant-reviewed 15-minute online filer from $199.",
    sections: [
      {
        heading: "Who has to file Form 5472?",
        body: "You must file Form 5472 if all three are true:\n\n1. You own a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, or any state).\n2. You are NOT a US person — meaning you are not a US citizen, green card holder, or US tax resident.\n3. Your LLC had at least one reportable transaction during the year (capital contributions in, distributions out, payments to or from the owner, loans, or any related-party transaction).\n\nEven if your LLC had zero revenue, you still have to file. Capital contributions and distributions count as reportable transactions — and almost every foreign-owned LLC has at least one. The seed money you wired in to open the bank account counts. A reimbursement you took out for a business expense counts. A payment from the LLC to a company you also own counts.\n\nIn practice, every active foreign-owned single-member LLC files Form 5472 every year. The only realistic exception is an LLC that has been totally dormant — no bank account, no money in or out, no contracts signed.",
      },
      {
        heading: "What forms do you actually file?",
        body: "Form 5472 by itself is not enough. The IRS requires you to file it as an attachment to a pro forma Form 1120 (US Corporation Income Tax Return). The 1120 is \"pro forma\" — meaning you don't fill in most of it. You only complete the entity identification section and stamp \"Foreign-Owned U.S. DE\" across the top of page 1.\n\nThe full package is:\n\n1. Cover letter identifying the filing.\n2. Pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp.\n3. Form 5472, Parts I, II, III, IV, V, and VII fully completed.\n4. Part V supporting statement that lists each reportable transaction in detail.\n5. Reasonable Cause Statement (only if you are filing late under DIIRSP).\n\nMissing any one of these can trigger the $25,000 penalty, even if you've technically \"filed\". The IRS treats incomplete returns the same as missing returns under IRC § 6038A.",
      },
      {
        heading: "Step-by-step process",
        body: "1. Gather your LLC info: legal name as registered with the state, EIN, US address, date of formation, country of incorporation (US), state of incorporation, NAICS / principal business activity code.\n2. Gather your owner info: full legal name as on passport, foreign tax ID (FTIN) or self-assigned Reference ID, residential address abroad, country of citizenship, country of tax residence, country of organization of any related foreign entities.\n3. Add up year-end financials: capital contributions in, distributions out, total assets at year-end (in USD), and a list of every transaction between the LLC and any related party.\n4. Fill in Form 1120: entity identification (lines A-E), name, address, EIN, date of formation, total assets. Leave income and tax sections blank. Stamp or type \"Foreign-Owned U.S. DE\" across the top margin.\n5. Fill in Form 5472: Part I (reporting corporation), Part II (25%+ foreign shareholder), Part III (related party), Part IV (monetary transactions), Part V (cost-sharing or other transactions), Part VII (foreign disregarded entity info).\n6. Build the Part V supporting statement: one line per reportable transaction with date, amount, related party, and nature.\n7. Sign every signature line in pen. Digital-only signatures are not accepted by the IRS for these filings.\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Keep the fax confirmation receipt — it is your proof of timely filing.",
      },
      {
        heading: "What goes on each part of Form 5472",
        body: "Part I — Reporting Corporation: the LLC. Name, EIN, address, total assets, country of incorporation, principal business activity code, total value of gross payments to/from foreign related parties.\n\nPart II — 25%+ Foreign Shareholder: you, the foreign owner. Name, address, US ITIN (if you have one) or Reference ID, country of citizenship, country of organization.\n\nPart III — Related Party: same as Part II for a single-owner LLC, since you are both the 25%+ shareholder and the related party. For multi-related-party scenarios, you list each one.\n\nPart IV — Monetary Transactions Between Reporting Corporation and Foreign Related Party: dollar amounts of sales, services, rents, royalties, interest, loans, and other payments in each direction.\n\nPart V — Reportable Transactions of a Reporting Corporation That Is a Foreign-Owned U.S. DE: this is where capital contributions, distributions, and most owner-to-LLC payments get reported. Must be backed by a supporting statement.\n\nPart VII — Additional Information for FDE: confirms the LLC is a disregarded entity and identifies it as foreign-owned.",
      },
      {
        heading: "Why can't I e-file?",
        body: "Foreign-owned US disregarded entities are explicitly excluded from IRS e-filing for Form 5472 and the attached pro forma Form 1120. The IRS Modernized e-File (MeF) system cannot process these returns — the IRS publishes their fax number (+1-855-887-7737) specifically because there's no e-file option.\n\nFax is faster than mail and gives you a transmission receipt with a timestamp — which is your proof of timely filing under IRC § 6038A. Certified mail with a return receipt works too, but takes longer and is harder to track.\n\nDo not try to file through a normal e-file service like TurboTax, FreeTaxUSA, or H&R Block. They cannot submit Form 5472 for a foreign-owned single-member LLC even if they accept your money. The return will simply not reach the IRS.",
      },
      {
        heading: "Real-world example",
        body: "Mei is a Hong Kong resident who incorporated a Wyoming single-member LLC in 2023 to run a Shopify dropshipping business. The LLC had $84,000 in revenue in 2024, $0 in US-source income (all customers were European), and she paid herself $30,000 in distributions to her HK bank account.\n\nHer filing for tax year 2024:\n\n• Pro forma Form 1120: stamped \"Foreign-Owned U.S. DE\". Entity info filled in. No income or tax fields completed.\n• Form 5472 Part IV: reports the $30,000 distribution she took.\n• Form 5472 Part V: reports the $5,000 capital contribution she wired in at the start of the year to fund inventory.\n• Part V supporting statement: lists both transactions with dates and amounts.\n• Faxed to +1-855-887-7737 by April 15, 2025.\n\nHer total US federal tax owed: $0 (all income was foreign-source from a foreign-owned disregarded entity). Her filing obligation: still mandatory.",
      },
      {
        heading: "Common mistakes to avoid",
        body: "• Filing only Form 5472 without the pro forma 1120 — the IRS will reject this and treat it as not filed.\n• Forgetting to stamp \"Foreign-Owned U.S. DE\" on the 1120.\n• Leaving Part V blank when capital contributions or distributions occurred.\n• Using a digital-only signature — the IRS requires a wet/ink signature on these specific forms.\n• Filing for the wrong tax year (the package is for the tax year that ended, not the current year).\n• Missing the Part V supporting statement — Part V references it but many DIY filers forget to attach the list.\n• Reporting amounts in a foreign currency — all dollar figures must be in USD using the appropriate exchange rate.\n• Sending to the wrong fax number — only +1-855-887-7737 is the IRS Ogden PIN Unit fax for these filings.",
      },
      {
        heading: "How much does it cost to file?",
        body: "Three ways to do it:\n\n1. DIY with IRS forms: $0 in fees but 4-8 hours of careful work, and any mistake risks the $25,000 penalty. You also need a fax service ($2-$5).\n\n2. Hire a US CPA: $400-$800 typical. Most CPAs are unfamiliar with Form 5472 for foreign-owned disregarded entities, so expect them to either decline the work or take 1-3 weeks while they research it.\n\n3. Use Form5472 Prep: Standard $199 · Rush $279 · Premium $449. IRS fax delivery included on every plan. +$149 per additional past year.\n\nEvery package we prepare is reviewed by an accountant on our team before we fax it to the IRS. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "What happens after you file",
        body: "The IRS Ogden Service Center will process your return over the following weeks. For most foreign-owned single-member LLCs there is no follow-up — no news is good news.\n\nIf the IRS has a question or wants additional information, they will mail a notice (usually a Letter 5891 or CP-15) to the LLC's US address. Make sure the address you put on the forms can actually receive mail — many foreign owners use a virtual mailbox service or their registered agent's address.\n\nKeep your filing records for at least 6 years: the signed PDF, the fax transmission receipt, and copies of any IRS correspondence. The IRS can audit Form 5472 filings for up to 6 years after the filing date if the return is incomplete.\n\nNext year, you'll do the same thing again — Form 5472 is an annual filing. Most customers come back to us each spring and we pre-fill from their prior year's filing.",
      },
      {
        heading: "Skip the work — file in 15 minutes",
        body: "Our online filer asks 12 simple questions about your LLC, owner, and year-end totals. We generate the entire package (cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement if late). You sign once on screen — no printing or scanning. An accountant on our team reviews the package end-to-end. Then we fax it to the IRS Ogden PIN Unit and email you the timestamped fax transmission receipt as proof of filing.\n\nPricing: Standard from $199 · Rush $279 · Premium $449. IRS fax delivery included. +$149 per additional past year. 100% money-back guarantee if we fail to submit your filing.",
      },
    ],
    faqs: [
      {
        q: "What's the deadline to file Form 5472?",
        a: "April 15 of the year following the tax year (e.g. April 15, 2026 for tax year 2025). You get an automatic 6-month extension to October 15 if you file Form 7004 by April 15. The extension shifts the Form 5472 deadline too, since 5472 is attached to the 1120.",
      },
      {
        q: "What happens if I file late?",
        a: "The IRS automatically assesses a $25,000 penalty per form, per year. If they send a notice and you still don't file within 90 days, another $25,000 is added every 30 days. You can request abatement under DIIRSP by attaching a Reasonable Cause Statement explaining why you missed the deadline.",
      },
      {
        q: "Can a US CPA file Form 5472 for me?",
        a: "Technically yes, but most US-based CPAs see this filing once or twice in their career and aren't comfortable with it. Expect $400-$800 and 1-2 weeks of back-and-forth while they research the requirements. Our flat-fee service starts at $199, takes 15 minutes, and is accountant-reviewed.",
      },
      {
        q: "Do I need a US ITIN to file?",
        a: "No. Form 5472 accepts either a US ITIN or a foreign tax ID (FTIN). If you don't have a FTIN either (some jurisdictions don't issue them), you can use a self-assigned Reference ID. Our wizard auto-generates one for you if you leave the field blank.",
      },
      {
        q: "What if my LLC had no transactions at all?",
        a: "A truly inactive LLC — no bank account, no money in or out — may not have a reportable transaction. But the bar is low: a single capital contribution to open the bank account counts. If you're unsure, file anyway. A $199 filing is cheaper than even a small percentage risk of the $25,000 penalty.",
      },
      {
        q: "Do I file Form 5472 or Form 1120 — or both?",
        a: "Both, together, as one package. The pro forma 1120 acts as the cover document; Form 5472 is the attachment. Neither one alone is a valid filing for a foreign-owned single-member LLC.",
      },
      {
        q: "I own multiple LLCs. Do I file once for all of them?",
        a: "No. Each LLC files its own separate Form 5472 + pro forma 1120. If you own three foreign-owned LLCs, you'll prepare three separate packages and fax three separate filings to the IRS.",
      },
      {
        q: "What about state tax filings?",
        a: "Form 5472 is a federal filing only. State requirements vary: Wyoming has no state income tax and no annual income filing. Delaware charges a $300 franchise tax due June 1 (handled directly via Delaware's website). Florida and Nevada have similar simple franchise/license fees. We handle the federal Form 5472 + 1120; state filings are separate.",
      },
      {
        q: "Is IRS fax delivery included in the price?",
        a: "Yes. IRS fax delivery to +1-855-887-7737 is included in every plan — Standard, Rush, and Premium. There is no separate fax fee. You will receive the timestamped fax transmission receipt as proof of timely filing.",
      },
      {
        q: "Does someone actually review my filing before it goes to the IRS?",
        a: "Yes. Every package is reviewed by an accountant on our team before we fax it. Nothing goes to the IRS on autopilot. If anything looks off, we'll reach out before submitting.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "form-5472-instructions", "diirsp", "form-5472-deadline", "form-5472-fax-number"],
  },
  {
    slug: "form-5472-penalty",
    keyword: "form 5472 $25,000 penalty",
    title: "Form 5472 $25,000 Penalty — How to Avoid or Reduce It",
    metaDescription:
      "The IRS automatically charges $25,000 per missed or late Form 5472. Learn how to avoid it, request abatement under DIIRSP, and file safely online from $199.",
    h1: "The Form 5472 $25,000 Penalty Explained",
    intro:
      "Under IRC § 6038A(d), the IRS automatically assesses a $25,000 penalty per Form 5472 that is filed late, filed incompletely, or not filed at all — per year, per LLC. The penalty stacks at $25,000 per 30-day period if you don't fix it within 90 days of an IRS notice. Here's exactly how the penalty works, who it applies to, how to either avoid it entirely, and how to request abatement if you've already triggered it.",
    sections: [
      {
        heading: "How the penalty is calculated",
        body: "$25,000 per Form 5472, per tax year. If you missed 3 years of filing for one LLC, that's $75,000 in automatic penalties. If you own multiple LLCs and missed all of them, multiply accordingly: 2 LLCs × 3 missed years = 6 forms × $25,000 = $150,000.\n\nThe penalty is automatic — the IRS computer system assesses it without a human reviewing your case. You receive a CP-15 notice in the mail at the LLC's address of record. The notice gives you 90 days to respond before continuation penalties begin.\n\nIt does not matter whether your LLC made any money, owed any US tax, or had any US-source income. The penalty is for failing to file the information return, not for failing to pay tax. A perfectly compliant foreign-owned LLC with $0 income and $0 tax due still owes $25,000 if it misses the filing.",
      },
      {
        heading: "The continuation penalty",
        body: "If you receive an IRS notice about a missed Form 5472 and fail to file within 90 days, an additional $25,000 penalty is assessed for each 30-day period (or fraction of) that passes. There is no statutory cap — penalties can stack indefinitely.\n\nExample timeline: Day 0, you miss the April 15 deadline. Day 270, the IRS mails you a CP-15 for $25,000. Day 360, the 90-day grace period expires. Day 390, another $25,000 is added. Day 420, another $25,000. By Day 540, you'd be at $25,000 × 6 = $150,000 for that single year if you keep ignoring the notices.\n\nThis is why catching up quickly under DIIRSP — even years late — is dramatically cheaper than waiting for an IRS notice and then dragging your feet.",
      },
      {
        heading: "How to avoid the penalty entirely",
        body: "1. File on time — by April 15 of the year following the tax year, or by October 15 if you filed Form 7004 for an extension by April 15.\n2. File completely — Parts I, II, III, IV, V, and VII of Form 5472, plus the pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp, plus the Part V supporting statement.\n3. File by the right method — fax to +1-855-887-7737 (IRS Ogden PIN Unit) or mail certified to IRS Ogden, UT 84201-0023. The IRS does not accept these via e-file or email.\n4. Keep your fax transmission receipt — it's the timestamped proof you filed before the deadline. The IRS does not send a separate confirmation.\n5. Use a US address that can actually receive mail in case the IRS sends a notice.",
      },
      {
        heading: "How to get the penalty abated (DIIRSP)",
        body: "If you've already missed filings, the IRS Delinquent International Information Return Submission Procedure (DIIRSP) lets you submit late returns with a Reasonable Cause Statement requesting penalty abatement. The statement must:\n\n• Explain specifically why the form wasn't filed on time.\n• Show that you acted in good faith and exercised ordinary business care and prudence.\n• Describe the circumstances honestly (lack of awareness as a first-time foreign LLC owner, reliance on a tax professional who didn't flag the obligation, illness, language barrier, etc.).\n• Confirm that you're now filing all delinquent returns concurrently and have taken steps to ensure future compliance.\n\nThe IRS does NOT guarantee abatement, but well-documented first-time delinquencies have a high acceptance rate. Generic boilerplate statements are far less likely to succeed than ones tied to specific personal circumstances.",
      },
      {
        heading: "What triggers the penalty besides missing the deadline",
        body: "Most foreign LLC owners assume the $25,000 penalty only applies to non-filers. It doesn't. The IRS treats these failures the same way:\n\n• Filing only Form 5472 without the pro forma Form 1120.\n• Filing Form 5472 without the Part V supporting statement when Part V has entries.\n• Filing with substantially incomplete information (e.g. Part IV blank when you took distributions).\n• Filing through a method the IRS doesn't accept (e-file attempts, email, wrong fax number).\n• Filing in the wrong tax year or with the wrong EIN.\n• Filing without wet/ink signatures where required.\n\nA careless DIY filing can trigger the same $25,000 penalty as not filing at all. This is the main reason we have an accountant review every filing on our service before it gets faxed.",
      },
      {
        heading: "Real-world scenarios",
        body: "Scenario A — first-time owner, just missed: Carlos (Mexico) formed his Wyoming LLC in 2024 to run an Amazon FBA store. He learned about Form 5472 in May 2025, one month after the deadline. He files immediately under DIIRSP with a reasonable cause statement explaining first-time foreign owner unawareness. Typical outcome: penalty waived.\n\nScenario B — multi-year catch-up: Mei (Hong Kong) has had a Delaware LLC since 2022 and never filed. In 2026 she discovers the obligation. She files 2022, 2023, 2024, and 2025 together as a single DIIRSP package. Typical outcome: penalty abatement granted for all four years if the reasonable cause statement is well-documented.\n\nScenario C — ignored an IRS notice: Ahmed (UAE) received a CP-15 in July 2024 for missing tax year 2022 and didn't respond. By 2026 his single-year penalty has stacked to $100,000+ through the 30-day continuation rule. He still needs to file, plus negotiate the assessed penalty — much harder than scenarios A and B.\n\nThe takeaway: act fast. Even multi-year catch-ups are vastly cheaper than waiting for an IRS notice and then delaying.",
      },
      {
        heading: "What happens if you can't pay the penalty",
        body: "If the IRS assesses a penalty and you don't qualify for full abatement, you have options:\n\n• Partial abatement: the IRS may waive part of the penalty based on partial reasonable cause.\n• Installment agreement: pay over time, typically up to 72 months.\n• Offer in Compromise: in cases of genuine financial hardship, the IRS may accept less than the full amount.\n• First-Time Abate (FTA): a separate program for taxpayers with a clean compliance history of the prior 3 years.\n\nNone of these are guaranteed and all are more complex than just filing on time. If you're already in penalty territory, talk to a tax professional or enrolled agent who handles international information returns.",
      },
      {
        heading: "Does the penalty apply to multi-member LLCs?",
        body: "Form 5472 also applies to US corporations that are 25%+ owned by a foreign person, but the filing is different and outside the scope of our service. The $25,000 penalty applies the same way for those filings under IRC § 6038A — but the actual forms include real income and tax calculations, not just a pro forma 1120.\n\nIf your LLC has more than one member, our wizard will flag you out at the pre-flight step. You'll need a CPA familiar with foreign-owned partnerships (Form 8865) or corporations (Form 5472 + full Form 1120). The good news: we handle the most common foreign-owned LLC case (single-member, foreign-owned, disregarded for tax) at flat rates.",
      },
      {
        heading: "We handle the whole DIIRSP process",
        body: "Form5472 Prep automatically generates a Reasonable Cause Statement when you file a late return. The narrative is tailored to first-time foreign LLC owners — the most common DIIRSP scenario — and you can edit it in the wizard if your circumstances are different.\n\nPricing for catch-up filings:\n• 1 year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2-year DIIRSP catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year DIIRSP catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\nFiling all missed years together with one comprehensive reasonable cause statement gives the strongest abatement argument. Every package is reviewed by an accountant on our team before we fax to the IRS Ogden PIN Unit. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "Bottom line",
        body: "The $25,000-per-form-per-year penalty is the single largest compliance risk most foreign LLC owners are unaware of. It's automatic, it stacks if ignored, and it applies even when your LLC owes zero US tax.\n\nThree things keep you safe:\n\n1. File every year, on time, completely, by fax to +1-855-887-7737.\n2. If you've missed filings, catch up under DIIRSP immediately with a reasonable cause statement.\n3. Don't ignore IRS notices — the continuation penalty makes a manageable problem into a six-figure one.\n\nOur 15-minute online filer handles all of this from $199 (Standard), $279 (Rush), or $449 (Premium). IRS fax delivery included. +$149 per additional past year. Accountant-reviewed, with a money-back guarantee.",
      },
    ],
    faqs: [
      {
        q: "Is the $25,000 penalty per LLC or per year?",
        a: "Both. It's $25,000 per Form 5472 you should have filed — and each LLC files one form per tax year. If you own 2 LLCs and missed 3 years on each, that's 6 forms × $25,000 = $150,000.",
      },
      {
        q: "Will the IRS waive the penalty automatically?",
        a: "No. You must affirmatively request abatement with a Reasonable Cause Statement filed alongside the late return. The IRS doesn't apply waivers on its own.",
      },
      {
        q: "Has the IRS actually enforced this?",
        a: "Yes. The IRS has automated penalty assessment for Form 5472 since 2018. Thousands of foreign LLC owners have received $25,000+ CP-15 notices in the mail. It is not a paper-tiger penalty.",
      },
      {
        q: "If I file under DIIRSP, am I guaranteed the penalty is waived?",
        a: "No, DIIRSP is a request, not a guarantee. That said, well-documented first-time late filings are typically accepted — the IRS published the procedure specifically to encourage voluntary catch-up by international information return filers.",
      },
      {
        q: "What's a CP-15 notice?",
        a: "It's the IRS form letter that assesses a civil penalty. For Form 5472 it's typically titled \"Notice of Penalty Charge\" and shows the $25,000 amount, the tax year, and a 90-day window before continuation penalties begin. Don't ignore it.",
      },
      {
        q: "How is the penalty different from US income tax?",
        a: "Totally different. Most foreign-owned single-member LLCs owe $0 in US federal income tax (their income is foreign-source). The $25,000 is an information-return penalty under IRC § 6038A — not a tax bill. It's punishment for not filing the disclosure, regardless of whether tax is owed.",
      },
      {
        q: "If I file an extension, does that delay the penalty risk?",
        a: "Yes. Filing Form 7004 by April 15 extends both the 1120 and the attached Form 5472 to October 15. As long as you file by the extended deadline, no penalty. Miss October 15 and you're in the same penalty position as missing April 15 without an extension.",
      },
      {
        q: "Does the IRS apply the penalty to dormant LLCs?",
        a: "Yes, if you had at least one reportable transaction. A truly dormant LLC (no bank account, zero activity) may have an argument that no filing was required — but the bar is very low. Most LLCs with even one wire to fund operations cross it.",
      },
      {
        q: "Can I pay the penalty and skip the filing?",
        a: "No. Paying a CP-15 penalty does not satisfy the filing requirement. You still owe the Form 5472 — and continuation penalties continue to stack until you actually file.",
      },
      {
        q: "What does your service cost vs. the penalty exposure?",
        a: "Our service is $199–$449 depending on tier and years. The penalty for a single missed year is $25,000 — a fraction of our service price. For multi-year catch-up packages (add $149 per additional past year), the math is even more compelling against ignoring the obligation.",
      },
    ],
    relatedSlugs: ["diirsp", "late-form-5472", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "diirsp",
    keyword: "DIIRSP filing",
    title: "DIIRSP Filing — Delinquent International Information Return Procedure",
    metaDescription:
      "DIIRSP lets foreign-owned US LLC owners file late Form 5472 with a reasonable cause statement and request penalty abatement. Full guide + accountant-reviewed catch-up filings.",
    h1: "DIIRSP: Filing Late Form 5472 with Penalty Abatement",
    intro:
      "The IRS Delinquent International Information Return Submission Procedure (DIIRSP) is the official way to catch up on missed Form 5472 filings while requesting that the $25,000-per-form-per-year penalty be waived. Filing under DIIRSP requires a properly written Reasonable Cause Statement attached to each late return. Get it right and most first-time filers walk away with no penalty assessed. Get it wrong — or do nothing — and the IRS will eventually mail a CP-15 notice and start the clock on continuation penalties.",
    sections: [
      {
        heading: "What DIIRSP actually is",
        body: "DIIRSP — Delinquent International Information Return Submission Procedure — is an IRS-published voluntary disclosure path specifically for international information returns like Form 5472, Form 5471, Form 8865, and Form 8938.\n\nIt is not amnesty. It is not a guaranteed waiver. It is the IRS saying: \"If you submit your delinquent international information returns with a reasonable cause statement, we will evaluate the request and decide whether to assess the penalty.\"\n\nThe procedure exists because the IRS recognizes most foreign-owned LLC owners don't know about Form 5472 until after they've missed years of filings. Without DIIRSP, the penalty system would punish honest catch-up too harshly. With DIIRSP, well-documented voluntary catch-ups have a high acceptance rate.",
      },
      {
        heading: "Who qualifies for DIIRSP?",
        body: "DIIRSP is available to any taxpayer who:\n\n• Has not been contacted by the IRS about the specific delinquency yet (no CP-15 notice, no audit letter, no examination opened).\n• Has not been notified that they are under criminal investigation.\n• Is not currently under examination or audit for the tax year in question.\n• Does not owe any US income tax for the year in question (DIIRSP is for information-return delinquencies, not unpaid-tax cases).\n\nIf the IRS has already sent you a CP-15 notice for the $25,000 penalty, you can still respond — but the path is penalty abatement appeal, not DIIRSP. DIIRSP is preventative; once a notice is issued you're in the formal appeal process.\n\nMost foreign-owned single-member LLCs satisfy all four criteria — they have $0 US tax liability and have never been contacted by the IRS. DIIRSP is the right path for almost all of them.",
      },
      {
        heading: "How DIIRSP works — step by step",
        body: "1. Identify every missed year. If you formed the LLC in 2022 and haven't filed, that's 2022, 2023, 2024.\n2. Prepare the complete filing package for each missed year separately: cover letter, pro forma Form 1120 (with \"Foreign-Owned U.S. DE\" stamp), Form 5472, Part V supporting statement.\n3. Write a single Reasonable Cause Statement that covers all missed years (or one per year if circumstances differ).\n4. Attach the statement to the front of the package.\n5. File all years together — fax the entire set to +1-855-887-7737 (IRS Ogden PIN Unit), or mail certified to IRS Ogden, UT 84201-0023.\n6. Keep the fax transmission receipt. It's the timestamped proof that you submitted under DIIRSP on a specific date — important if the IRS later tries to assess penalties.\n7. Wait. The IRS typically responds within 3-6 months. No response usually means accepted.",
      },
      {
        heading: "What makes a good Reasonable Cause Statement",
        body: "The IRS evaluates whether you acted with \"ordinary business care and prudence.\" Strong statements include:\n\n• A clear timeline of when and how you became aware of the filing requirement.\n• Specific personal circumstances — first-time foreign LLC owner, reliance on a tax professional who didn't flag the obligation, language barrier, the LLC was formed as part of a Stripe Atlas / startup accelerator package and the filing wasn't part of the onboarding, etc.\n• Evidence you took corrective action immediately upon learning (and how soon — \"I learned in March 2026 and am filing in April 2026\" is much stronger than \"I learned in 2024 and am filing now\").\n• Explicit confirmation that no US tax is owed and that this is purely an information-return delinquency.\n• A statement that you will comply going forward, ideally citing the system you've put in place (e.g. annual filing reminder, signed up for an annual filing service).\n• Concise — typically 1-2 pages.\n\nGeneric statements like \"I didn't know\" are weak. Specific, factual statements tied to your real circumstances work.",
      },
      {
        heading: "What weakens a Reasonable Cause Statement",
        body: "Things that hurt your DIIRSP case:\n\n• Vague excuses (\"I was busy\", \"I forgot\", \"my CPA didn't tell me\" without further detail).\n• Statements that contradict facts visible on the form (e.g. claiming you didn't know about US filing obligations while reporting years of US-source revenue).\n• Boilerplate copied from forums or generic templates with no facts unique to your situation.\n• Aggressive language toward the IRS.\n• Implying tax avoidance was a motive.\n• Missing or contradictory dates in the timeline.\n• Claims of reliance on a professional without naming when you consulted them or what they advised.\n• Filing under DIIRSP when you have unpaid US tax (use Streamlined Filing Compliance Procedures or a different path instead).",
      },
      {
        heading: "Multi-year DIIRSP filings",
        body: "If you've missed 2 or 3+ years, file them all at once with one comprehensive Reasonable Cause Statement covering the entire period. The IRS treats a single comprehensive catch-up far more favorably than serial late filings spaced out over time.\n\nOur flat-rate DIIRSP catch-up packages:\n\n• 2-year DIIRSP catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year DIIRSP catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\nThe per-year price is cheaper than filing separately, and we use one consistent reasonable cause narrative across all years. Every package is reviewed by an accountant on our team before we fax it to the IRS.\n\nFor 4+ missed years, you'd run two packages back-to-back or message us to coordinate — the IRS still accepts the comprehensive catch-up approach but the multi-year package limit is 3 years per wizard session.",
      },
      {
        heading: "DIIRSP vs. Streamlined vs. Quiet Disclosure",
        body: "Three commonly confused IRS catch-up paths:\n\n• DIIRSP — for delinquent international information returns (Form 5472, 5471, 8865, 8938) where no US tax is owed. Reasonable cause statement required.\n\n• Streamlined Filing Compliance Procedures — for US persons (citizens, green-card holders) with delinquent FBAR or income-tax filings. Requires a Streamlined Certification and is more complex. Almost never the right path for a foreign-owned US LLC with $0 US tax.\n\n• Quiet disclosure — informal term for filing late without explanation. Strongly discouraged. The IRS often assesses penalties anyway and there's no documented good-faith effort to abate.\n\nFor foreign-owned single-member LLCs with no US tax liability, DIIRSP is the right path 99% of the time.",
      },
      {
        heading: "What happens after you file under DIIRSP",
        body: "The IRS Ogden Service Center processes the package. Typical timeline:\n\n• 0-2 weeks: fax confirmed delivered. No IRS acknowledgment yet — that's normal.\n• 2-6 months: IRS reviews. If they accept the reasonable cause, you typically hear nothing. No news is good news.\n• 3-9 months: if they want more info, you'll get a Letter 5891 or similar. Respond promptly with the requested documentation.\n• 6-12 months: if they assess the penalty anyway despite the reasonable cause request, you'll get a CP-15. You can then appeal through the IRS Office of Appeals.\n\nKeep the entire DIIRSP package (signed PDF, reasonable cause statement, fax receipt) for at least 6 years. If the IRS contacts you in year 4 about year 2 filing, you'll want the original receipts to prove timely DIIRSP submission.",
      },
      {
        heading: "What you should NOT do under DIIRSP",
        body: "• Do not pay any penalty before you file under DIIRSP — there's nothing to pay until the IRS assesses something.\n\n• Do not split missed years across multiple filings over months. File them all at once.\n\n• Do not submit only Form 5472 without the pro forma 1120 and supporting statement — incomplete filings can be treated as not filed and the DIIRSP request rejected.\n\n• Do not write a reasonable cause statement that admits negligence or implies tax avoidance. Frame the failure as a good-faith unawareness or reliance issue.\n\n• Do not assume amending an existing late return will reset the DIIRSP clock — amendments don't qualify as initial DIIRSP submissions if you previously filed late without one.\n\n• Do not skip the wet/ink signature requirement. Form 5472 and the attached 1120 require pen signatures; digital-only signatures can invalidate the filing.",
      },
      {
        heading: "Catch up with our accountant-reviewed DIIRSP filer",
        body: "Form5472 Prep automatically generates a Reasonable Cause Statement when you select 2 or 3 missed years in our wizard. The narrative is tailored to the most common DIIRSP scenario — first-time foreign LLC owner who was unaware of the Form 5472 obligation — and you can edit it to fit your specific circumstances.\n\nWe prepare the complete package for each year (cover letter, pro forma 1120, Form 5472, Part V supporting statement, reasonable cause statement). You sign once on screen — that signature embeds into every required signature box automatically. An accountant on our team reviews everything end-to-end. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt for each year as proof of DIIRSP submission.\n\n• 2-year DIIRSP catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year DIIRSP catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\n100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "Does DIIRSP guarantee my penalty is waived?",
        a: "No. DIIRSP is the official IRS process for requesting abatement, but each request is evaluated on its facts. Well-written first-time DIIRSP submissions have a high acceptance rate, but there's no formal guarantee.",
      },
      {
        q: "How long after a DIIRSP filing will I hear back?",
        a: "Usually 3-6 months. The IRS will either accept the reasonable cause and close the matter quietly (no news), or send a CP-15 notice with the penalty assessed (which you can then appeal through the IRS Office of Appeals).",
      },
      {
        q: "Can I do DIIRSP myself?",
        a: "Yes. The hardest part is writing a strong Reasonable Cause Statement tied to your specific facts. Our service auto-generates one based on the most common DIIRSP scenario, and you can edit it in the wizard.",
      },
      {
        q: "I missed 5 years — can I still file under DIIRSP?",
        a: "Yes. There's no statutory limit on how many years you can catch up under DIIRSP. Our wizard supports up to 3 years per session; for 4+ missed years run two packages back-to-back or message us and we'll coordinate.",
      },
      {
        q: "I already got a CP-15 notice — is DIIRSP still an option?",
        a: "Not for that specific year — once the IRS has assessed a penalty, you're past the DIIRSP eligibility window for that year. You'd respond to the notice with a penalty abatement request and appeal if denied. For any other unfiled years where you haven't been contacted, DIIRSP is still available.",
      },
      {
        q: "Do I need a lawyer for DIIRSP?",
        a: "Almost never. DIIRSP is a paperwork process: prepare the late returns, write a reasonable cause statement, send it in. A lawyer adds value only if you're facing collection action, criminal exposure, or unusual circumstances. For a standard first-time foreign LLC catch-up, the wizard handles it.",
      },
      {
        q: "What's the difference between DIIRSP and just filing late?",
        a: "Filing late without a reasonable cause statement is a quiet disclosure — the IRS sees the late filing, assesses the $25,000 penalty automatically, and you're stuck responding to the CP-15. DIIRSP is the same filing PLUS a reasonable cause statement requesting abatement upfront. Much better outcomes.",
      },
      {
        q: "Can DIIRSP cover both Form 5472 and other international returns at the same time?",
        a: "Yes. DIIRSP covers all international information returns (5471, 5472, 8865, 8938). If your foreign-owned LLC has additional reporting obligations (rare for single-member disregarded entities), you'd include them in the same package.",
      },
      {
        q: "Does the IRS publish DIIRSP acceptance statistics?",
        a: "No. The IRS does not publish acceptance rates for DIIRSP submissions. From practitioner experience, well-documented first-time foreign-owner catch-ups are accepted at a high rate. Repeat delinquencies or filings with weak reasonable cause are accepted less often.",
      },
      {
        q: "If accepted, do I still need to file in future years?",
        a: "Yes. DIIRSP only addresses past delinquencies. From the year of catch-up onward, you must file Form 5472 + pro forma 1120 every year by April 15. Most of our DIIRSP customers come back annually for their on-time filing.",
      },
    ],
    relatedSlugs: ["form-5472-penalty", "late-form-5472", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "form-5472-instructions",
    keyword: "form 5472 instructions",
    title: "Form 5472 Instructions (2026) — Plain-English Walkthrough",
    metaDescription:
      "Plain-English Form 5472 instructions for foreign-owned US LLCs. Every part explained line-by-line, common mistakes, and how to file safely with the IRS Ogden PIN Unit.",
    h1: "Form 5472 Instructions: Plain-English Walkthrough",
    intro:
      "The official IRS instructions for Form 5472 are 12 pages of dense regulatory language written for tax professionals. This is what each part actually means without the jargon, exactly what to put in each box, the common mistakes that trigger the $25,000 penalty, and how to put together a complete filing that the IRS will accept on the first read.",
    sections: [
      {
        heading: "Before you start — what you need",
        body: "Gather these before you open Form 5472:\n\n• Your LLC's CP-575 EIN confirmation letter from the IRS (gives you the legal name, EIN, and US address exactly as the IRS has them).\n• Your LLC's date of formation and state of formation.\n• A NAICS principal business activity code (look up at naics.com).\n• Total assets at year-end in USD.\n• A list of every reportable transaction during the year — capital contributions in, distributions out, payments to/from you, loans, anything between the LLC and you or any related party.\n• Your foreign tax ID (FTIN) from your country of residence, OR a self-assigned Reference ID if you don't have a FTIN.\n• Your residential address in your home country.\n• Country of citizenship and country of tax residence.\n\nIf you're missing the CP-575, look in your email — the IRS sends a digital copy with the EIN. If you applied via SS-4 fax, the CP-575 was the response document.",
      },
      {
        heading: "Top of the form — header items",
        body: "Above Part I:\n\n• Tax year — the year that ENDED, not the year you're filing in. A 2024 return is for calendar year 2024 even though you file it in 2025.\n• Calendar year box: check this if your LLC uses Jan-Dec (almost all LLCs do).\n• Fiscal year boxes: leave blank unless you have an actual non-calendar fiscal year.\n• Number of Forms 5472 attached to this Form 1120: \"1\" for a typical single-related-party filing.\n• Total value of gross payments made or received: this is the total dollar amount of all transactions reported on Part IV and Part V combined.\n\nStamp \"Foreign-Owned U.S. DE\" across the top of the attached Form 1120 — this is what tells the IRS Ogden PIN Unit how to route the package.",
      },
      {
        heading: "Part I — Reporting Corporation",
        body: "This is your LLC's information. The IRS calls the LLC a \"corporation\" here because for §6038A reporting purposes a foreign-owned DE is treated as a corporation.\n\n• Line 1a: LLC legal name as shown on your CP-575.\n• Line 1b: US address — typically your registered agent's address. The IRS sends correspondence here, so it must be able to receive mail.\n• Line 1c: EIN — your 9-digit IRS-issued number.\n• Line 1d: Total assets at year-end in USD (the ending balance from your books — cash + receivables + inventory + fixed assets).\n• Line 1e: Principal business activity code (NAICS, 6 digits).\n• Line 1f: Total value of gross payments made or received reportable on this form (must equal Part IV + Part V totals).\n• Line 1g: Total number of Forms 5472 filed for the tax year (typically 1).\n• Line 1h: Total reportable transactions reported on this Form 5472 (Part IV + Part V).\n• Lines 1i-1l: Country of incorporation (US), state of incorporation (e.g. WY, DE), principal place of business (typically US), country where books are kept.",
      },
      {
        heading: "Part II — 25% Foreign Shareholder",
        body: "This is YOU — the foreign owner. For a single-member LLC owned by one individual, the foreign shareholder is yourself.\n\n• Line 1a: Your full legal name as on your passport.\n• Line 1b: Your residential address in your home country.\n• Line 1c: US identifying number if you have one (ITIN/SSN). Leave blank if you don't — most foreign owners don't.\n• Line 1d: Reference ID number — required if Line 1c is blank. Self-assigned, must be unique and stable across years. Our wizard auto-generates one if you don't pick your own.\n• Line 1e: Foreign Tax ID Number (FTIN) from your country of residence.\n• Line 1f: Country of citizenship.\n• Line 1g: Country of organization (typically blank for individuals — only filled if the owner is a foreign entity).\n• Line 1h: Country where business conducted (your home country).\n• Line 1i: Principal business activity code of the related party (your personal business activity, if any — often same as the LLC's NAICS).",
      },
      {
        heading: "Part III — Related Party",
        body: "Part III identifies WHO is on the other side of the transactions reported on Parts IV and V. For most single-member LLCs owned by one individual, Part III mirrors Part II — you're both the 25%+ shareholder AND the related party.\n\nFill it identically to Part II. If you have multiple related parties (e.g. you also own a foreign corporation that transacted with the LLC), you'd file a separate Form 5472 for each related party.",
      },
      {
        heading: "Part IV — Monetary Transactions Between Reporting Corporation and Foreign Related Party",
        body: "Dollar amounts of transactions between the LLC and the related party (you), broken into categories:\n\n• Line 1: Sales of stock in trade (inventory).\n• Line 2: Sales of tangible property other than stock.\n• Line 3: Platform contribution / cost sharing transactions (typically blank for small LLCs).\n• Line 4: Rents received.\n• Line 5: Royalties received.\n• Line 6: Interest received.\n• Line 7: Commissions received.\n• Lines 8-9: Other amounts received from the related party.\n• Lines 10-19: Same categories on the \"paid to related party\" side.\n\nFor most foreign-owned single-member LLCs, Part IV is blank or has just one or two lines filled in. Most owner-to-LLC money movement is capital contribution/distribution territory — which belongs on Part V, not Part IV.",
      },
      {
        heading: "Part V — Reportable Transactions of a Reporting Corporation That Is a Foreign-Owned U.S. DE",
        body: "This is THE critical section for foreign-owned single-member LLCs. It's where you report:\n\n• Capital contributions you made to the LLC during the year (money you wired in).\n• Distributions the LLC made to you during the year (money you took out).\n• Other amounts paid or received between you and the LLC that aren't already on Part IV.\n\nFor each transaction:\n\n• Type: Contribution / Distribution / Other.\n• Date: actual date the transaction occurred.\n• Amount: USD value.\n\nAttach a supporting statement listing each transaction. The total of all Part V transactions must equal Line 1h on Part I.\n\nThis is the box where the IRS is mostly looking. If you skip Part V or leave it blank when you had contributions or distributions, the filing is incomplete and triggers the $25,000 penalty.",
      },
      {
        heading: "Part VII — Additional Information for FDE",
        body: "Check the boxes that apply to confirm the LLC's status:\n\n• Foreign-owned domestic disregarded entity (FDE): check yes — this is what triggers the §6038A reporting in the first place.\n• Owner's tax residence country: same as Part II Line 1h.\n• Other boxes about cost-sharing arrangements, base erosion, etc.: typically blank for small foreign-owned single-member LLCs.\n\nThis section is brief for the typical case. If your LLC has anything unusual (cost-sharing with related parties, base erosion considerations, related-party loans above standard limits), get a tax professional involved.",
      },
      {
        heading: "Signing the form",
        body: "Form 5472 itself doesn't have a signature line — the signature lives on the attached pro forma Form 1120. Specifically: the signature block at the bottom of page 1 of the 1120.\n\nRequirements:\n\n• Wet/ink signature — sign in pen on a printed page. Digital-only signatures are not accepted by the IRS for these specific forms.\n• Sign as \"Owner\" or \"Member\" — both are acceptable for a single-member LLC.\n• Date the signature.\n• Print your name below the signature line.\n• Paid preparer block: leave blank if you prepared it yourself. If our service prepared it, we leave it blank too — you are the filer.\n\nOur in-portal signing flow handles this by embedding your once-drawn signature into a printable PDF and producing a signature-applied package. You print, sign in pen if the IRS rejects digital, or our accountant-reviewed digital sign-off is what we fax — both approaches have been accepted.",
      },
      {
        heading: "Common mistakes that trigger penalties",
        body: "• Forgetting to attach pro forma Form 1120 — Form 5472 by itself isn't a valid filing.\n• Forgetting the Part V supporting statement when Part V has entries.\n• Mismatching Line 1f / 1h totals with the Part IV / Part V details.\n• Signing in pencil or with a digital-only signature where wet ink was required.\n• Missing the April 15 deadline without filing Form 7004 for an extension.\n• Filing by email or trying to e-file — neither method is accepted by the IRS for these forms.\n• Sending to the wrong fax number — only +1-855-887-7737 (IRS Ogden PIN Unit) is correct.\n• Using a US address on Part I that can't receive mail (some virtual mailboxes return-to-sender IRS letters).\n• Filing in the wrong tax year (the form is for the tax year that ENDED, not the year you're sending it in).\n• Reporting amounts in your home currency instead of USD using a documented exchange rate.\n\nAny one of these can invalidate the filing and trigger the $25,000 penalty under IRC § 6038A.",
      },
    ],
    faqs: [
      {
        q: "Do I need a US address to file Form 5472?",
        a: "Your LLC needs a US address (your registered agent's address works fine). Your personal address goes in Part II as your foreign residential address. The US address on Part I is where the IRS will mail any notices, so make sure it can actually receive mail.",
      },
      {
        q: "What's an FTIN if my country doesn't issue tax IDs?",
        a: "Write 'NOT LEGALLY REQUIRED' in the FTIN box. The IRS accepts this for residents of countries without tax ID systems (some Gulf states, BVI, Cayman, etc.). You'd then provide a Reference ID instead.",
      },
      {
        q: "Do I need to attach financial statements?",
        a: "No. Only the Part V supporting statement listing each reportable transaction is required. The IRS doesn't ask for a balance sheet, P&L, or bank statements with Form 5472.",
      },
      {
        q: "What if I made a mistake on a prior year's Form 5472?",
        a: "File an amended return for that year. Check the \"Amended return\" box at the top of Form 5472, redo the parts that changed, and attach a brief explanation. Amended returns don't automatically waive any penalty already assessed, but they correct the underlying filing.",
      },
      {
        q: "What NAICS code should I use?",
        a: "The code that best matches your LLC's primary business activity. Common ones: 454110 (e-commerce / online retail), 541510 (computer systems design / SaaS), 541613 (marketing consulting), 423990 (other wholesale). Look up specifics at naics.com.",
      },
      {
        q: "Can I use my own signature instead of printing and signing?",
        a: "Per current IRS practice, Form 5472 + attached pro forma 1120 require pen/ink signatures. In-portal canvas signatures embedded in a printable PDF have been accepted in practice; an absolutely wet-ink signature is the safest path. Our flow embeds your once-drawn signature in a printable PDF — most customers also print and sign in pen on top of it before faxing.",
      },
      {
        q: "How do I report a loan from me to the LLC?",
        a: "Capital contributions and loans look similar on Form 5472. If you formally documented the transaction as a loan with repayment terms, report it on Part IV (interest received line) plus describe the loan principal. If undocumented or informal, report as a Part V capital contribution.",
      },
      {
        q: "What if I'm not sure which transactions are reportable?",
        a: "Reportable is broad — capital in, distributions out, any payment between you and the LLC, any loan, any related-party transaction. Err on the side of including. Reporting an extra transaction has no penalty; missing one can.",
      },
      {
        q: "Do I report transactions in USD or my home currency?",
        a: "USD only. Convert each transaction at the prevailing exchange rate on the date of the transaction. For simplicity, many filers use the annual average rate published by the IRS for the tax year — also acceptable.",
      },
      {
        q: "Where can I get help filling in the form?",
        a: "Use our wizard — it asks 12 simple questions and generates the complete package (cover letter, pro forma 1120, Form 5472, Part V supporting statement). Every filing is reviewed by an accountant on our team before we fax it to the IRS Ogden PIN Unit. From $199 (IRS fax delivery included).",
      },
    ],
    relatedSlugs: ["file-form-5472", "pro-forma-1120", "form-5472-vs-1120", "irs-form-5472", "form-5472-fax-number"],
  },
  {
    slug: "foreign-owned-llc-tax",
    keyword: "foreign owned LLC tax filing",
    title: "Foreign-Owned US LLC Tax Filing Requirements (2026 Guide)",
    metaDescription:
      "Complete guide to tax filing requirements for foreign-owned US single-member LLCs: Form 5472, pro forma 1120, FBAR, ITIN, state filings, sales tax, and the $25,000 penalty.",
    h1: "Foreign-Owned US LLC Tax Filing Requirements",
    intro:
      "If you are a non-US person who owns a US single-member LLC, you have specific federal tax filing obligations even if your LLC made zero revenue and owes zero US tax. The main universal requirement is Form 5472 with an attached pro forma Form 1120, due April 15. Beyond that, your state filings, ITIN need, FBAR/FATCA exposure, and sales tax obligations depend on your specific facts. This is the complete map.",
    sections: [
      {
        heading: "The universal federal filing — Form 5472 + pro forma 1120",
        body: "Every foreign-owned US single-member LLC must file Form 5472 with an attached pro forma Form 1120, every tax year. Due April 15 (October 15 with Form 7004 extension). $25,000 penalty per form per year if missed.\n\nThis filing is informational only — it discloses the related-party transactions between you and the LLC. It does not calculate any tax. For most foreign-owned LLCs, the actual US federal tax owed is $0.\n\nThis is not optional and there's no income threshold below which you skip it. A foreign-owned LLC with $0 revenue and one $100 capital contribution still files Form 5472 every year.",
      },
      {
        heading: "Do you owe US federal income tax?",
        body: "Most foreign-owned single-member LLCs owe $0 in US federal income tax. The default rule: a foreign person is taxed in the US only on US-source income that is effectively connected with a US trade or business (ECI) — or on fixed/determinable annual or periodic US-source income (FDAP) subject to withholding.\n\nWhat doesn't trigger US tax:\n• Selling SaaS, info products, or services from overseas to customers anywhere.\n• Dropshipping or wholesale where you don't have inventory in the US.\n• Consulting performed outside the US.\n• Capital gains from non-US assets held by the LLC.\n\nWhat does trigger US tax:\n• Having a fixed place of business in the US (office, employees, warehouse).\n• Dependent agents acting on your behalf in the US.\n• US-source dividends, interest, royalties (subject to FDAP withholding).\n• Real estate income from US property (always taxable to non-US owners).\n\nIf your facts match the first list, your LLC owes no US income tax and you file only Form 5472 + pro forma 1120. If they match the second, you have additional filing obligations and should consult a CPA — our service handles the universal case, not the complex ones.",
      },
      {
        heading: "State tax filings by formation state",
        body: "State requirements depend on where you formed your LLC, not where you live. Most-popular states for foreign LLC owners:\n\n• Wyoming: no state income tax, no franchise tax. Annual report due in the LLC's formation anniversary month, $60.\n• Delaware: no state income tax for LLCs without DE operations. Annual franchise tax $300, due June 1.\n• New Mexico: no state income tax. Annual report required but no fee.\n• Florida: no state income tax. Annual report due May 1, $138.75.\n• Nevada: no state income tax. State business license $200 + annual list $150 = ~$350/year.\n• Texas: no state income tax. Franchise tax due May 15, $0 for most small LLCs but the report is still required.\n\nIf you formed in California, New York, or another income-tax state, you have additional state-level income tax filings even if you live abroad. These states tax LLCs on their entity-level activity, not just on owner residency.\n\nWe handle the federal Form 5472 + 1120 only. State filings you do directly with the state — it's typically a 10-minute form on the state's website.",
      },
      {
        heading: "FBAR (FinCEN Form 114) and FATCA (Form 8938)",
        body: "FBAR (Report of Foreign Bank and Financial Accounts) is filed by US persons (US citizens, green-card holders, US tax residents) who have signing authority over foreign financial accounts totaling $10,000+ during the year.\n\nForeign owners of US LLCs are generally NOT US persons and don't file FBAR personally. Whether the LLC itself files FBAR depends on whether the LLC has foreign accounts (rare for most US-formed LLCs).\n\nFATCA Form 8938 (Statement of Specified Foreign Financial Assets) similarly applies to US persons — not foreign owners.\n\nThe rare case where you might need these: if your foreign-owned US LLC opens financial accounts outside the US (e.g. a Wise or Revolut business account based in EU). The LLC is treated as a US person for some federal tax purposes, which can trigger LLC-level FBAR filing. For most foreign-owned US LLCs banking with Mercury, Wise USD, or other US-based options, no FBAR is required.\n\nThis is one area to double-check with a tax professional if your LLC has any non-US bank accounts.",
      },
      {
        heading: "Do you need a US ITIN?",
        body: "Most foreign-owned LLC owners do NOT need an ITIN.\n\nWhen you DON'T need one:\n• You only file Form 5472 + pro forma 1120 (your foreign tax ID / FTIN or a self-assigned Reference ID works in lieu of ITIN).\n• Your LLC owes no US federal income tax.\n• You don't personally file Form 1040-NR.\n\nWhen you DO need one:\n• You have US-source income requiring a personal Form 1040-NR filing.\n• You're claiming a tax treaty benefit (Form W-8BEN with treaty rate).\n• You're the responsible party for a US LLC and want to apply for an EIN online via the IRS portal (online EIN application requires a US tax ID; otherwise apply by fax SS-4 without an ITIN).\n\nGetting an ITIN takes 8-16 weeks and requires a certified copy of your passport submitted with Form W-7. Most foreign LLC owners skip this entirely and use FTIN or Reference ID on Form 5472.",
      },
      {
        heading: "Sales tax",
        body: "If your LLC sells physical goods or certain digital products to US customers, you may have state sales tax obligations after crossing economic nexus thresholds.\n\nTypical thresholds (vary by state):\n• $100,000 in gross sales to that state per year, OR\n• 200 separate transactions to that state per year.\n\nOnce you cross the threshold in a state, you must register, collect, and remit sales tax for that state — even from abroad.\n\nServices and many digital products (SaaS, info products) are exempt in most states, though a growing number now tax SaaS. Physical goods (dropshipping, Amazon FBA, custom merchandise) are generally taxable.\n\nThis is a separate compliance area from Form 5472. We don't handle sales tax — services like TaxJar, Avalara, or Stripe Tax automate the registrations and filings.",
      },
      {
        heading: "BOI (Beneficial Ownership Information) — FinCEN",
        body: "Under the Corporate Transparency Act, most US LLCs (including foreign-owned ones) must file a Beneficial Ownership Information report with FinCEN within 30 days of formation. This is separate from any tax filing.\n\nUpdate filings are required when ownership or company information changes.\n\nNote: BOI enforcement has been the subject of ongoing litigation and policy shifts. Check current FinCEN guidance before filing — the obligation has been on, off, and conditionally on at various points. As of 2026 most foreign-owned domestic LLCs are still required to file the BOI report.\n\nWe don't handle BOI — file it directly at fincen.gov. It's free and takes about 15 minutes.",
      },
      {
        heading: "What our service covers vs. what we don't",
        body: "We handle:\n\n• Federal Form 5472 + pro forma Form 1120 (annual filing).\n• Multi-year DIIRSP catch-up (2 or 3 years).\n• Reasonable Cause Statement for late filings.\n• IRS Ogden PIN Unit fax delivery + timestamped receipt.\n• Accountant review before submission.\n• 100% money-back guarantee if we fail to submit.\n\nWe don't handle:\n\n• State income tax filings (if your formation state has them).\n• State franchise tax / annual reports (handled directly with the state).\n• Personal Form 1040-NR (if you have US-source income requiring it).\n• ITIN applications.\n• FBAR / FATCA.\n• Sales tax registrations / filings.\n• BOI reports with FinCEN.\n• Bookkeeping / accounting.\n\nFor the standard foreign-owned single-member LLC profile (Wyoming or Delaware LLC, owner abroad, ecommerce or SaaS or consulting income, customers worldwide), our service covers the federal piece that triggers the largest penalty risk. The other items are typically self-serve.",
      },
      {
        heading: "Common compliance profile by business type",
        body: "Ecommerce / dropshipping (Shopify, WooCommerce):\n• Form 5472 + pro forma 1120 (us)\n• State annual report (formation state, self-serve)\n• Sales tax in nexus states (TaxJar / Stripe Tax)\n• BOI report (FinCEN, self-serve)\n\nSaaS / digital product:\n• Form 5472 + pro forma 1120 (us)\n• State annual report (formation state, self-serve)\n• Sales tax only in SaaS-taxing states if nexus crossed\n• BOI report (FinCEN, self-serve)\n\nConsulting / agency:\n• Form 5472 + pro forma 1120 (us)\n• State annual report (formation state, self-serve)\n• Likely no sales tax\n• BOI report (FinCEN, self-serve)\n• Possible 1040-NR if any US-source consulting work\n\nReal estate / US property holding:\n• Form 5472 + pro forma 1120 (us, but this is the easy case — talk to a CPA)\n• Form 1040-NR personally (CPA)\n• State income tax in the property's state (CPA)\n• Form 8288 withholding on sale (CPA)",
      },
      {
        heading: "File the federal piece in 15 minutes",
        body: "Federal Form 5472 + pro forma 1120 is the universal filing every foreign-owned US LLC owes and the one with the biggest penalty for missing it ($25,000 per form per year). Our wizard handles the entire package in 15 minutes:\n\n• Standard: $199 (fax included)\n• Rush: $279 (fax included)\n• Premium: $449 (fax included)\n• +$149 per additional past year\n\nEvery package is reviewed by an accountant on our team before we fax it to the IRS Ogden PIN Unit. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "My LLC made zero revenue. Do I still file?",
        a: "Yes. Form 5472 is required even with zero revenue, as long as you had any reportable transaction — including the initial capital you put in to fund the bank account or pay formation fees.",
      },
      {
        q: "Do I owe US income tax on my LLC's profits?",
        a: "Generally no, if your LLC has no US trade or business and no US-source income. Profits flow through to you as the owner, taxable in your country of residence. Form 5472 is still mandatory regardless.",
      },
      {
        q: "What if I have employees in the US?",
        a: "Then you have significantly more requirements: payroll taxes (Form 941), worker's comp insurance, unemployment insurance, and likely state tax filings. Talk to a US payroll service (Gusto, OnPay) and a CPA. This is well beyond Form 5472 territory.",
      },
      {
        q: "I sell on Amazon FBA in the US. What changes?",
        a: "FBA inventory stored in US warehouses can create a US trade or business, potentially triggering ECI (effectively connected income) and US tax liability. Plus you have sales tax obligations in every state where FBA stores your inventory. Consult a CPA familiar with foreign sellers — Form 5472 is necessary but not sufficient in your case.",
      },
      {
        q: "Do I need a US bank account to file?",
        a: "No. Most foreign-owned LLCs use Mercury, Wise, Relay, or Brex for banking. Form 5472 doesn't ask which bank you use — just the total assets and the transactions between you and the LLC.",
      },
      {
        q: "I formed my LLC mid-year. Do I file for that year?",
        a: "Yes. Your first year's Form 5472 covers the partial year from formation date to December 31. The deadline is still April 15 of the following year.",
      },
      {
        q: "Can I file Form 5472 retroactively if I never filed before?",
        a: "Yes — under DIIRSP. You file all missed years together with a reasonable cause statement requesting penalty abatement. Our 2-year and 3-year catch-up packages handle this.",
      },
      {
        q: "What if I dissolved my LLC mid-year?",
        a: "You still file Form 5472 for the partial year ending at dissolution. The deadline is the 15th day of the 4th month after the LLC's final month — same logic as the annual deadline applied to a short tax year.",
      },
      {
        q: "Do I need to file in the state where I live?",
        a: "Your home country's tax rules apply to YOU as the owner — most countries tax their residents on worldwide income, which includes profits from your US LLC. The US filings (Form 5472 + 1120) are separate and required by the IRS regardless of where you live.",
      },
      {
        q: "Does your service handle multi-member LLCs?",
        a: "No. Our service is built specifically for single-member, foreign-owned, disregarded-entity LLCs. Multi-member LLCs require Form 1065 (partnership return), 8865 (foreign partnership) or full Form 1120 with real income reporting — more complex than our wizard supports. You'd need a CPA familiar with international partnerships.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "delaware-llc-form-5472", "file-form-5472", "single-member-llc-foreign-owner", "stripe-atlas-form-5472"],
  },
  {
    slug: "late-form-5472",
    keyword: "late form 5472",
    title: "Late Form 5472 — How to File Late and Avoid the Penalty",
    metaDescription:
      "Filed Form 5472 late or never at all? Catch up under DIIRSP with a Reasonable Cause Statement and request abatement of the $25,000 penalty. Accountant-reviewed filings from $199.",
    h1: "Filed Form 5472 Late? Here's What to Do Now",
    intro:
      "If you missed the April 15 deadline for Form 5472, file as soon as possible. The IRS Delinquent International Information Return Submission Procedure (DIIRSP) lets you submit late filings with a Reasonable Cause Statement requesting that the $25,000 penalty be waived. The longer you wait, the higher the risk of an automatic CP-15 penalty notice — and once that notice arrives, your options narrow sharply. This is the complete playbook for getting back into compliance from one missed year to many.",
    sections: [
      {
        heading: "How late can you actually be?",
        body: "Technically there is no statute of limitations on filing Form 5472 itself — you can file for tax years going back to when your LLC was formed.\n\nPractically, the longer you wait, the worse the risk profile:\n\n• Within a few months of the deadline: very low risk. File under DIIRSP with reasonable cause and most filings are accepted with no penalty.\n• 1-2 years late: still very workable. DIIRSP path with reasonable cause is the standard approach, high acceptance rate for first-time delinquencies.\n• 3+ years late: still file (DIIRSP for the most recent 3 years; older years may need a different path), but the IRS may have already issued a notice you didn't see.\n• Already received a CP-15 notice: DIIRSP is no longer the right path for that year — you respond to the notice with an abatement request and appeal if denied.",
      },
      {
        heading: "What happens if you do nothing",
        body: "Within 6-18 months of the missed deadline, the IRS automated system issues a CP-15 notice to the LLC's US address of record, assessing the $25,000 penalty. Once that notice arrives, your options narrow:\n\n• Pay the $25,000 (worst outcome for most owners).\n• File a Form 843 abatement claim — much harder than DIIRSP and lower success rate because the IRS already evaluated.\n• Appeal through the IRS Office of Appeals (months of process).\n• Ignore the notice — the worst path. Continuation penalties accrue at $25,000 per 30-day period after the 90-day grace window. Collection action can begin against the LLC's US-banked funds.\n\nIf the LLC's US address can't receive mail (e.g. a virtual mailbox that bounces IRS mail), you might not even see the CP-15 — but the penalty is still assessed and accruing.",
      },
      {
        heading: "What to do right now (one missed year)",
        body: "1. Don't panic. The IRS has not yet assessed the penalty if you haven't received a CP-15 notice.\n2. Prepare the late return immediately. You need: cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, AND a Reasonable Cause Statement at the front.\n3. Write the Reasonable Cause Statement (or use our service to generate one tailored to the most common first-time-foreign-owner scenario).\n4. File via DIIRSP — fax to +1-855-887-7737 (IRS Ogden PIN Unit), or mail certified to IRS Ogden, UT 84201-0023.\n5. Keep the fax transmission receipt as your timestamped proof of DIIRSP filing.\n6. Set up an annual reminder so you file on time going forward (or sign up for an annual filing service).",
      },
      {
        heading: "What to do if you've missed multiple years",
        body: "File ALL missed years in one DIIRSP package. Don't space them out. The IRS treats a comprehensive catch-up filing more favorably than serial late filings — one consistent reasonable cause narrative covering the whole period is stronger than separate filings each blaming the same circumstances.\n\nOur multi-year DIIRSP packages:\n\n• 2-year catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\nThe wizard generates one cover letter, one Reasonable Cause Statement (covering all years), and a separate fully-completed Form 5472 + pro forma 1120 for each year. Everything assembled into one package, faxed once, with one timestamped receipt per year.\n\nFor 4+ missed years, run two back-to-back packages or message us and we'll coordinate.",
      },
      {
        heading: "What goes in the Reasonable Cause Statement",
        body: "The IRS looks for evidence you acted with \"ordinary business care and prudence.\" Strong statements include:\n\n• A clear timeline of when and how you became aware of the Form 5472 obligation.\n• Specific personal circumstances — first-time foreign owner, reliance on a tax pro who didn't flag the obligation, language barrier, LLC was set up by an accelerator/Stripe Atlas package that didn't include annual compliance.\n• Evidence of prompt corrective action upon learning of the failure.\n• Explicit statement that no US tax is owed (this is true for almost all foreign-owned single-member LLCs).\n• Confirmation that you've taken steps to ensure future compliance — annual reminder, calendar entry, filing service subscription.\n• Concise — 1-2 pages.\n\nAvoid vague excuses, contradictions with the form data, or aggressive language. Our auto-generated statement is tailored to the most common scenario and editable in the wizard if your facts are different.",
      },
      {
        heading: "What if you've already received a CP-15 notice",
        body: "DIIRSP is no longer the right path for that specific year — once the IRS has formally assessed a penalty, you're in the post-assessment abatement process. Steps:\n\n1. Respond within 30 days of the notice (the notice will state the deadline).\n2. File the late Form 5472 + pro forma 1120 separately if not already done.\n3. Submit Form 843 (Claim for Refund and Request for Abatement) with a strong reasonable cause explanation tied to your specific facts.\n4. If Form 843 is denied, appeal to the IRS Office of Appeals.\n5. Consider engaging a tax attorney or enrolled agent — post-assessment appeals are more complex than DIIRSP and a professional adds value.\n\nWe don't currently handle CP-15 abatement appeals — only preventative DIIRSP filings. If you have a CP-15 notice already, talk to a US tax professional who handles international information return penalties.\n\nFor any other unfiled years where you haven't been contacted yet, DIIRSP is still available — file those concurrently while you handle the CP-15 for the assessed year.",
      },
      {
        heading: "How long until you hear back",
        body: "After a DIIRSP filing, typical timeline:\n\n• Day 0-2: Fax delivered. No IRS acknowledgment yet — that's normal.\n• Week 4-8: Internal processing at IRS Ogden Service Center.\n• Month 3-6: IRS reviews the reasonable cause request. Most cases: no news = acceptance.\n• Month 4-9: If they want more info, you'll get a Letter 5891 or similar — respond promptly.\n• Month 6-12: If they assess the penalty anyway, you'll get a CP-15. You can appeal.\n\nKeep the entire filing package (signed PDF, reasonable cause statement, fax receipt) for at least 6 years. If the IRS contacts you 18 months later about year 2, you'll want the original receipts to prove timely DIIRSP submission.",
      },
      {
        heading: "Real-world late-filing scenarios",
        body: "Scenario A — just-missed: Carlos formed his Wyoming LLC in 2023, learned about Form 5472 in May 2025 (one month after the 2024 return was due). Files DIIRSP for tax year 2024 immediately. Typical outcome: no penalty assessed.\n\nScenario B — three-year catch-up: Mei has had a Delaware LLC since 2022, never filed. Discovers obligation in 2026. Files 2022, 2023, 2024, and 2025 together in one DIIRSP package. (Our wizard supports 3 years, so 2022 would run as a separate filing.) Typical outcome: penalty abatement granted across all years.\n\nScenario C — ignored a CP-15: Ahmed received a CP-15 in July 2024 for tax year 2022. By 2026, continuation penalties have stacked to $100,000+. Needs both to file the actual return AND to engage a tax professional to handle the assessed penalty appeal. Much more expensive and stressful than scenarios A and B.\n\nThe takeaway: act fast. Even multi-year catch-up is vastly cheaper than waiting for an IRS notice and then delaying.",
      },
      {
        heading: "Will the IRS just not notice?",
        body: "No. The IRS has known about foreign-owned single-member LLCs as a focus area since 2017, when the §6038A reporting rule was extended to them. Since 2018, penalty assessment for missed Form 5472 has been automated.\n\nHow the IRS finds you:\n\n• EIN database cross-reference — every EIN issued to a foreign-owned entity is flagged for expected annual returns.\n• Stripe Atlas / Mercury / formation services occasionally share aggregate data with the IRS for compliance purposes.\n• Bank account openings (foreign-owned US LLC accounts trigger reporting under various AML / KYC frameworks).\n• Customer 1099-K reports — if your LLC received payment processing volume from US-based processors (Stripe, PayPal, Square), the IRS sees the LLC's EIN reported on those forms.\n\nThe IRS doesn't usually catch every non-filer in year 1, but the longer you wait the more likely they catch up. CP-15 notices are routine for foreign-owned LLCs that miss Form 5472. Don't bet on silence.",
      },
      {
        heading: "Get caught up in 15 minutes",
        body: "Our DIIRSP-aware filer handles the entire late-filing package. The wizard asks 12 questions about your LLC, owner, and year-end totals for each missed year. We generate everything — cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, AND the Reasonable Cause Statement.\n\nYou sign once on screen. An accountant on our team reviews the package. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt for each year as proof of DIIRSP submission.\n\n• 1 year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 years (DIIRSP): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 years (DIIRSP): Standard $497 · Rush $577 · Premium $747 (fax included)\n\n100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
    ],
    faqs: [
      {
        q: "How late can I be before DIIRSP no longer works?",
        a: "There's no hard deadline — DIIRSP is available until the IRS contacts you about the specific delinquency. Once a CP-15 arrives for a tax year, you must use a different abatement appeal process for THAT year. DIIRSP remains available for any other unfiled years where you haven't been contacted.",
      },
      {
        q: "Is there a chance the IRS just won't notice?",
        a: "Unlikely. The IRS automated system cross-references EIN holders, foreign-owned DEs have been a focus area since 2017, and CP-15 notices for missed Form 5472 are routine. The longer you wait the more likely the catch-up turns into a defensive penalty appeal.",
      },
      {
        q: "Can I file under DIIRSP myself?",
        a: "Yes. The procedure is publicly documented. The hardest part is writing a strong Reasonable Cause Statement tied to your specific circumstances. Our service auto-generates one based on the most common scenario, and you can edit it.",
      },
      {
        q: "Will I owe back taxes too?",
        a: "Almost certainly not. Form 5472 is an informational filing — no tax liability is calculated on it. For most foreign-owned single-member LLCs, US federal income tax is $0 regardless of how late you file. DIIRSP is specifically for information-return delinquencies where no tax is owed.",
      },
      {
        q: "What if I only have records for some of the missed years?",
        a: "File for the years you have records. Reconstruct what you can — bank statements, Stripe / PayPal reports, contracts — for any year where records are incomplete. Then submit best-available data with a note in the reasonable cause statement explaining the partial records.",
      },
      {
        q: "How do I know the fax actually delivered to the IRS?",
        a: "Your fax service generates a transmission receipt with delivery confirmation and timestamp. That receipt is your legal proof of timely DIIRSP filing. If you use our service, we email you the receipt as a PDF, and a copy stays in your portal.",
      },
      {
        q: "Can I file under DIIRSP for years where the LLC was inactive?",
        a: "If the LLC had at least one reportable transaction during the year (even a single capital contribution), yes — file under DIIRSP. If truly inactive (no bank account, no money in or out, no contracts), you may not have had a reportable transaction at all and no filing was required. The bar is low — most owners file regardless.",
      },
      {
        q: "What if I get a CP-15 between filing under DIIRSP and the IRS responding?",
        a: "Unusual but it can happen if there's a processing delay. Respond to the CP-15 by referencing your DIIRSP submission (including the fax receipt date) and request the penalty be removed since you filed voluntarily under the procedure before the notice issued.",
      },
      {
        q: "Should I file under DIIRSP if I'm planning to dissolve the LLC?",
        a: "Yes. Dissolution doesn't erase past filing obligations. The IRS can still assess penalties for missed years after the LLC is dissolved — and it's much harder to defend a non-filing once the entity no longer exists. Catch up first, then dissolve.",
      },
      {
        q: "Does your service handle CP-15 abatement appeals?",
        a: "Not currently. We handle preventative DIIRSP filings only. If you've already received a CP-15, contact a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
    ],
    relatedSlugs: ["diirsp", "form-5472-penalty", "file-form-5472", "form-5472-reasonable-cause-statement", "form-5472-deadline"],
  },
  {
    slug: "form-5472-vs-1120",
    keyword: "form 5472 vs 1120",
    title: "Form 5472 vs Form 1120 — What's the Difference?",
    metaDescription:
      "Form 5472 reports related-party transactions. Form 1120 is the US corporate income tax return. For foreign-owned US LLCs, you file both together as one package — here's how.",
    h1: "Form 5472 vs Form 1120 — What's the Difference?",
    intro:
      "Form 5472 and Form 1120 are two separate IRS forms that foreign-owned US LLCs must file together as one package. Form 1120 is the US corporate income tax return. Form 5472 is an information return about related-party transactions. For most foreign-owned single-member LLCs, the 1120 is filed \"pro forma\" — meaning most boxes are blank. Here's exactly what each form is, why you need both, and how the IRS expects them combined.",
    sections: [
      {
        heading: "What is Form 1120?",
        body: "Form 1120 (U.S. Corporation Income Tax Return) is the standard tax return that domestic corporations use to report income, deductions, and calculate corporate income tax. For a real C-corporation operating in the US, it's a substantive 6-page tax calculation: revenue, cost of goods sold, deductions, taxable income, tax owed.\n\nFor a foreign-owned US single-member LLC, your LLC is treated as a disregarded entity for tax purposes — meaning the LLC itself doesn't pay corporate income tax. Profits flow through to you, the owner, taxable in your home country.\n\nBut the IRS still wants the 1120 as the procedural \"envelope\" for Form 5472. So you file the form \"pro forma\" with only the identification fields completed and \"Foreign-Owned U.S. DE\" written across the top. Income, deductions, tax calculation — all blank.",
      },
      {
        heading: "What is Form 5472?",
        body: "Form 5472 (Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business) is an information return — meaning it reports transactions but does NOT calculate any tax. It's specifically designed for cases where a foreign person owns 25% or more of a US corporation or disregarded entity.\n\nSince 2017, the IRS extended this requirement to single-member LLCs owned by non-US persons. Even though those LLCs are normally disregarded for US tax purposes, they are treated as corporations for §6038A reporting.\n\nForm 5472 reports related-party transactions: capital you contributed to the LLC, distributions you took out, payments to or from related parties, loans, rents, royalties — anything that moved value between the LLC and you (or any entity you also control).",
      },
      {
        heading: "Why both forms?",
        body: "Form 5472 by itself is not a valid IRS submission. The IRS requires it to be attached to a tax return. For foreign-owned disregarded entities, the IRS chose Form 1120 as the attachment vehicle — even though the LLC doesn't owe corporate income tax.\n\nThink of it like an envelope: the 1120 is the envelope, the 5472 is the letter inside. The IRS Ogden PIN Unit won't process the letter without the envelope.\n\nThis pairing exists because the IRS infrastructure for international information return processing is built around corporate-return filing channels. There's no standalone process for filing Form 5472 outside of a 1120.",
      },
      {
        heading: "Side-by-side comparison",
        body: "Form 1120 (pro forma version for foreign-owned DEs):\n• Purpose: corporate income tax return — used as procedural envelope here.\n• Pages: 6 standard, but most are blank for foreign-owned DEs.\n• What you fill in: entity name, EIN, US address, country/state of incorporation, total assets at year-end, signature.\n• What's blank: income, deductions, COGS, tax calculation.\n• Special: \"Foreign-Owned U.S. DE\" stamped across the top of page 1.\n• Tax owed: $0 (because the LLC is disregarded).\n\nForm 5472:\n• Purpose: information return reporting related-party transactions.\n• Pages: 2 substantive pages.\n• What you fill in: Part I (reporting corporation = your LLC), Part II (25% foreign shareholder = you), Part III (related party = you again for single-member), Part IV (monetary transactions, usually blank), Part V (reportable transactions — capital in, distributions out), Part VII (FDE confirmation).\n• Required attachments: Part V supporting statement listing each transaction.\n• Tax owed: $0 (informational only).\n\nFiled together as one package, faxed to +1-855-887-7737.",
      },
      {
        heading: "What's NOT involved",
        body: "These forms come up in foreign-owner Google searches but are NOT what you file for a single-member, foreign-owned, disregarded LLC:\n\n• Form 1120-S — for S-corporations. LLCs can elect S-corp status but foreign persons cannot own S-corp stock, so this is not relevant.\n• Form 1120-F — for foreign corporations engaged in US trade or business. Your LLC is a US entity, not a foreign one, so 1120-F doesn't apply (unless your LLC is itself owned by a foreign corporation that needs to file).\n• Form 1065 — partnership return. Only applies if your LLC has 2+ members.\n• Form 1040-NR — personal return for non-resident individuals with US-source income. Only required if YOU personally have US-source income.\n• Form 8865 — for foreign partnerships. Not applicable to single-member LLCs.\n\nThe correct combo for the standard foreign-owned single-member LLC: pro forma Form 1120 + Form 5472 + Part V supporting statement + (if late) Reasonable Cause Statement.",
      },
      {
        heading: "Does this trigger US corporate income tax?",
        body: "No. Filing pro forma Form 1120 does NOT make your LLC subject to US corporate income tax.\n\nYour LLC remains a disregarded entity for tax purposes. The 1120 is purely the procedural vehicle for filing Form 5472 — not a real income tax return for your LLC.\n\nTax on LLC profits (if any) flows through to you personally:\n• If your LLC has no US-source income that's effectively connected with a US trade or business: $0 US tax. Income is taxable in your home country only.\n• If your LLC has US-source effectively connected income: you'd file Form 1040-NR personally, separate from the pro forma 1120.\n\nMost foreign-owned single-member LLCs (ecommerce, SaaS, consulting, dropshipping with non-US customers) are in the first bucket. They file pro forma 1120 + Form 5472 as informational and owe no US tax.",
      },
      {
        heading: "Common confusions",
        body: "\"If I file Form 1120, am I now treated as a corporation?\" — No. The 1120 you file is \"pro forma\" — explicitly marked as Foreign-Owned U.S. DE. The IRS recognizes it as a procedural vehicle for Form 5472, not as a real corporate tax return. Your LLC stays a disregarded entity.\n\n\"My CPA said I need a full 1120, not pro forma.\" — Get a second opinion. Most US CPAs see this filing once or twice in their career. A full 1120 (with income, deductions, tax calculation) would actually be wrong for a disregarded entity.\n\n\"I only filled out Form 5472, not the 1120 — should be fine?\" — No. The IRS will reject the standalone 5472 (or treat it as not filed and assess the $25,000 penalty). The pro forma 1120 envelope is mandatory.\n\n\"I forgot to write 'Foreign-Owned U.S. DE' on the 1120 — is that fatal?\" — Not fatal, but it can cause processing delays and routing errors at Ogden. The stamp tells the Ogden PIN Unit how to process the return. Always include it.",
      },
      {
        heading: "How they're filed together",
        body: "Physical / faxed order of the package:\n\n1. Cover letter (1 page)\n2. Pro forma Form 1120 (1-2 pages, stamped \"Foreign-Owned U.S. DE\")\n3. Form 5472 (2 pages)\n4. Part V supporting statement (1+ pages depending on transaction count)\n5. Reasonable Cause Statement (1-2 pages, only if filing late under DIIRSP)\n\nTotal package: typically 5-8 pages.\n\nFax destination: +1-855-887-7737 (IRS Ogden PIN Unit).\nOr mail: Internal Revenue Service, Ogden, UT 84201-0023.\n\nThe whole package is one filing. You fax it together, you get one transmission receipt covering the entire package as proof of timely filing.",
      },
      {
        heading: "What our service generates",
        body: "When you complete our wizard, we generate the complete package automatically:\n\n• Cover letter introducing the filing.\n• Pro forma Form 1120 with the \"Foreign-Owned U.S. DE\" stamp and your entity info.\n• Form 5472 fully filled in (Parts I, II, III, IV, V, VII as needed).\n• Part V supporting statement listing each reportable transaction.\n• Reasonable Cause Statement (only if the filing is late).\n\nYou sign once on screen. An accountant on our team reviews it. We fax to the IRS Ogden PIN Unit and email you the timestamped receipt as proof of filing.",
      },
      {
        heading: "Pricing",
        body: "Both forms together (cover letter, pro forma 1120, Form 5472, Part V supporting statement) for one year:\n\n• 1 tax year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 tax years (DIIRSP catch-up): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 tax years (DIIRSP catch-up): Standard $497 · Rush $577 · Premium $747 (fax included)\n\n100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
    ],
    faqs: [
      {
        q: "If I don't owe corporate tax, why file Form 1120?",
        a: "Because Form 5472 by itself isn't a valid IRS submission. The IRS requires it to be attached to Form 1120 as a procedural envelope. The 1120 is pro forma — marked as Foreign-Owned U.S. DE with no income or tax filled in.",
      },
      {
        q: "Is Form 1120 the same as Form 1120-S?",
        a: "No. Form 1120-S is for S-corporations. You file pro forma 1120 (not 1120-S) for a foreign-owned disregarded LLC. Foreign persons cannot own S-corp stock, so 1120-S is never the right form here.",
      },
      {
        q: "Do I file Form 1040 too?",
        a: "Only if you personally have US-source income requiring you to file 1040-NR. Most foreign LLC owners with no US trade or business don't need 1040-NR.",
      },
      {
        q: "Do I file two separate envelopes — one for each form?",
        a: "No. Form 5472 is filed AS AN ATTACHMENT to the pro forma Form 1120. One package, one fax, one transmission receipt. The 1120 is the cover, the 5472 sits behind it.",
      },
      {
        q: "What if my LLC actually does owe corporate tax?",
        a: "Then it's no longer pro forma — you'd file a full Form 1120 with income, deductions, and tax calculation. This typically happens if your LLC has US-source effectively connected income (US warehouse, US employees, US fixed place of business). Our service is for the standard disregarded-entity case; if you owe corporate tax you need a CPA, not us.",
      },
      {
        q: "Does Form 5472 ask for income data?",
        a: "Form 5472 reports transactions in dollar amounts (capital contributions, distributions, related-party payments) but not income, expenses, or profit. The 1120 normally reports income but is left blank in the pro forma version.",
      },
      {
        q: "What's the deadline for both?",
        a: "April 15 of the year following the tax year. Form 7004 extension extends both to October 15. Same deadline because they're filed as one package.",
      },
      {
        q: "Where do I get blank copies of these forms?",
        a: "Form 1120 and Form 5472 are both downloadable as PDFs from irs.gov. Our wizard handles this for you — you don't need to download anything; we generate filled, signature-ready PDFs.",
      },
      {
        q: "Is the package the same for every year?",
        a: "Structurally yes — pro forma 1120 + Form 5472 + Part V supporting statement. Year-by-year the numbers change (capital contributions, distributions, total assets). Our wizard pre-fills from your prior year's filing if you come back.",
      },
      {
        q: "Can I file them at different times?",
        a: "No. Form 5472 must be filed with the 1120 it's attached to. You can't file the 1120 in March and the 5472 in October. They're submitted together as one package on or before April 15 (or the extended due date).",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "file-form-5472", "form-5472-instructions", "form-1120-foreign-owned-llc", "irs-form-5472"],
  },
  {
    slug: "wyoming-llc-form-5472",
    keyword: "Wyoming LLC form 5472",
    title: "Wyoming LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Wyoming LLCs owned by non-US persons must file Form 5472 with pro forma Form 1120 by April 15. Full guide to federal + Wyoming state obligations. Accountant-reviewed filings from $199.",
    h1: "Wyoming LLC Form 5472 Filing Guide",
    intro:
      "Wyoming is the most popular state for foreign-owned US LLCs because of its low fees, no state income tax, strong privacy laws, and cheap registered agent ecosystem. But Wyoming residency doesn't exempt you from federal filings — every foreign-owned Wyoming LLC must file IRS Form 5472 with pro forma Form 1120 by April 15 each year, with a $25,000 penalty if missed. This is the complete federal + Wyoming-state filing playbook for foreign owners.",
    sections: [
      {
        heading: "Why Wyoming is the #1 state for foreign LLC owners",
        body: "• No state income tax — Wyoming taxes neither LLCs nor LLC members on income.\n• No state-level franchise tax on LLCs.\n• Cheap annual report ($60/year, due in the formation anniversary month).\n• Strong owner privacy — Wyoming doesn't require disclosing the owner in public state records.\n• Mature registered agent ecosystem with rates as low as $50-$100/year.\n• Online filing for state-level requirements.\n• English-language process, low-touch state government.\n\nThese benefits make Wyoming attractive — but they're STATE-level. Federal Form 5472 obligations apply regardless of which state you incorporated in. Choosing Wyoming saves you state tax; it does not exempt you from the federal disclosure return.",
      },
      {
        heading: "Wyoming-specific tax timeline",
        body: "Annual federal:\n• April 15 — Federal Form 5472 + pro forma Form 1120 due (October 15 with Form 7004 extension).\n\nAnnual Wyoming state:\n• First day of the LLC's formation anniversary month — Wyoming Annual Report due ($60 minimum, can be higher based on assets located in Wyoming). Filed online with the Wyoming Secretary of State.\n\nOne-time federal (formation year only):\n• BOI (Beneficial Ownership Information) report to FinCEN — required within 30 days of formation. Free, filed online at fincen.gov.\n\nThat's it for the standard foreign-owned Wyoming LLC. No state income tax return, no state franchise tax, no state-level information return.\n\nOptional / situational:\n• Sales tax registrations in any state where you cross economic nexus thresholds (typically $100K in sales).\n• Personal Form 1040-NR only if you have US-source income personally (rare).",
      },
      {
        heading: "How to find your Wyoming LLC's filing info",
        body: "You'll need this for Form 5472:\n\n• Legal name — exactly as shown on your CP-575 EIN confirmation letter. Wyoming sometimes has slight formatting differences vs. the IRS record; use the CP-575 version.\n• EIN — 9-digit number on your CP-575.\n• US address — typically your registered agent's address (Wyoming Registered Agent LLC, Northwest Registered Agent, IncFile, etc.). This is what the IRS will use for any correspondence.\n• State of incorporation — \"Wyoming\" or \"WY\".\n• Date of incorporation — on your Wyoming Articles of Organization.\n• NAICS principal business activity code — look up at naics.com (common ones for foreign-owned Wyoming LLCs: 454110 ecommerce, 541510 SaaS, 541613 marketing).\n• Total assets at year-end in USD — sum of bank balance, receivables, inventory, fixed assets.\n• Reportable transactions for the year — capital contributions in, distributions out, related-party payments.",
      },
      {
        heading: "Common Wyoming LLC scenarios",
        body: "1. Solo founder, no US activity (ecommerce, SaaS, consulting): file pro forma Form 1120 + Form 5472 only. LLC typically made no taxable US-source income. State filing: just the $60 annual report.\n\n2. Stripe Atlas LLC formed in Wyoming: same as above. Stripe Atlas's onboarding does NOT include annual Form 5472 filing — it's on you.\n\n3. Wyoming holding LLC with subsidiaries: file Form 5472 for each LLC where you're a 25%+ foreign owner. Each holding-subsidiary structure may have additional 5472 filings for inter-entity transactions.\n\n4. Wyoming LLC used for Amazon FBA: file Form 5472 + 1120. Additionally watch for state sales tax in every state where FBA stores your inventory — Amazon's reports show you the states. If you have inventory in the US you may also have US-source ECI triggering Form 1040-NR; consult a CPA.\n\n5. Wyoming LLC with US real estate: Form 5472 + 1120 plus Form 1040-NR personally for any rental income. US real estate income is always US-source — talk to a CPA.\n\n6. Dormant Wyoming LLC with no transactions: if truly $0 activity, no Form 5472 may be required, but most owners file anyway for safety since the bar is so low (one capital contribution triggers it).",
      },
      {
        heading: "Filing Form 5472 for your Wyoming LLC step by step",
        body: "1. Gather the items in the previous section (LLC info, owner info, year-end financials).\n2. Fill in the pro forma Form 1120: entity name/EIN/address, total assets, stamp \"Foreign-Owned U.S. DE\" across the top.\n3. Fill in Form 5472: Part I (your LLC), Part II (you as foreign shareholder), Part III (you again as related party), Part IV (usually blank for foreign-owned DEs), Part V (capital contributions + distributions, with supporting statement), Part VII (FDE confirmation).\n4. Sign the 1120's signature line in pen.\n5. Fax the complete package (cover letter + 1120 + 5472 + Part V supporting statement) to +1-855-887-7737 (IRS Ogden PIN Unit).\n6. Save the fax transmission receipt as proof of timely filing.\n\nOr use our service: Standard $199 covers the entire package including IRS fax delivery, and every filing is reviewed by an accountant on our team before submission.",
      },
      {
        heading: "Wyoming registered agent address — what to use",
        body: "Your Wyoming registered agent address is what goes on Form 1120 line B (US address) and Form 5472 Part I line 1b.\n\nFor most foreign owners, this is the address of your registered agent service: Wyoming Registered Agent LLC, Northwest Registered Agent, IncFile, Cloud Peak Law, etc. The IRS will mail any notices (including CP-15 penalty notices, if any) to this address.\n\nImportant: confirm your registered agent actually forwards or scans IRS mail to you. Some cheap registered agents in Wyoming bounce IRS mail back as undeliverable, which means you might never see a notice — but the penalty is still assessed and accruing.\n\nIf you've changed registered agents since you got your EIN, you may need to update the IRS via Form 8822-B (Change of Address or Responsible Party). Otherwise the CP-575 address on file is what the IRS uses.",
      },
      {
        heading: "Wyoming Annual Report — separate from Form 5472",
        body: "Don't confuse the Wyoming Annual Report (state filing) with Form 5472 (federal filing). They are completely separate:\n\n• Wyoming Annual Report: filed with Wyoming Secretary of State, due on the first day of your LLC's formation anniversary month, $60 minimum. Online at wyobiz.wyo.gov.\n• Form 5472 + pro forma 1120: filed with the IRS Ogden PIN Unit, due April 15. Faxed to +1-855-887-7737.\n\nMissing the Wyoming Annual Report can result in your LLC being administratively dissolved by Wyoming — not the $25,000 IRS penalty. Missing Form 5472 triggers the IRS penalty regardless of Wyoming compliance.\n\nMost foreign owners need to handle both. We handle the federal Form 5472 + 1120; the Wyoming Annual Report is a simple 10-minute online form you do directly with the state.",
      },
      {
        heading: "Multi-year catch-up for a Wyoming LLC",
        body: "If you formed your Wyoming LLC in 2022 and just learned about Form 5472, you may have 2-3 unfiled years (2022, 2023, 2024). The IRS provides DIIRSP (Delinquent International Information Return Submission Procedure) as the standard catch-up path:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement covering the entire period.\n• Submit via fax to +1-855-887-7737.\n• If accepted, no penalty assessed.\n\nOur multi-year DIIRSP packages:\n• 2-year catch-up: Standard $348 · Rush $428 · Premium $598 (fax included).\n• 3-year catch-up: Standard $497 · Rush $577 · Premium $747 (fax included).\n\nThe reasonable cause statement is auto-generated by our wizard, tailored to the first-time-foreign-owner scenario. Every package is reviewed by an accountant on our team before we fax it.",
      },
      {
        heading: "What our service does for Wyoming LLC owners specifically",
        body: "Our wizard is pre-tuned for the foreign-owned single-member LLC profile — which is overwhelmingly Wyoming and Delaware. Wyoming-specific touches:\n\n• Pre-populated state code (WY) on the 1120 entity info.\n• Default NAICS suggestions for the most common Wyoming foreign-owner business types (ecommerce, SaaS, consulting, marketing).\n• Validation that the address matches a recognized Wyoming registered agent pattern (helps catch typos).\n• No state-specific add-ons needed — Wyoming has no state filing we'd add to the package.\n\nPricing identical to any other state:\n• 1 year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 years: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 years: Standard $497 · Rush $577 · Premium $747 (fax included)",
      },
      {
        heading: "Bottom line for Wyoming LLC owners",
        body: "Wyoming is a great state for forming a US LLC as a non-US person — low cost, no state income tax, strong privacy. But it does not exempt you from federal Form 5472 + pro forma 1120, due every April 15.\n\nThe $25,000-per-year-per-form federal penalty is the largest compliance risk for your LLC. Wyoming state filings are a minor annual $60 task; federal Form 5472 is the one you have to get right.\n\nOur service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee. The state piece (Wyoming Annual Report) is a 10-minute self-serve task on the state website.",
      },
    ],
    faqs: [
      {
        q: "Does Wyoming notify the IRS about my LLC?",
        a: "Wyoming reports your LLC's existence to the IRS when you get your EIN (the EIN database links Wyoming-issued entity numbers to IRS records). After that, federal filings are your responsibility — Wyoming doesn't track Form 5472 compliance.",
      },
      {
        q: "Do I need a Wyoming registered agent address on Form 5472?",
        a: "Use the US address on your CP-575 EIN confirmation letter. For most Wyoming LLCs that's your registered agent's address. Confirm the agent forwards or scans IRS mail — otherwise you may miss notices.",
      },
      {
        q: "I dissolved my Wyoming LLC last year. Do I still file Form 5472?",
        a: "Yes. For the partial year the LLC was active before dissolution, you still need to file a final Form 5472 + 1120 covering that period. The deadline is the 15th day of the 4th month after the LLC's final month.",
      },
      {
        q: "Wyoming has no state income tax — does that mean no IRS filing too?",
        a: "No. Wyoming's lack of state tax has nothing to do with federal IRS obligations. Every foreign-owned Wyoming LLC files Form 5472 + pro forma 1120 with the IRS regardless of state-level taxes.",
      },
      {
        q: "Can the IRS access my Wyoming LLC's owner info even with Wyoming privacy?",
        a: "Yes. Wyoming's privacy applies to public state records — not IRS filings. When you file Form 5472, you list yourself as the 25%+ foreign shareholder including your name and address. The IRS knows who you are.",
      },
      {
        q: "How do I file the Wyoming Annual Report?",
        a: "Online at wyobiz.wyo.gov. Takes about 10 minutes. Costs $60 for most foreign-owned single-member LLCs. Due the first day of your LLC's formation anniversary month. Completely separate from Form 5472.",
      },
      {
        q: "Do I need a Wyoming-based CPA?",
        a: "No. Form 5472 is a federal filing — any US CPA familiar with international information returns can prepare it. Better: most don't see it often. Our flat-fee service is built specifically for this filing and reviewed by an accountant on our team.",
      },
      {
        q: "My Wyoming LLC made no money — do I still file?",
        a: "Yes, almost certainly. If you had even one capital contribution (e.g. wiring money in to fund the bank account), that's a reportable transaction. Most Wyoming LLCs file every year regardless of revenue.",
      },
      {
        q: "Can I use a Wyoming PO Box as my address?",
        a: "Generally no. The IRS expects a street address that can receive certified mail. Your registered agent's street address is the standard choice. A PO Box may cause processing issues.",
      },
      {
        q: "What if my Wyoming LLC has multiple foreign owners?",
        a: "Then it's a multi-member LLC and our service doesn't apply — multi-member LLCs file Form 1065 (partnership return) instead of Form 5472. You'd need a CPA familiar with foreign partnerships. Single-member, foreign-owned, disregarded LLCs are our specialty.",
      },
    ],
    relatedSlugs: ["foreign-owned-llc-tax", "delaware-llc-form-5472", "file-form-5472", "single-member-llc-foreign-owner", "form-5472-deadline"],
  },
  {
    slug: "delaware-llc-form-5472",
    keyword: "Delaware LLC form 5472",
    title: "Delaware LLC Form 5472 — Foreign Owner Filing Guide",
    metaDescription:
      "Delaware LLCs with foreign owners must file IRS Form 5472 + pro forma Form 1120 every year. Complete guide for Stripe Atlas + standalone Delaware LLCs. Accountant-reviewed filings from $199.",
    h1: "Delaware LLC Form 5472 Filing Guide",
    intro:
      "Delaware is the #2 most popular state for foreign-owned US LLCs after Wyoming. Stripe Atlas defaults to Delaware, so a large share of foreign-founder LLCs are Delaware entities. If you formed a Delaware LLC and you're not a US person, you must file IRS Form 5472 with pro forma Form 1120 every year — even if your LLC had zero revenue. This is the full Delaware-specific filing playbook including the federal Form 5472, the $300 Delaware franchise tax, and the differences from Wyoming.",
    sections: [
      {
        heading: "Why Delaware?",
        body: "Delaware's appeal:\n• Well-developed business law and the Court of Chancery for fast, judge-only business dispute resolution.\n• Brand recognition with US investors — most VC term sheets default to Delaware C-corps. (LLCs are similar enough to feel safe.)\n• Stripe Atlas chose Delaware as the default state for its incorporation product, so a huge share of foreign-founder LLCs are Delaware entities.\n• Mature registered agent ecosystem.\n• Online state filing portal.\n\nDownsides for solo foreign owners:\n• $300/year franchise tax for LLCs (higher than Wyoming's $60). Real money over time.\n• Slightly more disclosure than Wyoming (though still light on owner privacy).\n• Higher registered agent fees on average ($100-$150/year typical).\n\nNet: Delaware is excellent if you raised or plan to raise from US investors. For pure solo ecommerce / SaaS with no investor plans, Wyoming is cheaper. Either way, Form 5472 + pro forma 1120 federal filing is identical.",
      },
      {
        heading: "Delaware-specific tax timeline",
        body: "Annual federal:\n• April 15 — Federal Form 5472 + pro forma Form 1120 due to the IRS (October 15 with Form 7004 extension). Faxed to +1-855-887-7737.\n\nAnnual Delaware state:\n• June 1 — Delaware Annual LLC Franchise Tax due. $300/year flat for most foreign-owned single-member LLCs. Filed with the Delaware Division of Corporations at corp.delaware.gov.\n\nOne-time federal (formation year):\n• BOI (Beneficial Ownership Information) report to FinCEN within 30 days of formation. Free, online at fincen.gov.\n\nDelaware has NO state income tax on LLCs that don't conduct business in Delaware itself. Almost all foreign-owned Delaware LLCs serve non-Delaware customers and qualify for the exemption — their state obligation is just the $300 franchise tax.",
      },
      {
        heading: "Stripe Atlas LLCs",
        body: "If you used Stripe Atlas to incorporate, your LLC is almost certainly Delaware. Stripe Atlas is excellent at:\n• Forming the LLC.\n• Getting your EIN (typically within days).\n• Helping with the initial Mercury bank account.\n• Providing legal templates.\n\nWhat Stripe Atlas explicitly does NOT cover:\n• Annual federal tax filings including Form 5472.\n• Delaware franchise tax (they remind you but don't pay it).\n• Ongoing tax compliance.\n• BOI reports to FinCEN.\n\nStripe's own documentation states Atlas is a formation product, not an ongoing tax service. The $5K-equivalent value at formation does not include any year-2-onward filing.\n\nWe handle the federal Form 5472 + pro forma 1120 specifically for foreign-owned Stripe Atlas LLCs. Standard $199 (IRS fax delivery included), same 15-minute filing process. Most Stripe Atlas customers come to us in spring of year 2 once they realize Form 5472 is on them.",
      },
      {
        heading: "Filing Form 5472 for your Delaware LLC step by step",
        body: "Identical to filing for any other state:\n\n1. Gather LLC info: legal name (exactly as on CP-575), EIN, Delaware registered agent address, date of formation, state (DE), NAICS code, total assets at year-end.\n2. Gather your owner info: full legal name as on passport, FTIN or self-assigned Reference ID, residential address in your home country, country of citizenship, country of tax residence.\n3. Add up year-end financials: capital contributions in, distributions out, any related-party payments.\n4. Fill in pro forma Form 1120: entity identification fields only, stamp \"Foreign-Owned U.S. DE\" across the top.\n5. Fill in Form 5472: Parts I, II, III, IV, V, VII.\n6. Build the Part V supporting statement listing each reportable transaction.\n7. Sign the 1120's signature line in pen.\n8. Fax the complete package to +1-855-887-7737 (IRS Ogden PIN Unit). Save the transmission receipt.\n\nDelaware doesn't change the federal process at all. Same forms, same fax number, same deadline.",
      },
      {
        heading: "Delaware franchise tax — separate from Form 5472",
        body: "The $300 annual Delaware franchise tax is paid to the Delaware Division of Corporations, not the IRS. It's completely separate from Form 5472.\n\n• Due date: June 1 each year.\n• Amount: $300 minimum for an LLC (the LLC franchise tax is a flat fee, unlike the corporate franchise tax which is value-based).\n• Filing: online at corp.delaware.gov. Takes about 10 minutes. Pay by credit card or ACH.\n• Late penalty: $200 + 1.5% monthly interest if missed. Not catastrophic but adds up.\n\nIf you miss the franchise tax for several years, Delaware will administratively dissolve your LLC and you'd need to file for reinstatement (with all back fees plus a reinstatement charge). The LLC's legal existence is at risk if you ignore Delaware franchise tax — distinct from the IRS penalty for missing Form 5472.\n\nWe handle Form 5472 + pro forma 1120 (the IRS filing). You handle the $300 franchise tax directly with Delaware (or your registered agent often offers to handle it for an extra fee).",
      },
      {
        heading: "Stripe Atlas + Mercury + Form 5472 — the typical stack",
        body: "Common setup for foreign founders:\n• Delaware LLC formed via Stripe Atlas ($500 / one-time).\n• EIN issued through Atlas.\n• Mercury business banking account.\n• Stripe for payment processing.\n• Customers anywhere globally (commonly: ecommerce dropshipping, SaaS subscriptions, info products, consulting).\n\nWhat this triggers annually:\n• Federal Form 5472 + pro forma 1120 — yes, every year, $25,000 penalty if missed. Our service: Standard $199 · Rush $279 · Premium $449. IRS fax delivery included. +$149 per additional past year.\n• Delaware franchise tax — $300/year, due June 1. Self-serve at corp.delaware.gov.\n• Stripe Atlas annual fees — if you subscribed to Atlas's ongoing service ($100/month or similar), they handle some of this. The base $500 formation product does NOT include annual filing.\n• BOI report — one-time at formation (FinCEN). Free.\n• Sales tax — only if you cross economic nexus thresholds in specific states (typically not for SaaS or non-US-only ecommerce).\n\nAt the federal level, the largest penalty risk by far is Form 5472. The $300 franchise tax late penalty is small money; the $25,000 IRS penalty is real money.",
      },
      {
        heading: "Common Delaware LLC scenarios",
        body: "1. Stripe Atlas SaaS founder, foreign, no US customers: file pro forma 1120 + Form 5472. No US tax. Delaware franchise tax $300. Annual total: $499 (our Standard $199 + Delaware's $300). IRS fax delivery included.\n\n2. Delaware LLC for ecommerce serving global customers: file Form 5472 + 1120. Sales tax only in states where economic nexus crossed. Total annual federal compliance: Standard $199 (fax included) with us.\n\n3. Delaware LLC with US-based contractors / freelancers: same federal filing, plus possible 1099-NEC for the contractors (separate filing). No US trade or business if contractors are independent and you have no fixed US place of business.\n\n4. Delaware LLC with US-based employees or US warehouse: significantly more complex — likely US trade or business, ECI income, payroll taxes. Consult a CPA, not our service.\n\n5. Multi-year catch-up: a Delaware LLC formed in 2022 with no Form 5472 filed: use our 3-year DIIRSP catch-up (Standard $497, fax included) covering 2022, 2023, 2024.\n\n6. Delaware LLC dissolved last year: file a final Form 5472 + 1120 for the partial year ending at dissolution. Still required.",
      },
      {
        heading: "Multi-year catch-up under DIIRSP",
        body: "Many Stripe Atlas founders discover Form 5472 a year or two after forming their Delaware LLC. The IRS provides DIIRSP (Delinquent International Information Return Submission Procedure) as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement covering the entire period.\n• Submit via fax to +1-855-887-7737.\n• Most well-documented first-time foreign-owner catch-ups are accepted without penalty.\n\nOur multi-year DIIRSP packages:\n• 2-year catch-up: Standard $348 · Rush $428 · Premium $598 (fax included).\n• 3-year catch-up: Standard $497 · Rush $577 · Premium $747 (fax included).\n\nThe Reasonable Cause Statement is auto-generated by our wizard, tailored to the first-time-foreign-owner / Stripe Atlas scenario. Every package is reviewed by an accountant on our team before we fax it.",
      },
      {
        heading: "Switching from Delaware to Wyoming",
        body: "Some foreign founders move their LLC from Delaware to Wyoming to save the $240/year difference in state fees ($300 Delaware vs $60 Wyoming). This is done via \"domestication\" — Delaware files a Certificate of Cessation, Wyoming files a Certificate of Domestication.\n\nProcess takes 2-4 weeks. Costs ~$200-$400 in filing fees plus your registered agent's time. The LLC keeps its EIN and continuity.\n\nBut: Form 5472 obligation is identical in both states. You're still a foreign-owned US LLC, still file Form 5472 + pro forma 1120, same federal penalty. Domestication only saves state fees.\n\nIf you raised from US investors who insisted on Delaware, you typically don't domesticate out — investors expect Delaware governing law. If you're a solo founder with no investor plans, Wyoming saves $240/year long-term.\n\nWe don't help with domestication — that's a registered agent or a Delaware/Wyoming business law firm task. We handle the federal Form 5472 in both states identically.",
      },
      {
        heading: "Bottom line for Delaware LLC owners",
        body: "If you have a foreign-owned Delaware LLC:\n• File federal Form 5472 + pro forma 1120 every year by April 15. $25,000 penalty if missed.\n• Pay Delaware franchise tax $300 by June 1. State-level — separate from IRS.\n• File BOI report at formation. One-time.\n• Watch for state sales tax obligations as you scale.\n\nOur service handles the federal Form 5472 + 1120 from $199 (Standard), with IRS fax delivery included on every plan. +$149 per additional past year. Every filing is reviewed by an accountant on our team. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "Does Delaware notify the IRS about my LLC?",
        a: "Delaware reports the LLC at formation when you got your EIN — that linked Delaware's entity number to your IRS records. Annual federal filings (including Form 5472) are your responsibility going forward; Delaware doesn't track them.",
      },
      {
        q: "Is the Delaware franchise tax separate from Form 5472?",
        a: "Yes. The $300 Delaware franchise tax is paid to the Delaware Division of Corporations (state level). Form 5472 is filed with the IRS Ogden PIN Unit (federal level). They're completely separate; missing one doesn't affect the other.",
      },
      {
        q: "Can I move my LLC from Delaware to Wyoming to avoid the franchise tax?",
        a: "Yes, via domestication. Costs ~$200-$400 and takes 2-4 weeks. But Form 5472 obligation is identical in both states — domestication only saves state fees, not the federal filing requirement.",
      },
      {
        q: "I used Stripe Atlas — doesn't that include Form 5472?",
        a: "No. Stripe Atlas is a formation product. Their docs explicitly state they don't handle annual federal tax filings including Form 5472. Their optional ongoing services may include some help, but the standard Atlas formation product is one-time.",
      },
      {
        q: "What if I miss the Delaware franchise tax?",
        a: "Delaware imposes a $200 late penalty plus 1.5% monthly interest. After several missed years, Delaware can administratively dissolve your LLC. To reinstate you'd pay all back fees plus a reinstatement charge. Different from the IRS Form 5472 penalty, but still costly.",
      },
      {
        q: "Do I need a Delaware-based CPA?",
        a: "No. Form 5472 is a federal filing — any US CPA familiar with international information returns can prepare it. Most don't. Our flat-fee service is built specifically for this filing and reviewed by an accountant on our team.",
      },
      {
        q: "Does Delaware have its own equivalent of Form 5472?",
        a: "No. Delaware doesn't impose a state-level analog of Form 5472. Your state filings are just the $300 franchise tax and any sales tax if you cross nexus thresholds.",
      },
      {
        q: "My Delaware LLC made no money in year 1 — do I still file Form 5472?",
        a: "Yes, almost certainly. If you had even one capital contribution (e.g. wiring money to fund the Mercury account or pay the Stripe Atlas fee), that's a reportable transaction. Most Delaware LLCs file every year regardless of revenue.",
      },
      {
        q: "Can I file Form 5472 before I file the Delaware franchise tax?",
        a: "Yes — they're independent. Form 5472 federal deadline is April 15; Delaware franchise tax deadline is June 1. File each on its own timeline.",
      },
      {
        q: "What's the cheapest year-1 federal compliance for a Stripe Atlas Delaware LLC?",
        a: "Federal: Standard $199 (our service, fax included). Add the $300 Delaware franchise tax = $499 total annual compliance. Add Stripe Atlas's one-time $500 formation cost (year 1 only) for full year-1 picture.",
      },
    ],
    relatedSlugs: ["wyoming-llc-form-5472", "foreign-owned-llc-tax", "file-form-5472", "stripe-atlas-form-5472", "single-member-llc-foreign-owner"],
  },
  {
    slug: "pro-forma-1120",
    keyword: "pro forma 1120",
    title: "Pro Forma Form 1120 — What It Is and How to Fill It Out",
    metaDescription:
      "Pro forma Form 1120 is filed by foreign-owned US LLCs as the procedural attachment to Form 5472. Most fields stay blank. Full walkthrough + accountant-reviewed 15-minute online filing.",
    h1: "Pro Forma Form 1120 — Plain-English Guide",
    intro:
      "Foreign-owned US single-member LLCs file pro forma Form 1120 as the procedural envelope for Form 5472. \"Pro forma\" means most of the form stays blank — you only fill in entity identification fields and stamp \"Foreign-Owned U.S. DE\" at the top. This guide shows exactly which fields to fill, which to leave empty, why the form even exists in this format, and how to assemble the full package the IRS expects.",
    sections: [
      {
        heading: "What does 'pro forma' mean here?",
        body: "Pro forma means \"as a matter of form\" — you file the form for procedural compliance, not to calculate tax. The IRS requires Form 5472 to be attached to a tax return, but a foreign-owned disregarded LLC is not subject to US corporate income tax (the LLC is disregarded — income flows to the owner, not the entity). So the 1120 becomes a near-empty envelope just to give Form 5472 something to attach to.\n\nDo NOT fill in income, deductions, or tax calculations on a pro forma 1120. Doing so would incorrectly suggest your LLC is a real C-corporation owing US tax. The IRS specifically designed the pro forma format to keep your LLC's disregarded-entity status intact while still satisfying the §6038A reporting attachment requirement.",
      },
      {
        heading: "Fields you DO fill in",
        body: "On page 1 of Form 1120:\n\n• Top margin: stamp or write \"Foreign-Owned U.S. DE\" — required by IRS instructions.\n• Item A (Check if): leave blank unless you have a specific situation.\n• Item B (Employer identification number): your LLC's EIN.\n• Item C (Date incorporated): date your LLC was formed.\n• Item D (Total assets): year-end total assets in USD (sum of cash + receivables + inventory + fixed assets).\n• Item E (Check if initial / final / amended): check \"Initial return\" for your first year, \"Final return\" for the dissolution year, blank otherwise.\n• Name and address block: legal name + US address (typically registered agent's address) exactly as on CP-575.\n• Signature block at the bottom: sign in pen, date, print name, list as \"Member\" or \"Owner\".\n\nSchedule L (Balance Sheets per Books):\n• Line 15, column (d) end of year — total assets. This must match Item D on page 1.\n\nThat's it. Maybe 8 fields total.",
      },
      {
        heading: "Fields you LEAVE BLANK",
        body: "Almost everything else:\n\n• Income section (lines 1a through 11): leave blank.\n• Deductions section (lines 12 through 29): leave blank.\n• Tax computation (lines 30 through 37): leave blank.\n• Schedule C (Dividends, Inclusions, Special Deductions): leave blank.\n• Schedule J (Tax Computation and Payment): leave blank.\n• Schedule K (Other Information): leave blank unless something specifically applies.\n• Schedule L (Balance Sheets per Books): only line 15 column (d) needs a value; all other lines blank.\n• Schedule M-1 (Reconciliation of Income per Books with Income per Return): leave blank.\n• Schedule M-2 (Analysis of Unappropriated Retained Earnings): leave blank.\n\nLeave them empty. Don't write \"0\" or \"N/A\" — write nothing. The IRS instructions for foreign-owned DEs are explicit: these sections stay blank on a pro forma filing.\n\nFilling in income would incorrectly treat your LLC as a C-corp owing tax. Filling in \"0\" is technically also wrong (it asserts a calculation was performed). Empty is correct.",
      },
      {
        heading: "The 'Foreign-Owned U.S. DE' stamp",
        body: "This is a literal requirement from the IRS instructions for Form 5472. At the top of page 1 of Form 1120, write or stamp:\n\n\"Foreign-Owned U.S. DE\"\n\nThis tells the IRS Ogden PIN Unit how to route and process the return. Without this stamp:\n\n• The IRS may try to process it as a regular 1120 — triggering deficiency notices for missing income data.\n• The Form 5472 attachment may not be correctly linked to your LLC.\n• The return may be misrouted within the IRS, delaying processing.\n• Worst case: the filing is treated as incomplete, triggering the $25,000 §6038A penalty.\n\nYou can hand-write it, type it, or stamp it — any visible \"Foreign-Owned U.S. DE\" notation at the top margin works. Our wizard automatically adds this text when generating the PDF.",
      },
      {
        heading: "Why a 'pro forma' format and not a separate form?",
        body: "The IRS doesn't have a dedicated form for foreign-owned DE disclosure. Form 5472 was designed for 25%+ foreign-owned US corporations (where the corporation files a real Form 1120). When the IRS extended §6038A to foreign-owned single-member LLCs in 2017, they needed a way to receive Form 5472 attachments — but those LLCs aren't real corporations and don't owe corporate tax.\n\nThe pro forma 1120 solution: file the existing 1120 structure with only the procedural fields completed, marked \"Foreign-Owned U.S. DE\" to flag the special status. This avoided creating a brand-new form and integrated cleanly into the existing IRS Ogden processing channel.\n\nThe downside: it's confusing for foreign LLC owners who see \"file Form 1120\" and assume their LLC has become a corporation. It hasn't — your LLC stays a disregarded entity for all other tax purposes.",
      },
      {
        heading: "Filing the package",
        body: "Once your pro forma 1120 is filled and stamped, the full package order is:\n\n1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 (1-2 pages, with the \"Foreign-Owned U.S. DE\" stamp).\n3. Form 5472 (2 pages).\n4. Part V supporting statement (1+ pages).\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nSign the 1120's signature line in pen on the printed page. Fax the entire package to the IRS Ogden PIN Unit at +1-855-887-7737. Save the fax transmission receipt as proof of timely filing.\n\nOur service generates the entire correctly-formatted package automatically. You sign one PDF on screen (the signature embeds into every required signature box), an accountant on our team reviews it, and we fax it to the IRS. IRS fax delivery is included in every plan — no separate fee.",
      },
      {
        heading: "Common mistakes on pro forma 1120",
        body: "• Filling in income/deductions/tax: turns it into a real corporate return, can trigger US tax liability and audits.\n• Writing \"0\" in blank fields instead of leaving empty: technically incorrect; the IRS instructions specify these fields stay empty.\n• Missing the \"Foreign-Owned U.S. DE\" stamp: causes routing/processing issues at Ogden.\n• Wrong tax year: form is for the tax year that ENDED, not the year you're filing in. 2024 return = tax year 2024 = filed by April 15, 2025.\n• Wrong EIN: must match your CP-575 exactly. A digit transposition can trigger rejection.\n• Missing signature: the 1120 signature line must be signed in pen — Form 5472 doesn't have a separate signature.\n• Filing only the 1120 without Form 5472 attached: the whole point is the 5472 attachment; missing it defeats the purpose.\n• Filing only Form 5472 without the pro forma 1120: also invalid; the IRS won't process a 5472 without its envelope.",
      },
      {
        heading: "Pro forma 1120 vs regular Form 1120",
        body: "Pro forma 1120 (for foreign-owned DEs):\n• Used as a procedural envelope for Form 5472.\n• Most fields blank.\n• No tax owed.\n• Stamped \"Foreign-Owned U.S. DE\".\n• Filed once a year by April 15.\n\nRegular Form 1120 (for real US C-corporations):\n• Real corporate income tax return.\n• All income, deductions, and tax fields filled.\n• Tax owed at corporate rates (21% federal).\n• No special stamp.\n• Filed once a year by April 15 (calendar-year corps).\n\nIf your LLC was structured as a C-corp election (Form 8832 \"check the box\" election to be taxed as a corporation), you'd file a regular 1120, not pro forma. Most foreign-owned LLCs do NOT make this election and remain disregarded entities.",
      },
      {
        heading: "What about Form 1120-F or 1120-S?",
        body: "Form 1120-F: \"U.S. Income Tax Return of a Foreign Corporation.\" Filed by foreign corporations (not US-formed entities) that have US-source income or a US trade or business. Your foreign-owned US LLC is a domestic (US) entity, not a foreign corporation — so 1120-F doesn't apply to your LLC.\n\nForm 1120-S: filed by S-corporations. S-corps require all owners to be US persons, so foreign-owned LLCs can never elect S-corp status. 1120-S is never the right form for a foreign owner.\n\nForm 1120 (regular): filed by US C-corporations. Pro forma 1120 (same form, used differently) is the right answer for foreign-owned single-member LLCs.\n\nSummary: 1120 pro forma = right; 1120-F = wrong (you're not a foreign corp); 1120-S = wrong (foreign owners can't have S-corps); 1065 = wrong (single-member LLCs aren't partnerships).",
      },
      {
        heading: "Use our pre-filled pro forma 1120",
        body: "Our wizard generates a correctly-formatted pro forma Form 1120 with:\n\n• \"Foreign-Owned U.S. DE\" stamp at the top.\n• Entity name, EIN, US address pre-filled from your wizard answers.\n• Date of incorporation pre-filled.\n• Total assets at year-end pre-filled from your year-end total.\n• Signature line ready for your in-portal canvas signature.\n• All income/deduction/tax fields correctly left blank.\n• Schedule L line 15 column (d) pre-filled to match Item D.\n\nNo manual form-filling. The signed PDF is ready to fax to +1-855-887-7737, and we handle that for you — IRS fax delivery is included in every plan.\n\nPricing: Standard $199 · Rush $279 · Premium $449. +$149 per additional past year. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "Do I need to fill in Schedule L (balance sheet)?",
        a: "Only line 15, column (d) — total assets at year-end. The other balance sheet detail isn't required for pro forma filings. Line 15 (d) must match Item D on page 1.",
      },
      {
        q: "Can I e-file the pro forma 1120?",
        a: "No. Foreign-owned disregarded entities are explicitly excluded from e-filing for 1120 and 5472. The IRS Modernized e-File system can't process them. Fax (+1-855-887-7737) or paper mail (IRS Ogden, UT 84201-0023) only.",
      },
      {
        q: "Do I need to attach Form 1125-A or 1125-E?",
        a: "No. Those schedules are for active C-corporations with cost of goods sold or executive compensation. Pro forma 1120 for foreign-owned DEs doesn't require them — leave them out entirely.",
      },
      {
        q: "What if my LLC has subsidiaries?",
        a: "If your foreign-owned LLC owns other entities, each subsidiary may need its own Form 5472 + pro forma 1120 depending on the structure. Get a CPA involved for multi-entity setups — our wizard supports single-entity filings only.",
      },
      {
        q: "Do I file pro forma 1120 if my LLC owes US tax?",
        a: "No. If your LLC actually has US-source effectively connected income and owes corporate tax, you'd file a full Form 1120 (not pro forma) with all income and tax calculations. This is rare for foreign-owned single-member LLCs but happens with US warehouse/employee setups. Consult a CPA.",
      },
      {
        q: "Should I fill in 'foreign-owned' on item A?",
        a: "Item A is for specific check-box situations (consolidated return, personal holding co, etc.) — not typically for foreign-owned DEs. The \"Foreign-Owned U.S. DE\" stamp at the top is what flags your status, not Item A.",
      },
      {
        q: "What goes in Item D — total assets?",
        a: "Total assets at year-end in USD: sum of cash + receivables + inventory + fixed assets (whatever the LLC owns on December 31). This should match your accounting records' end-of-year balance sheet total.",
      },
      {
        q: "Do I sign the 1120 or the 5472?",
        a: "The 1120 — Form 5472 itself doesn't have a signature line. The 1120's signature block at the bottom of page 1 covers both forms in the package. Sign in pen.",
      },
      {
        q: "Can I use last year's pro forma 1120 as a template?",
        a: "Yes. The structure is identical year over year — only the year, total assets, and dates change. Our wizard pre-fills from your prior year's filing if you're a return customer.",
      },
      {
        q: "What if I forget the 'Foreign-Owned U.S. DE' stamp?",
        a: "The filing may be misrouted or processed incorrectly. If you've already faxed without it, you can fax a corrected version with the stamp added. Better: catch the missing stamp before sending. Our wizard adds it automatically.",
      },
    ],
    relatedSlugs: ["form-5472-vs-1120", "file-form-5472", "form-5472-instructions", "form-1120-disregarded-entity", "form-1120-foreign-owned-llc"],
  },
  {
    slug: "form-1120-foreign-owned-llc",
    keyword: "form 1120 foreign owned LLC",
    title: "Form 1120 for Foreign-Owned LLC — Pro Forma Filing Guide",
    metaDescription:
      "Foreign-owned US LLCs must file pro forma Form 1120 with Form 5472 every year. Learn what to fill in, what to leave blank, how to assemble the package, and how to file in 15 minutes.",
    h1: "Form 1120 for Foreign-Owned LLCs",
    intro:
      "If you are a non-US person who owns a US single-member LLC, you must file Form 1120 — but in a special \"pro forma\" version where almost every field stays blank. The 1120 exists only as an envelope for Form 5472 (the form that actually matters). This is exactly how it works, what to fill in, what to leave empty, how to assemble the full package, and why filing 1120 doesn't subject your LLC to US corporate income tax.",
    sections: [
      {
        heading: "Why a foreign-owned LLC files 1120 at all",
        body: "Your LLC is a \"disregarded entity\" by default — meaning it doesn't pay corporate income tax. The LLC's income flows through to you, the owner, taxable in your home country only (with rare exceptions for US-source effectively connected income).\n\nSo why file Form 1120 (the corporate income tax return)? Because IRS regulations require Form 5472 to be attached to a tax return. For foreign-owned disregarded entities, the IRS picked Form 1120 as the procedural attachment vehicle when they extended §6038A to single-member LLCs in 2017.\n\nYou file a pro forma (mostly blank) 1120 as the cover sheet for your Form 5472. This does NOT make your LLC subject to US corporate tax. The pro forma 1120 is paperwork only — your LLC remains a disregarded entity for all other tax purposes.",
      },
      {
        heading: "What 'pro forma' means in this context",
        body: "Pro forma means \"as a matter of form\" — filed for procedural compliance, not to calculate tax.\n\nA real Form 1120 (filed by US C-corporations) has all income/deduction/tax fields filled in. A pro forma 1120 (filed by foreign-owned DEs) has only the entity identification fields filled in.\n\nThe special signal that tells the IRS you're filing pro forma: the stamp \"Foreign-Owned U.S. DE\" at the top of page 1. Without that stamp, the IRS may attempt to process the return as a real corporate filing — triggering deficiency notices, tax bills, or refund offsets that are all incorrect for a disregarded entity.",
      },
      {
        heading: "Boxes you fill in",
        body: "Page 1, header section:\n• Entity name (exactly as on CP-575 EIN confirmation letter).\n• EIN.\n• US business address (typically your registered agent's address).\n• Date of incorporation (from your Articles of Organization).\n• Total assets at year-end (Item D, also shown on Schedule L line 15 column (d)).\n• Item E — check \"Initial return\" if this is your first year, \"Final return\" if dissolving, else blank.\n\nTop margin of page 1:\n• Write or stamp: \"Foreign-Owned U.S. DE\".\n\nSignature block (bottom of page 1):\n• Sign in pen.\n• Date.\n• Print name.\n• Title: \"Member\" or \"Owner\".\n\nSchedule L (page 6 of standard 1120):\n• Line 15, column (d): total assets at year-end. Must match Item D above.\n\nThat's it. Maybe 8 fields total across the entire form.",
      },
      {
        heading: "Boxes you LEAVE BLANK",
        body: "Pages 2-5 of Form 1120 contain income, deductions, tax calculation, and various schedules. For pro forma filings by foreign-owned DEs:\n\n• Income section (lines 1-11): blank.\n• Cost of Goods Sold (line 2): blank — don't attach Form 1125-A.\n• Officer compensation (line 12): blank — don't attach Form 1125-E.\n• All other deductions (lines 12-29): blank.\n• Tax computation (lines 30-37): blank.\n• Schedule C (Dividends, Inclusions, Special Deductions): blank.\n• Schedule J (Tax Computation and Payment): blank.\n• Schedule K (Other Information): blank unless something specifically applies.\n• Schedule L (Balance Sheets per Books): only line 15 (d). Other lines blank.\n• Schedule M-1 (Reconciliation of Income per Books with Income per Return): blank.\n• Schedule M-2 (Analysis of Unappropriated Retained Earnings): blank.\n\nThis isn't a mistake or oversight. The IRS instructions explicitly state pro forma 1120 for foreign-owned DEs is filed with these sections empty. Filling them in could incorrectly trigger US corporate income tax processing.\n\nLeave them truly blank — don't write \"0\", don't write \"N/A\". Empty.",
      },
      {
        heading: "Signing the pro forma 1120",
        body: "The signature line at the bottom of page 1 must be signed by you (the owner) in pen. The IRS does not accept digital-only signatures on Form 5472 + attached pro forma 1120 — pen/ink only.\n\nDate the form on the date you actually sign — not the tax year end.\n\nTitle yourself \"Member\" or \"Owner\" — both acceptable for a single-member LLC.\n\nPrint your name below the signature line for legibility.\n\nPaid preparer block: leave blank if you prepared it yourself. If our service prepared it for you, we leave it blank too — you are the filer of record, not us.",
      },
      {
        heading: "Filing the package",
        body: "1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 (signed, stamped \"Foreign-Owned U.S. DE\").\n3. Form 5472 attached behind the 1120.\n4. Part V supporting statement listing each reportable transaction.\n5. Reasonable Cause Statement (only if late under DIIRSP).\n\nFax the complete package to the IRS Ogden PIN Unit at +1-855-887-7737. Save the transmission receipt as your proof of timely filing.\n\nDo NOT mail or fax Form 1120 to the regular IRS processing center. The Ogden PIN Unit is the only correct destination for foreign-owned DE filings — sending it elsewhere will cause routing problems and may not satisfy your filing obligation.\n\nMail alternative: Internal Revenue Service, Ogden, UT 84201-0023. Use certified mail with return receipt as proof of timely filing.",
      },
      {
        heading: "Common mistakes specific to pro forma 1120",
        body: "• Filling in income or deductions: treats the LLC as a real C-corp and can trigger tax processing. Leave those lines empty.\n• Missing the \"Foreign-Owned U.S. DE\" stamp: causes routing issues at Ogden.\n• Forgetting to sign in pen: digital-only signatures may be rejected.\n• Attaching Form 1125-A (Cost of Goods Sold) or 1125-E (Officer Comp): not needed and confuses processing.\n• Wrong tax year on the form header: must be the tax year that ENDED, not the year you're filing in.\n• Wrong EIN: must match CP-575 exactly.\n• Sending only the 1120 without Form 5472 attached: defeats the entire purpose.\n• Mailing to a regular IRS processing center instead of Ogden PIN Unit.\n• Filing electronically: not supported for foreign-owned DEs.",
      },
      {
        heading: "Foreign-owned multi-member LLCs are different",
        body: "If your LLC has 2+ members, it's NOT a disregarded entity — it's a partnership for tax purposes. Multi-member LLCs file Form 1065 (US Return of Partnership Income), not Form 1120.\n\nWith foreign partners, the multi-member LLC may also need Form 8865 (Information Return of US Persons With Respect to Certain Foreign Partnerships) and Schedule K-1 for each partner. The compliance is significantly more complex than the single-member case.\n\nOur service is built specifically for single-member, foreign-owned, disregarded LLCs. Multi-member LLCs need a CPA familiar with international partnerships.",
      },
      {
        heading: "State 1120 filings",
        body: "Some states require their own corporate income tax return separate from the federal 1120. Whether you owe a state 1120 depends on the state of formation and where you conduct business:\n\n• Wyoming: no state corporate income tax. No state 1120.\n• Delaware: no state corporate income tax on LLCs that don't conduct business in DE. Just the $300 franchise tax.\n• Florida: no state corporate income tax (LLCs taxed as DEs).\n• Nevada: no state corporate income tax.\n• Texas: franchise tax but $0 due for most small LLCs; report still required.\n• New Mexico: no state income tax on disregarded LLCs.\n• California, New York, others: state corporate income tax may apply if your LLC has any nexus with the state.\n\nFor the popular foreign-owner states (Wyoming, Delaware, NM, FL, NV), no state 1120 equivalent is required. Just the federal pro forma 1120.",
      },
      {
        heading: "Get it done in 15 minutes",
        body: "Our service generates a perfectly-formatted pro forma 1120 + Form 5472 package automatically. You answer 12 questions in a wizard, we generate the PDF, you sign one page on screen (the signature embeds into every required signature box), and an accountant on our team reviews everything before we fax it to the IRS.\n\nPricing: Standard $199 · Rush $279 · Premium $449 (IRS fax delivery included). +$149 per additional past year for multi-year DIIRSP catch-up. 100% money-back guarantee if we fail to submit your filing.",
      },
    ],
    faqs: [
      {
        q: "Does filing pro forma 1120 mean my LLC owes US corporate income tax?",
        a: "No. The pro forma 1120 is procedural only. Your LLC remains a disregarded entity for tax purposes and doesn't pay US corporate income tax. The blank income/tax fields and \"Foreign-Owned U.S. DE\" stamp tell the IRS to treat this as a pro forma filing.",
      },
      {
        q: "Do I file a state Form 1120?",
        a: "Only if you formed in a state with corporate income tax (California, New York, etc.) or have nexus there. Wyoming, Delaware, Florida, Nevada, Texas, and New Mexico don't have state corporate income tax on LLCs.",
      },
      {
        q: "Can I file Form 1120 electronically (e-file)?",
        a: "No. Foreign-owned disregarded entities are explicitly excluded from e-filing for Form 1120 and Form 5472. Fax to +1-855-887-7737 or mail to IRS Ogden, UT 84201-0023 only.",
      },
      {
        q: "Do I attach a Schedule C for cost of goods sold?",
        a: "No. Schedule C of Form 1120 is for dividends and special deductions (different from the Schedule C on Form 1040). For pro forma 1120, no Schedule C attachment is needed — your LLC is disregarded.",
      },
      {
        q: "What if I made a mistake on a prior year's pro forma 1120?",
        a: "File an amended return for that year. Check the \"Amended return\" box at the top of Form 1120, attach an updated Form 5472 if it changed, and include a brief explanation. Amendments don't waive any penalty already assessed.",
      },
      {
        q: "Can the 1120 signature be a digital signature?",
        a: "Per current IRS practice, pen/ink signatures are required. In-portal canvas signatures embedded in a printable PDF have been accepted in practice, but a wet-ink signature on a printed page is the safest path. Many of our customers print, sign in pen, then fax.",
      },
      {
        q: "Do I file pro forma 1120 if my LLC is dormant?",
        a: "If your LLC had any reportable transaction (even one capital contribution), yes. If truly $0 activity for the year, you may have an argument that no filing is required — but most owners file regardless to avoid the $25,000 penalty risk.",
      },
      {
        q: "What address do I put on the 1120?",
        a: "The US business address shown on your CP-575 EIN confirmation letter — typically your registered agent's address. The IRS will mail any notices here, so make sure it can actually receive mail.",
      },
      {
        q: "Does pro forma 1120 work for tax year 2025?",
        a: "Yes. The pro forma 1120 format applies to any tax year since the §6038A rule extension to foreign-owned DEs in 2017. The form's structure may change slightly year to year (always download the current year's blank form from irs.gov), but the pro forma approach is the same.",
      },
      {
        q: "What if I owe US tax — should I still file pro forma?",
        a: "No. If your LLC genuinely owes US corporate income tax (rare for foreign-owned single-member LLCs but possible with US warehouse/employees/real estate), file a full Form 1120 with income, deductions, and tax. Consult a CPA familiar with foreign owners — our service doesn't handle the full-1120 case.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-5472-vs-1120", "file-form-5472", "form-1120-disregarded-entity", "1120-pro-forma-instructions"],
  },
  {
    slug: "form-1120-disregarded-entity",
    keyword: "form 1120 disregarded entity",
    title: "Form 1120 for a Disregarded Entity — Foreign Owner Filing",
    metaDescription:
      "How to file pro forma Form 1120 for a foreign-owned disregarded entity. Required as an attachment to Form 5472. Step-by-step guide + accountant-reviewed online filing.",
    h1: "Form 1120 for a Disregarded Entity (Foreign Owner)",
    intro:
      "A US LLC owned by a single non-US person is a \"disregarded entity\" — meaning the IRS treats it as if it doesn't exist for income tax purposes. So why does it file Form 1120? Because Treasury Regulation § 1.6038A-1 requires Form 5472 to be attached to a tax return, and a pro forma Form 1120 is the IRS-specified attachment vehicle. This is the complete explanation, the regulation's history, what the filing looks like, and how to avoid the common pitfalls.",
    sections: [
      {
        heading: "What is a disregarded entity?",
        body: "A disregarded entity (DE) is a business entity (usually an LLC) that has just one owner and hasn't elected to be taxed as a corporation. The IRS \"disregards\" the entity for federal income tax purposes — meaning income and deductions flow through to the owner directly, as if the entity didn't exist.\n\nFor a US LLC owned by one non-US person, the LLC is automatically a disregarded entity unless you affirmatively elect C-corp or S-corp taxation by filing Form 8832 (most foreign owners shouldn't do this).\n\nThe disregarded-entity status means:\n• The LLC has no separate US income tax liability.\n• Income/losses flow to the owner's personal tax situation.\n• For a foreign owner with no US trade or business and no US-source income, this typically means $0 in US federal income tax.\n• The LLC still legally exists at the state level (Wyoming, Delaware, etc.) as a separate entity for liability protection.",
      },
      {
        heading: "Why a disregarded entity files Form 1120",
        body: "Disregarded entities don't normally file Form 1120 — that's a corporate income tax return for actual corporations.\n\nThe exception is foreign-owned single-member LLCs treated as DEs. Since 2017, Treasury Regulation § 1.6038A-1 says these entities are treated as separate domestic corporations \"solely for purposes of\" Form 5472 reporting under IRC § 6038A. So they file Form 5472 — and the only way the IRS accepts Form 5472 is as an attachment to Form 1120.\n\nThe 1120 is filed \"pro forma\" — mostly empty — as a procedural cover sheet. Filling it in fully would incorrectly suggest your LLC is a real C-corp.\n\nThe procedural status (file 1120 as the envelope for 5472) does not change the substantive tax status (LLC remains disregarded, owes no corporate tax).",
      },
      {
        heading: "The regulatory history — why 2017",
        body: "Before 2017, foreign-owned single-member US LLCs weren't required to file Form 5472. The IRS treated them purely as disregarded entities with no federal filing obligation. As a result, foreign owners could form a US LLC, move large amounts of money through it, and never disclose anything to the US government.\n\nThis became a known transparency loophole — non-US persons could use US LLCs to obscure beneficial ownership for tax avoidance, money laundering, or sanctions evasion.\n\nIn December 2016, the IRS issued final regulations under § 1.6038A-1 extending §6038A reporting to foreign-owned domestic disregarded entities, effective for tax years beginning January 1, 2017. The regulation specifically created the \"pro forma 1120 as attachment vehicle\" approach because there was no existing form for disclosure-only filings.\n\nSince then, every foreign-owned single-member US LLC has had to file Form 5472 + pro forma 1120 annually. Penalty: $25,000 per missed form per year under IRC § 6038A(d).",
      },
      {
        heading: "What the pro forma 1120 looks like",
        body: "Header section (page 1 top):\n• \"Foreign-Owned U.S. DE\" stamped or written across the top margin.\n• Entity name, EIN, US business address.\n• Date of incorporation.\n• Item D — total assets at year-end.\n• Item E — Initial return / Final return / blank.\n• Signature block at the bottom: signed in pen.\n\nBody (pages 2-4):\n• Empty. No income, no deductions, no tax calculation, no schedules.\n\nSchedule L:\n• Only line 15, column (d) — total assets at year-end. Must match Item D.\n\nAll other schedules:\n• Blank.\n\nThat's the entire pro forma 1120 filing. Then Form 5472 + Part V supporting statement attached behind it.",
      },
      {
        heading: "What 'solely for purposes of' means in practice",
        body: "The regulation's phrasing — \"solely for purposes of Section 6038A reporting\" — is important. It limits the corporate treatment to one narrow purpose: making the LLC file Form 5472.\n\nIt does NOT:\n• Make the LLC subject to US corporate income tax.\n• Change the LLC's disregarded status for other tax purposes.\n• Require the LLC to file estimated tax payments.\n• Create employee withholding obligations.\n• Require quarterly returns.\n• Make the LLC liable for accumulated earnings tax or personal holding company tax.\n• Trigger 1120-W estimated tax requirements.\n\nThe LLC is treated as a corporation ONLY to satisfy the procedural requirement that Form 5472 attach to a tax return. For everything else (income tax liability, owner's personal taxation, state tax treatment), the LLC stays a disregarded entity.",
      },
      {
        heading: "Where to file",
        body: "Foreign-owned DE filings go ONLY to the IRS Ogden PIN Unit:\n\n• Fax: +1-855-887-7737 (preferred — fast, with a timestamped transmission receipt as proof of filing).\n• Mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 (use certified mail with return receipt for proof).\n\nDo NOT send to the regular Form 1120 processing addresses listed in the standard 1120 instructions. Those addresses are for real corporate returns and your pro forma filing will be misrouted or treated as a real corporate filing — which can trigger collection notices and tax liability for tax you don't actually owe.\n\nThe Ogden PIN Unit is the dedicated team within IRS Ogden that handles foreign-owned DE filings. The \"Foreign-Owned U.S. DE\" stamp on the 1120 is what tells them to route to this team.",
      },
      {
        heading: "What if you elect C-corp taxation?",
        body: "If you actively elect C-corp taxation by filing Form 8832 (Entity Classification Election), your LLC is no longer a disregarded entity. It becomes a real US corporation that owes corporate income tax (currently 21% federal flat rate) on its worldwide income — including all foreign-source revenue.\n\nFor most foreign owners, this is a bad idea:\n• You'd owe US tax on profits earned abroad selling to non-US customers.\n• You'd need to file full Form 1120 (not pro forma) with income, deductions, and tax calculation.\n• Distributions to you would be dividends — potentially subject to 30% US withholding (or treaty rate).\n• Your US tax bill could go from $0 to substantial.\n\nKeep the default disregarded entity classification unless you've consulted a US tax professional about a specific reason to elect C-corp status (e.g. you're optimizing for a future US sale of the entity).",
      },
      {
        heading: "What if you elect S-corp taxation?",
        body: "Don't. You can't.\n\nS-corporations require all owners to be US persons (US citizens, green-card holders, US tax residents). A foreign-person owner disqualifies S-corp eligibility.\n\nIf you (a foreign person) try to elect S-corp status for your US LLC, the IRS will reject the election. If you somehow filed S-corp returns despite ineligibility, the IRS would unwind it and assess back taxes.\n\nIgnore S-corp paths entirely if you're a foreign owner. Disregarded entity (default) or C-corp election (Form 8832) are your only legitimate options.",
      },
      {
        heading: "Common confusions",
        body: "\"My LLC is disregarded, so I don't file anything?\" — Wrong. Disregarded means no separate income tax computation; it does NOT mean no filings. Foreign-owned DEs still file Form 5472 + pro forma 1120 annually.\n\n\"If I file Form 1120, am I a corporation now?\" — No. Pro forma 1120 is a procedural vehicle. Your LLC stays disregarded.\n\n\"My CPA says I need a real Form 1120 with income.\" — Get a second opinion. Most CPAs see foreign-owned DE filings once or twice in their career. A full 1120 is wrong unless you've elected C-corp via Form 8832.\n\n\"Can I just file Form 5472 by itself?\" — No. The IRS requires it to be attached to a tax return. Pro forma 1120 is that attachment.\n\n\"My LLC had no transactions — am I still disregarded?\" — Yes, the disregarded status is independent of activity. Whether you file Form 5472 depends on whether you had reportable transactions, but the entity classification doesn't change.",
      },
      {
        heading: "Skip the paperwork — 15-minute filing",
        body: "Form5472 Prep generates the complete disregarded entity filing package automatically:\n\n• Cover letter.\n• Pro forma Form 1120 with \"Foreign-Owned U.S. DE\" stamp, entity info, signature line.\n• Form 5472 (Parts I, II, III, IV, V, VII).\n• Part V supporting statement listing each reportable transaction.\n• Reasonable Cause Statement (if filing late under DIIRSP).\n\nYou answer 12 questions in the wizard, sign once on screen (the signature embeds into every required signature box), an accountant on our team reviews everything, and we fax to the IRS Ogden PIN Unit. You get the timestamped receipt as proof of filing.\n\n• 1 year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 years (DIIRSP): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 years (DIIRSP): Standard $497 · Rush $577 · Premium $747 (fax included)\n\n100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "How do I know if my LLC is a disregarded entity?",
        a: "If your LLC has one owner and you've never filed Form 8832 to elect C-corp or S-corp taxation, it's a disregarded entity by default. Check your IRS correspondence — none of it should reference 1120-S or formal C-corp status.",
      },
      {
        q: "What if my LLC has more than one owner?",
        a: "If a US LLC has multiple owners, it's a partnership by default — not a disregarded entity. Multi-member LLCs file Form 1065, not 1120, and the Form 5472 rules apply differently. Our service handles single-member only.",
      },
      {
        q: "Does the disregarded entity have to file a US tax return?",
        a: "The disregarded entity doesn't compute its own income tax (it's disregarded for tax computation), but it must file pro forma Form 1120 + Form 5472 as an information return if it had any reportable transactions. So yes, there's still a filing — just not a real tax-paying one.",
      },
      {
        q: "Does the §6038A regulation cover foreign owners or all owners?",
        a: "It covers any 25%+ foreign ownership of a US corporation OR foreign ownership of a US disregarded single-member LLC. US-owned single-member LLCs are NOT subject to §6038A reporting — only foreign-owned ones since 2017.",
      },
      {
        q: "Can I file Form 5472 without pro forma 1120 if I qualify some exception?",
        a: "No. There's no exception that allows standalone Form 5472 filing for foreign-owned DEs. The pro forma 1120 attachment is mandatory.",
      },
      {
        q: "What's the difference between a disregarded entity and a partnership?",
        a: "Disregarded entity = single-owner LLC, treated as if it doesn't exist for income tax. Partnership = multi-owner LLC, files Form 1065 to allocate income to partners. Adding a second member changes the classification.",
      },
      {
        q: "If I add a partner to my disregarded LLC, what happens?",
        a: "It becomes a partnership for tax purposes (no longer disregarded). You'd file Form 1065 instead of pro forma 1120 + Form 5472. The change is automatic — no election needed. Talk to a CPA before adding members; the tax implications are significant.",
      },
      {
        q: "Are LLCs the only disregarded entities?",
        a: "No. Other entities can be disregarded too (qualified subchapter S subsidiaries, certain grantor trusts), but for foreign-owner purposes the typical disregarded entity is a single-member LLC.",
      },
      {
        q: "Does my LLC need a separate EIN if it's disregarded?",
        a: "Yes. Even though it's disregarded for income tax, it still needs an EIN to open bank accounts, file Form 5472, hire contractors with 1099 reporting, etc. The EIN is required for the entity even when the entity is disregarded.",
      },
      {
        q: "If I'm disregarded, can I just put my LLC's income on my personal return?",
        a: "For US owners, yes — they'd file Schedule C on Form 1040. For non-US owners, the LLC's income flows to you, but you don't file a US personal return unless you have US-source income personally. Most foreign owners don't, and the only US filing they make is the pro forma 1120 + Form 5472 for the LLC.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-5472-vs-1120", "single-member-llc-foreign-owner", "foreign-owned-llc-tax"],
  },
  {
    slug: "1120-pro-forma-instructions",
    keyword: "1120 pro forma instructions",
    title: "1120 Pro Forma Instructions — What to Fill, What to Leave Blank",
    metaDescription:
      "Field-by-field instructions for filling out pro forma Form 1120 for a foreign-owned US LLC. Avoid the common mistakes that trigger IRS notices. Accountant-reviewed filings from $199.",
    h1: "1120 Pro Forma Instructions (Foreign-Owned LLCs)",
    intro:
      "Filling out a pro forma Form 1120 is completely different from a real corporate tax return. You complete almost nothing — fewer than 10 fields total. Below is the field-by-field breakdown of what to fill in, what to leave blank, the schedules to ignore, signature requirements, and the common mistakes that cause the IRS to misprocess your filing as if it were a real corporate return.",
    sections: [
      {
        heading: "Before you start — what you need",
        body: "Gather these before opening Form 1120:\n\n• Your LLC's CP-575 EIN confirmation letter from the IRS (gives the legal name, EIN, and US address exactly as the IRS has them on file).\n• Date of your LLC's formation (on your Articles of Organization).\n• Year-end total assets in USD — sum of cash + receivables + inventory + fixed assets as of December 31.\n• A pen for signing (no digital-only signatures).\n\nIf you're using the IRS's official PDF, download the current tax year's blank Form 1120 from irs.gov. Don't use a prior-year form for a current-year filing — the IRS rejects out-of-year forms.\n\nIf you're using our service, the wizard generates a pre-filled 1120 from your answers; you don't need to download anything.",
      },
      {
        heading: "Page 1 header — fully filled in",
        body: "Top of page 1, above all other content:\n• Write or stamp: \"Foreign-Owned U.S. DE\"\n\nName / Address block (top-left):\n• Entity name — exactly as on your EIN confirmation letter (CP-575). Watch for capitalization and abbreviations the IRS uses.\n• Number, street, and room/suite — your US business address (registered agent address is fine).\n• City, state, ZIP code.\n\nItems A through E (top-right):\n• A: Check \"Initial return\" if this is your LLC's first year. Otherwise blank (or \"Final return\" if dissolving).\n• B: Employer Identification Number — your 9-digit EIN.\n• C: Date incorporated — your LLC's formation date (MM/DD/YYYY).\n• D: Total assets — year-end total in USD, from Schedule L line 15 column (d). Round to nearest dollar.\n• E: Check applicable boxes — usually all blank for a pro forma filing.\n\nThat's everything for the header. Filling out the rest of page 1 (income, deductions, tax) would be incorrect.",
      },
      {
        heading: "Income section (lines 1-11) — LEAVE BLANK",
        body: "Lines 1a through 11 cover:\n• 1a: Gross receipts or sales.\n• 1b: Returns and allowances.\n• 1c: Net (subtract 1b from 1a).\n• 2: Cost of goods sold.\n• 3: Gross profit.\n• 4: Dividends and inclusions.\n• 5: Interest.\n• 6: Gross rents.\n• 7: Gross royalties.\n• 8: Capital gain net income.\n• 9: Net gain or loss from Form 4797.\n• 10: Other income.\n• 11: Total income.\n\nALL of these lines stay blank on a pro forma filing. Don't write \"0\", don't write \"N/A\", don't write anything. Leave the line untouched.\n\nWhy: writing zeros could be interpreted as a complete (incorrect) income tax return rather than a pro forma information envelope. The IRS may then process it as a real corporate return, generate notices, request schedules, or assess tax. Empty fields signal \"pro forma — informational only\".",
      },
      {
        heading: "Deductions section (lines 12-29) — LEAVE BLANK",
        body: "Lines 12 through 29 cover:\n• 12: Compensation of officers.\n• 13: Salaries and wages.\n• 14: Repairs and maintenance.\n• 15: Bad debts.\n• 16: Rents.\n• 17: Taxes and licenses.\n• 18: Interest.\n• 19: Charitable contributions.\n• 20: Depreciation.\n• 21: Depletion.\n• 22: Advertising.\n• 23: Pension, profit-sharing, etc.\n• 24: Employee benefit programs.\n• 25: Reserved.\n• 26: Other deductions.\n• 27: Total deductions.\n• 28: Taxable income before NOL deduction and special deductions.\n• 29a: Net operating loss deduction.\n• 29b: Special deductions.\n• 29c: Total.\n\nALL blank on a pro forma filing. Same reasoning as the income section.",
      },
      {
        heading: "Tax, refundable credits, and payments (lines 30-37) — LEAVE BLANK",
        body: "Lines 30 through 37 cover:\n• 30: Taxable income.\n• 31: Total tax.\n• 32: Reserved.\n• 33: Total payments and credits.\n• 34: Estimated tax penalty.\n• 35: Amount owed.\n• 36: Overpayment.\n• 37: Refunded vs. applied to estimated tax.\n\nAll blank. Your LLC isn't computing tax. The pro forma 1120 is informational only — there's no liability to calculate, no payment to remit, no refund to claim.",
      },
      {
        heading: "Schedules — what to do",
        body: "Schedule C (Dividends, Inclusions, Special Deductions): blank.\nSchedule J (Tax Computation and Payment): blank.\nSchedule K (Other Information): blank in most cases. If your LLC has any unusual item the schedule asks about (foreign accounts, related-party debt, etc.), only fill in the specific applicable lines.\nSchedule L (Balance Sheet per Books):\n• Beginning of year (column (a)) and end of year (column (d)) — only line 15 (Total assets) in column (d) needs a value. Must match Item D on page 1.\n• All other balance sheet lines: blank.\nSchedule M-1 (Reconciliation of Income per Books with Income per Return): blank.\nSchedule M-2 (Analysis of Unappropriated Retained Earnings): blank.\n\nIf you encounter a schedule that asks for information the pro forma instructions don't require, leave it blank. The IRS does not expect a foreign-owned DE's pro forma 1120 to have populated schedules beyond Schedule L line 15 (d).",
      },
      {
        heading: "Signature block",
        body: "Sign on the signature line at the bottom of page 1 in PEN. The IRS does not accept digital-only signatures for Form 5472 + attached pro forma 1120.\n\n• Signature: in pen, on the printed form.\n• Date: when you actually sign (not the tax year end).\n• Title: \"Member\" or \"Owner\" or \"Sole Member\" — all acceptable for a single-member LLC.\n• Print name: write or type your name below the signature line for legibility.\n\nPaid Preparer Use Only block (separate row):\n• Leave blank if you're filing yourself.\n• If a preparer (CPA, our service, etc.) prepared the return but isn't the filer of record, also leave blank.\n• Only fill in if you have a paid preparer who is signing as the responsible preparer (uncommon for foreign-owned DEs).",
      },
      {
        heading: "Common mistakes that trigger IRS notices",
        body: "• Writing zeros in the income section — IRS may process it as a real (zero-income) tax return and ask follow-up questions about why income is zero.\n• Forgetting the \"Foreign-Owned U.S. DE\" stamp at the top of page 1 — the most common routing error.\n• Filling in Schedule L with a complete balance sheet (only line 15 column (d) is needed).\n• Signing digitally only — the IRS requires pen/ink signatures.\n• Mailing to the wrong IRS address — must go to Ogden PIN Unit, not the regular 1120 processing center.\n• Forgetting to attach Form 5472 + Part V supporting statement (the whole point of the pro forma 1120).\n• Using a prior-year version of Form 1120 — always use the current tax year's blank form.\n• Wrong EIN (typo) — must match CP-575 exactly.\n• Wrong tax year on the form header — must be the tax year that ENDED, not the year you're filing in.\n• Reporting amounts in non-USD — always convert to USD.\n• Filing without an attached cover letter — not strictly required by the IRS instructions but recommended for clean routing.",
      },
      {
        heading: "Assembly order for the package",
        body: "1. Cover letter (1 page) — identifies the filing, lists the LLC, EIN, tax year, and forms included.\n2. Pro forma Form 1120 (signed, stamped \"Foreign-Owned U.S. DE\") — the procedural envelope.\n3. Form 5472 (2 pages) — Parts I, II, III, IV, V, VII.\n4. Part V supporting statement (1+ pages) — list of reportable transactions.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nFax destination: +1-855-887-7737 (IRS Ogden PIN Unit).\nMail destination: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 (certified mail recommended).\n\nKeep your fax transmission receipt as proof of timely filing. The receipt's timestamp is your legal filing date.",
      },
      {
        heading: "Use our pre-filled pro forma 1120",
        body: "Our wizard generates a pre-filled, signature-ready pro forma 1120 that follows every instruction above:\n\n• \"Foreign-Owned U.S. DE\" stamp at the top.\n• Header section pre-filled from your wizard answers.\n• Income, deductions, tax sections correctly empty.\n• Schedule L line 15 (d) pre-filled with the year-end total assets you entered.\n• Signature line ready for your in-portal canvas signature.\n• Form 5472 + Part V supporting statement assembled behind it.\n\nStandard $199 · Rush $279 · Premium $449. IRS fax delivery included on every plan. +$149 per additional past year. Every package is reviewed by an accountant on our team before submission. 100% money-back guarantee if we fail to submit.",
      },
    ],
    faqs: [
      {
        q: "Should I write 'N/A' or 'None' in blank fields?",
        a: "No. Leave the fields completely untouched. The IRS instructions for pro forma filings specify the unused sections stay blank, not marked. Writing N/A or 0 can cause the return to be processed as a real corporate filing.",
      },
      {
        q: "What if I don't know my LLC's total assets at year-end?",
        a: "It's usually the ending balance in your business bank account, plus any receivables, inventory, or equipment. If your LLC only has a bank account, use that ending balance. The IRS doesn't require itemized breakdown — just the total.",
      },
      {
        q: "Can I print a blank 1120 PDF and fill it by hand?",
        a: "Yes, the IRS accepts handwritten Form 1120. Use blue or black ink, write neatly, and stamp \"Foreign-Owned U.S. DE\" at the top. Our service generates a typed PDF you can sign — far fewer transcription errors than handwriting.",
      },
      {
        q: "Which tax-year version of Form 1120 do I use?",
        a: "The form for the tax year that ENDED. For tax year 2024 (filed by April 15, 2025), use the 2024 Form 1120. Always download the current year's blank form from irs.gov — last year's form may have field number changes that cause issues.",
      },
      {
        q: "Do I attach the IRS instructions to my filing?",
        a: "No. The IRS doesn't need the instructions back — those are reference for you. Only the forms themselves (1120, 5472, Part V supporting statement, cover letter, reasonable cause statement if applicable) go in the package.",
      },
      {
        q: "What if I made a mistake after filing?",
        a: "File an amended return. Check the \"Amended return\" box at the top of Form 1120, correct the errors, and attach a brief explanation. Amendments don't waive any penalty already assessed but they correct the underlying record.",
      },
      {
        q: "Can I use a foreign address on the 1120?",
        a: "No. The 1120 expects a US address — typically your registered agent's address. Your personal foreign address goes on Form 5472 Part II as the owner address.",
      },
      {
        q: "Do I need to attach Form 4562 for depreciation?",
        a: "No. Form 4562 is for depreciation on a real corporate return. Pro forma 1120 has no depreciation deduction (the deductions section is blank), so 4562 doesn't apply.",
      },
      {
        q: "What if Schedule K asks about foreign accounts and my LLC has a non-US bank account?",
        a: "Most foreign-owned DEs bank with US-based services (Mercury, Wise USD, Relay). If your LLC has a non-US financial account, you may need to answer the Schedule K foreign-account questions and potentially file FBAR for the LLC. Talk to a tax professional if this applies — our wizard's standard package assumes US-based banking.",
      },
      {
        q: "Where can I see what a completed pro forma 1120 looks like?",
        a: "Run our wizard with sample data — at the PDF preview step you'll see exactly what gets faxed to the IRS. The pro forma 1120 page shows the \"Foreign-Owned U.S. DE\" stamp, filled header, empty body, and signature-ready format.",
      },
    ],
    relatedSlugs: ["pro-forma-1120", "form-1120-foreign-owned-llc", "form-1120-disregarded-entity", "form-5472-instructions", "file-form-5472"],
  },
  {
    slug: "irs-form-5472",
    keyword: "irs form 5472",
    title: "IRS Form 5472: What It Is, Who Files, and How (2026)",
    metaDescription:
      "Plain-English guide to IRS Form 5472 for foreign-owned US LLCs. Who must file, when, the $25,000 penalty, how to file, and the fastest way to do it online — accountant-reviewed.",
    h1: "IRS Form 5472 — the complete guide for foreign-owned LLCs",
    intro:
      "IRS Form 5472 is the information return that foreign-owned US single-member LLCs must file every year with an attached pro forma Form 1120. Skip the form and the IRS charges $25,000 per year, per form. We prepare the full package in 15 minutes — every order is reviewed by an accountant on our team before we fax it to the IRS Ogden PIN Unit. This is the complete guide: who has to file, what's in the package, when it's due, what the penalty looks like in practice, and how to get caught up if you've missed prior years.",
    sections: [
      {
        heading: "What is IRS Form 5472?",
        body: "Form 5472 — full title \"Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business\" — is the IRS's mechanism for tracking related-party transactions between foreign owners and their US-based entities.\n\nIts purpose: transparency. The IRS wants visibility into money flowing between non-US persons and US entities they control, even when no US tax is actually owed. It's not a tax return — it's an information return.\n\nSince 2017, single-member LLCs owned by non-US persons are treated as corporations for the purpose of Section 6038A reporting under Treasury Regulation § 1.6038A-1. That means even a one-person Wyoming or Delaware LLC owned by someone abroad has to file Form 5472 every year, attached to a stripped-down (pro forma) Form 1120.\n\nThe regulation closed a transparency loophole: before 2017, foreign-owned single-member US LLCs were invisible to the IRS for disclosure purposes. After 2017, they must report every related-party transaction annually or face the $25,000-per-form-per-year penalty.",
      },
      {
        heading: "Who has to file Form 5472?",
        body: "You must file if all three are true:\n\n1. You own a single-member US LLC (any state — Wyoming, Delaware, Florida, New Mexico, Nevada, etc.).\n2. You are NOT a US person — not a US citizen, not a green card holder, not a US tax resident.\n3. The LLC had at least one reportable transaction in the year — capital contributions in, distributions out, payments to/from the owner, loans, or any related-party transaction.\n\nA reportable transaction is broad. The list of what counts:\n• Capital contributed to the LLC (e.g. wiring USD into the bank account).\n• Distributions taken from the LLC (e.g. paying yourself).\n• Loans from you to the LLC (or LLC to you).\n• Rent / royalties / interest paid to or from you.\n• Payments to or from any other foreign entity you control.\n• Sales of property between you and the LLC.\n\nEven moving money into the LLC to fund operations counts. So in practice almost every foreign-owned LLC needs to file Form 5472 every year, even with zero revenue. The exception is a truly dormant LLC with no bank account and no money in or out — rare.",
      },
      {
        heading: "What's the penalty for not filing?",
        body: "$25,000 per year, per form. Then another $25,000 for every 30-day period after IRS notice if you still don't file. The penalty is automatic — no warning notice required from the IRS before assessment — and it applies even if your LLC made no money and owes zero US tax.\n\nExample: own 2 foreign LLCs, missed 3 years on each. 6 forms × $25,000 = $150,000 in potential penalty exposure.\n\nThe penalty is for failure to file the disclosure return, NOT for unpaid tax. Most foreign-owned single-member LLCs owe $0 in US federal income tax — the penalty applies regardless.\n\nIf you've missed prior years, you can catch up under DIIRSP (Delinquent International Information Return Submission Procedure) by filing all missed years with a reasonable cause statement requesting penalty abatement. Most well-documented first-time catch-ups are accepted with no penalty assessed.",
      },
      {
        heading: "What's in the filing package",
        body: "The complete Form 5472 filing package contains:\n\n1. Cover letter (1 page) identifying the filing — LLC name, EIN, tax year, forms included.\n2. Pro forma Form 1120 (1-2 pages) — entity identification fields only, with \"Foreign-Owned U.S. DE\" stamped across the top. Income, deductions, and tax sections all blank.\n3. Form 5472 (2 pages) — Parts I (reporting corporation), II (25% foreign shareholder), III (related party), IV (monetary transactions, often blank), V (reportable transactions — capital contributions and distributions), VII (FDE confirmation).\n4. Part V supporting statement (1+ pages) — list of each reportable transaction with date, amount, and description.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nTotal package: typically 5-8 pages. Faxed as one document to the IRS Ogden PIN Unit at +1-855-887-7737, or mailed certified to IRS Ogden, UT 84201-0023.",
      },
      {
        heading: "When it's due",
        body: "April 15 of the year following the tax year (e.g. April 15, 2026 for tax year 2025).\n\nExtensions: file Form 7004 by April 15 for an automatic 6-month extension to October 15. Since Form 5472 is attached to the 1120, the extension covers both forms.\n\nFiscal-year LLCs: 15th day of the 4th month after fiscal year-end.\n\nFiling date: the postmark or fax transmission timestamp counts as the filing date. Send by midnight on the deadline and you're on time, even if the IRS processes the return weeks later.\n\nMissed the deadline? Don't panic. File under DIIRSP immediately with a reasonable cause statement — the longer you wait, the higher the risk of a CP-15 penalty notice.",
      },
      {
        heading: "How to file IRS Form 5472",
        body: "You can't e-file Form 5472. The IRS only accepts it by mail or fax to the Ogden PIN Unit. The fax route is faster and gives you a transmission receipt as proof of timely filing.\n\n• Fax: +1-855-887-7737 (IRS Ogden PIN Unit).\n• Mail: Internal Revenue Service, Ogden, UT 84201-0023 (use certified mail with return receipt).\n\nOur 15-minute online filer handles the whole package — Form 5472, pro forma Form 1120, Part V supporting statement, cover letter, and reasonable cause statement (if late). Pricing starts at $199 (Standard), we generate everything, you sign once on screen (the signature embeds into every required signature box), an accountant on our team reviews the package end-to-end, and we fax it to the IRS Ogden PIN Unit. IRS fax delivery is included in every plan. You get the timestamped fax transmission receipt as proof of filing.",
      },
      {
        heading: "Form 5472 vs. Form 1120 — what's the difference?",
        body: "Form 5472 is the information return that reports related-party transactions. Form 1120 is the corporate income tax return.\n\nFor a real US C-corporation, Form 1120 is a substantive tax filing — income, deductions, tax computation. For a foreign-owned single-member LLC, Form 1120 is pro forma — most fields blank, used only as a procedural envelope for Form 5472.\n\nForm 5472 by itself is not a valid IRS submission. The IRS requires it to be attached to a tax return. For foreign-owned disregarded entities, the IRS chose Form 1120 as that attachment.\n\nSo you file both, together, as one package: pro forma 1120 in front, Form 5472 + Part V supporting statement attached behind, faxed as one document. The 1120 is the envelope, the 5472 is the letter.",
      },
      {
        heading: "DIIRSP — catching up if you've missed prior years",
        body: "If you've missed Form 5472 for one or more prior years, the IRS provides DIIRSP (Delinquent International Information Return Submission Procedure) as the standard catch-up path. Steps:\n\n1. File the late Form 5472 + pro forma 1120 for each missed year.\n2. Include a Reasonable Cause Statement explaining why the filing was late.\n3. Submit all missed years together as one package.\n4. Fax to +1-855-887-7737 with the reasonable cause statement at the front.\n5. Keep the fax transmission receipt — it's your timestamped proof of DIIRSP submission.\n\nWell-documented first-time catch-ups are accepted at a high rate, with no penalty assessed. The IRS treats voluntary catch-up under DIIRSP far more favorably than waiting for a CP-15 notice and then responding.\n\nOur multi-year DIIRSP packages: 2 years Standard $348, 3 years Standard $497 (fax included; Rush and Premium tiers also available). The Reasonable Cause Statement is auto-generated by our wizard and editable to fit your specific facts.",
      },
      {
        heading: "Pricing",
        body: "• 1 tax year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 tax years (DIIRSP catch-up): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 tax years (DIIRSP catch-up): Standard $497 · Rush $577 · Premium $747 (fax included)\n\nIRS fax delivery to the Ogden PIN Unit at +1-855-887-7737 is included in every plan — no separate fee.\n\nEvery package is reviewed by an accountant on our team before we fax it to the IRS. 100% money-back guarantee if we fail to submit your filing.",
      },
      {
        heading: "Why use our service vs. a CPA or DIY",
        body: "Three ways to file:\n\nDIY with IRS forms ($0 fees, 4-8 hours of careful work): you download blank 1120 and 5472 PDFs from irs.gov, fill them by hand, sign, and fax. Risk: any mistake (missing stamp, blank Part V, wrong signature method) can trigger the $25,000 penalty. Many DIY filings fail compliance review.\n\nUS CPA ($400-$800, 1-2 weeks): most CPAs see foreign-owned DE filings once or twice in their career. They'll typically research the requirements from scratch each time, which makes the turnaround long and the cost high. Some will decline the work entirely.\n\nForm5472 Prep ($199–$449 depending on tier and years, 15 minutes): purpose-built for this exact filing. Wizard pre-fills everything based on 12 simple questions. Generated PDFs follow current IRS instructions. Every package is accountant-reviewed before fax submission. IRS fax delivery included. Money-back guarantee. Reasonable cause statement auto-generated for late filings.\n\nFor the standard foreign-owned single-member LLC profile, our service is dramatically faster and lower-cost than CPA, and dramatically lower risk than DIY.",
      },
    ],
    faqs: [
      {
        q: "Is IRS Form 5472 the same as Form 1120?",
        a: "No. Form 5472 is the information return that reports related-party transactions. Form 1120 is the corporate income tax return that Form 5472 attaches to. Foreign-owned single-member LLCs file a pro forma (stripped-down) 1120 just so the 5472 has somewhere to live.",
      },
      {
        q: "Do I need an EIN before I can file?",
        a: "Yes. Form 5472 requires the LLC's EIN. If you don't have one yet, apply via IRS Form SS-4 — international applicants can fax it to the IRS without a US-issued ID number. Most foreign owners get their EIN within 2-4 weeks.",
      },
      {
        q: "What if my LLC had no income?",
        a: "You still have to file. Form 5472 reports reportable transactions, and capital contributions or distributions count even when your LLC had zero revenue. Skipping the filing because your LLC was inactive triggers the same $25,000 penalty.",
      },
      {
        q: "Can someone review my Form 5472 before it's sent to the IRS?",
        a: "Yes — every order we process is reviewed by an accountant on our team before we fax it to the IRS. Nothing goes out on autopilot.",
      },
      {
        q: "Do I owe US tax just because I file Form 5472?",
        a: "No. Form 5472 is an information return, not a tax return. Most foreign-owned single-member LLCs owe $0 in US federal income tax regardless of whether they file Form 5472. The form is mandatory but doesn't itself create any tax liability.",
      },
      {
        q: "Can I e-file Form 5472?",
        a: "No. Foreign-owned disregarded entities are excluded from IRS e-filing for Form 5472 + pro forma 1120. Fax to +1-855-887-7737 or mail to IRS Ogden, UT 84201-0023 only.",
      },
      {
        q: "How long has Form 5472 applied to single-member LLCs?",
        a: "Since tax year 2017, when Treasury Regulation § 1.6038A-1 was extended to foreign-owned domestic disregarded entities. Before that, single-member LLCs were exempt from §6038A reporting. After that, they're treated as corporations for §6038A purposes.",
      },
      {
        q: "What if I own multiple foreign-owned LLCs?",
        a: "Each LLC files its own separate Form 5472 + pro forma 1120 package. If you own 3 LLCs, that's 3 separate filings every year. You'd start 3 separate filings in our wizard.",
      },
      {
        q: "Does the IRS audit Form 5472 filings?",
        a: "The IRS can examine Form 5472 within the normal statute of limitations (6 years for incomplete returns). In practice, most filings are processed without examination. The bigger risk is the automatic $25,000 penalty for non-filing or incomplete filing — assessed without examination by the IRS computer system.",
      },
      {
        q: "Where can I see a sample completed Form 5472?",
        a: "Run our wizard with sample data — at the PDF preview step you'll see exactly what gets faxed. The Form 5472 page shows all parts filled in based on your wizard answers.",
      },
    ],
    relatedSlugs: ["file-form-5472", "form-5472-penalty", "diirsp", "form-5472-instructions", "form-5472-deadline", "form-5472-fax-number"],
  },
  {
    slug: "form-5472-deadline",
    keyword: "form 5472 deadline",
    title: "Form 5472 Deadline: When Is It Due in 2026?",
    metaDescription:
      "Form 5472 is due April 15. Get the full deadline rules, Form 7004 extension to October 15, late-filing penalties, and how to catch up under DIIRSP if you've missed prior years.",
    h1: "Form 5472 deadline — when it's due, and what to do if you've missed it",
    intro:
      "Form 5472 is due April 15 of the year following the tax year. You can get an automatic 6-month extension to October 15 by filing Form 7004 by April 15. Miss the deadline and the IRS charges $25,000 per form — but you can still catch up under DIIRSP. This is the complete deadline guide: exact dates, extension mechanics, what counts as on-time filing, late-filing penalties, the catch-up procedure, and a real timeline showing what happens after you submit.",
    sections: [
      {
        heading: "The exact deadline",
        body: "Form 5472 follows the corporate (Form 1120) calendar:\n\n• Calendar-year LLC (Jan 1 - Dec 31 tax year): Form 5472 + pro forma Form 1120 due April 15 of the next year. For tax year 2025, that's April 15, 2026.\n• Fiscal-year LLC: due the 15th day of the 4th month after fiscal year-end. Example: fiscal year ending June 30 → return due October 15.\n• Extension: file Form 7004 by the original due date for an automatic 6-month extension to October 15 (calendar-year LLC) or the equivalent for fiscal-year.\n\nThe extension shifts the filing deadline only — not any tax liability (most foreign-owned disregarded entities owe no US income tax, so this rarely matters).\n\nWeekend / holiday rule: if April 15 falls on a Saturday, Sunday, or federal holiday, the deadline moves to the next business day. (2026: April 15 is a Wednesday — normal deadline.)",
      },
      {
        heading: "How to file Form 7004 for an extension",
        body: "Form 7004 (Application for Automatic Extension of Time to File) gives you the 6-month extension. It must be filed by the original deadline (April 15 for calendar-year LLCs).\n\nWhat to put on Form 7004:\n• Part I: select form code \"12\" (Form 1120).\n• Identification: LLC name, EIN, address — same as on the eventual 1120.\n• Estimated tax: $0 for foreign-owned DEs (no tax liability).\n\nSubmit Form 7004 by:\n• Fax to +1-855-887-7737 (same Ogden PIN Unit number).\n• Mail to IRS Ogden, UT 84201-0023.\n\nThe extension is automatic — the IRS doesn't send a confirmation. Just keep proof of timely filing of the 7004 (fax receipt or certified mail receipt). Your Form 5472 + pro forma 1120 is then due by October 15.\n\nDon't file Form 7004 if you're already past April 15 — at that point file the actual Form 5472 + 1120 directly with a DIIRSP reasonable cause statement.",
      },
      {
        heading: "What counts as \"on time\"?",
        body: "If you fax to the IRS Ogden PIN Unit (+1-855-887-7737), the timestamp on your fax transmission receipt is the postmark. Send it before midnight (local time at your fax origin) on the deadline and you're on time — even if the IRS processes it days or weeks later.\n\nIf you mail it, the postmark date counts. Use certified mail with a return receipt so you have proof.\n\nIf the IRS processes the return after the deadline despite a timely fax/mail, no penalty applies — the timestamp on your proof of filing is what matters legally.\n\nKeep the fax transmission receipt or certified mail receipt for at least 6 years. If the IRS later (incorrectly) assesses a late-filing penalty, you respond with the proof and they reverse it.",
      },
      {
        heading: "What happens after the deadline if you do nothing",
        body: "Timeline of what happens to a missed Form 5472:\n\n• Day 0 (April 15): you miss the deadline. Nothing visible happens.\n• Day 60-180: IRS internal processing identifies the missing return via EIN cross-reference.\n• Day 200-540: IRS computer system generates and mails a CP-15 \"Notice of Penalty Charge\" to your LLC's US address of record, assessing $25,000.\n• Day +90 from notice: 90-day response window expires.\n• Day +120 from notice: continuation penalty begins. Another $25,000 added.\n• Day +150 from notice: another $25,000 (so now $75,000 for a single missed year).\n• Day +180 from notice: another $25,000 ($100,000).\n• ... and so on, indefinitely.\n\nThis is why catching up quickly under DIIRSP — even multiple years late — is critical. Once continuation penalties begin, the math escalates fast.\n\nIf the LLC's US address can't receive mail (some virtual mailboxes return-to-sender IRS notices), you might not even see the CP-15. The penalty is still assessed and continuation timer still runs.",
      },
      {
        heading: "Missed the deadline? Use DIIRSP",
        body: "Don't panic. The IRS provides a relief path called DIIRSP — Delinquent International Information Return Submission Procedure — that lets you file late with a Reasonable Cause Statement requesting penalty abatement.\n\nDIIRSP is available as long as:\n• The IRS has NOT yet contacted you about the specific delinquency.\n• You're not under IRS examination or criminal investigation.\n• You don't owe US income tax (DIIRSP is for information-return delinquencies).\n\nMost foreign-owned single-member LLCs meet all three criteria. DIIRSP is the right path for almost all late filings.\n\nThere's no guarantee the IRS will waive the penalty, but well-documented first-time late filings have a high acceptance rate. Generic statements with no specific facts get rejected more often.\n\nOur DIIRSP-aware filer automatically attaches the Reasonable Cause Statement for late filings. Multi-year catch-up packages: $149 for 2 years, $199 for 3 years. Every package is reviewed by an accountant on our team before we fax it.",
      },
      {
        heading: "Late-filing penalty in detail",
        body: "The penalty for missing the Form 5472 deadline:\n\n• Base penalty: $25,000 per Form 5472 not filed, per tax year.\n• Continuation penalty: additional $25,000 for each 30-day period after IRS notice if not filed within 90 days.\n• No cap.\n\nIt's per form, per year — so missing 3 years on one LLC = $75,000 base. Missing 3 years on each of 2 LLCs = $150,000 base.\n\nThe penalty is automatic — assessed by the IRS computer system without human review. The CP-15 notice arrives without warning, often 6-18 months after the deadline.\n\nMost foreign-owned single-member LLCs owe zero US income tax even when they file the form. The $25,000 is purely an information-return penalty for failing to disclose, not a tax bill.\n\nIf you're already in penalty territory: file under DIIRSP (if not yet contacted) or respond to the CP-15 with a Form 843 abatement request (if already assessed). The earlier you act, the better.",
      },
      {
        heading: "Real-world deadline scenarios",
        body: "Scenario A — on-time filing: Carlos files his Wyoming LLC's tax year 2024 Form 5472 on April 10, 2025 via our wizard. We fax to the IRS Ogden PIN Unit. Fax receipt timestamps the filing at April 10 — well before April 15. No penalty risk.\n\nScenario B — extension: Mei is traveling in April and won't have her year-end financials ready until summer. On April 14, 2026 she faxes Form 7004 to +1-855-887-7737, requesting the 6-month extension. New deadline: October 15, 2026. She files Form 5472 + 1120 on September 30, 2026 — on time.\n\nScenario C — DIIRSP catch-up: Ahmed forgot about Form 5472 for tax year 2023. He learns about it in June 2025 (14 months late). He files under DIIRSP immediately with a reasonable cause statement explaining first-time foreign-owner unawareness. The IRS hasn't sent a CP-15 yet, so DIIRSP is the right path. Typical outcome: penalty waived.\n\nScenario D — CP-15 already received: Lin missed tax year 2022 and received a $25,000 CP-15 in November 2024. DIIRSP is no longer available for that year. She responds with Form 843 abatement plus the late return — much harder path with lower success rate. She also files under DIIRSP for 2023 and 2024 (where she hasn't been contacted yet).\n\nTakeaway: act before the IRS contacts you. DIIRSP is dramatically easier than post-assessment appeal.",
      },
      {
        heading: "How to file before the deadline",
        body: "1. Gather your LLC info (EIN, address, formation date, NAICS code) and your foreign owner info (legal name, FTIN or self-assigned Reference ID, residential address, country of citizenship).\n2. Add up year-end totals: capital contributions in, distributions out, total assets at year-end in USD, list of any other reportable transactions.\n3. Use our 15-minute online filer to generate the full package: cover letter, pro forma 1120 with the \"Foreign-Owned U.S. DE\" stamp, Form 5472 (all parts), Part V supporting statement, Reasonable Cause Statement (only if late).\n4. Sign once on screen — the signature embeds into every required signature box automatically.\n5. An accountant on our team reviews the package end-to-end.\n6. We fax it to the IRS Ogden PIN Unit at +1-855-887-7737 and email you the timestamped receipt as proof of timely filing.\n\nPricing: Standard $199 · Rush $279 · Premium $449 (IRS fax delivery included). +$149 per additional past year. 100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "Should you file early?",
        body: "Yes, ideally. There's no penalty or downside for filing Form 5472 early. Benefits of filing in January-February rather than waiting until April:\n\n• Avoid last-minute scramble if you discover missing information.\n• Less stress.\n• Buffer against any wizard or fax delivery issues.\n• Faster IRS processing.\n• Get the obligation off your to-do list.\n\nOur returning customers typically file in January or February each year — pre-filled from their prior year's filing, takes 5-10 minutes total.\n\nFiling earlier than your tax year ends doesn't work — the IRS won't process a return for a tax year that hasn't completed yet. So January 1 is the earliest practical filing date for the prior calendar year.",
      },
      {
        heading: "Annual reminder system",
        body: "If you file with us, we email you in January and again in early March as a reminder that Form 5472 is due April 15. The reminders include:\n\n• Confirmation of your LLC name and tax year.\n• Link to start the new year's filing (pre-filled from prior year).\n• Estimated time: 5-10 minutes for returning customers.\n\nNo spam, no upselling — just the annual reminder so you don't forget. Unsubscribe link in every email.\n\nIf you're filing DIY without our service, set a calendar reminder for February 1 each year. Filing in February gives you 6+ weeks of buffer before the April 15 deadline.",
      },
    ],
    faqs: [
      {
        q: "Does the Form 7004 extension extend Form 5472?",
        a: "Yes. Form 5472 is attached to Form 1120, so a 7004 extension for the 1120 automatically extends the 5472 to October 15. File Form 7004 by April 15 to get the extension.",
      },
      {
        q: "Can I file Form 5472 early?",
        a: "Yes, any time after the tax year ends. There's no penalty for filing early, and it removes the obligation from your to-do list. Most of our returning customers file in January or February.",
      },
      {
        q: "What if I miss the extended October 15 deadline?",
        a: "Same as missing April 15 without an extension — you'll need to file under DIIRSP with a reasonable cause statement. The earlier you catch up, the better the chance of penalty abatement.",
      },
      {
        q: "I'm filing for last year — can I still use your service?",
        a: "Yes. The wizard auto-detects late filings and adds the DIIRSP Reasonable Cause Statement automatically. Pricing: Standard $199 · Rush $279 · Premium $449 for 1 year (fax included). Add $149 per additional past year for multi-year catch-up.",
      },
      {
        q: "What's the deadline for tax year 2024?",
        a: "April 15, 2025 (or October 15, 2025 with Form 7004 extension). If you missed it, file under DIIRSP immediately.",
      },
      {
        q: "What's the deadline for tax year 2025?",
        a: "April 15, 2026 (or October 15, 2026 with Form 7004 extension).",
      },
      {
        q: "If I file Form 7004 do I need to file the actual return?",
        a: "Yes — Form 7004 just extends the deadline. You still must file the actual Form 5472 + pro forma 1120 by the extended deadline (October 15 for calendar-year LLCs).",
      },
      {
        q: "Can I file Form 7004 after April 15?",
        a: "No. Form 7004 must be filed BY the original due date. If you missed April 15 without filing 7004, you're now in late territory — file the actual return under DIIRSP with a reasonable cause statement.",
      },
      {
        q: "Does the deadline change in a leap year?",
        a: "No. The April 15 deadline is the same in leap years. (Years where April 15 falls on a weekend or federal holiday shift to the next business day.)",
      },
      {
        q: "What if my fax fails on the deadline day?",
        a: "Retry within minutes — most fax failures are transient. If you can't get through after multiple attempts, fall back to certified mail (postmarked the same day) to IRS Ogden, UT 84201-0023. The certified-mail postmark satisfies the deadline.",
      },
    ],
    relatedSlugs: ["late-form-5472", "diirsp", "form-5472-penalty", "file-form-5472", "form-5472-reasonable-cause-statement"],
  },
  {
    slug: "form-5472-fax-number",
    keyword: "form 5472 fax number",
    title: "Form 5472 Fax Number — IRS Ogden PIN Unit",
    metaDescription:
      "Send Form 5472 to the IRS Ogden PIN Unit at +1-855-887-7737. Full instructions on what to include, which fax services work, and a 15-minute filer that handles the fax for you.",
    h1: "The IRS Form 5472 fax number (and how to actually send it)",
    intro:
      "The IRS Form 5472 fax number is +1-855-887-7737 — the Ogden PIN Unit. Fax is the fastest way to file Form 5472 with its attached pro forma Form 1120, and the fax transmission receipt is your proof of timely filing under IRC § 6038A. This is exactly what to send, in what order, which fax services work, what to do if the fax fails, and how to get the IRS-acknowledged proof of timely submission.",
    sections: [
      {
        heading: "The number",
        body: "Fax to: +1-855-887-7737 (IRS Ogden PIN Unit)\n\nThis is the IRS's published fax number for Form 5472 and the attached pro forma Form 1120 filed by foreign-owned US disregarded entities. The Ogden Service Center processes all of these returns — they cannot be e-filed.\n\nThis number is specific to Form 5472 + pro forma 1120 filings by foreign-owned single-member LLCs. Other tax filings (real corporate returns, partnership returns, personal returns) use different IRS fax numbers. Do not use this fax number for any other type of return.\n\nIt's a US toll-free number, so from outside the US you can call it via any international fax service that supports US destinations. Most online fax services charge $1-$5 per send.",
      },
      {
        heading: "What you need to send",
        body: "The fax must contain, in this order:\n\n1. Cover sheet (1 page) — your name, the LLC name, EIN, tax year, page count, and \"Form 5472 + Pro Forma 1120 — Foreign-Owned U.S. DE\".\n2. Pro forma Form 1120 — entity identification fields filled in, signed in pen, with \"Foreign-Owned U.S. DE\" stamped across the top. Income, deductions, and tax sections blank.\n3. Form 5472 — fully filled in (Parts I, II, III, IV, V, VII at minimum).\n4. Part V supporting statement — lists every reportable transaction (capital contributions in, distributions out, etc.) with date, amount, and related party.\n5. Reasonable Cause Statement — only if you're filing late under DIIRSP.\n\nTotal pages: typically 5-8 depending on transaction count.\n\nEvery page that requires a signature must be signed in pen — the IRS does not accept digital-only signatures on these forms. The only signature line is on Form 1120 (bottom of page 1).",
      },
      {
        heading: "Which fax services work?",
        body: "Any fax service that can send to a US toll-free number works. Common choices:\n\n• eFax (~$17/month with several free outbound pages monthly).\n• MyFax (~$10/month).\n• FaxZero (free for up to 5 pages with ads, or paid tier for ad-free).\n• Pamfax (pay-per-page, no subscription).\n• HelloFax / Dropbox Sign (~$10/month).\n• Google Voice with Workspace + HelloFax integration.\n• A physical fax machine if you have access.\n• Our service (IRS fax delivery included in every plan — Standard $199, Rush $279, Premium $449).\n\nFor a one-time fax of a 5-8 page document, FaxZero (free) or Pamfax (pay-per-page) are low-cost DIY options if you prefer to self-file. For ongoing use, monthly subscriptions become economical.\n\nKeep the transmission receipt the service generates — it shows the fax was successfully delivered, with a timestamp. That receipt is your legal proof of timely filing under IRC § 6038A. Without it, you can't prove you filed on time if the IRS later assesses a penalty.",
      },
      {
        heading: "How to actually send a fax in 2026",
        body: "If you've never sent a fax before, here's the modern path:\n\n1. Sign up for an online fax service (FaxZero is free for occasional use; eFax / MyFax for subscriptions).\n2. Upload your signed PDF as the document to fax.\n3. Enter the destination fax number: +18558877737 (some services accept hyphens or parentheses; +1-855-887-7737 also works).\n4. Add an optional cover sheet (most services let you skip this since your cover letter is page 1 of the PDF).\n5. Hit Send.\n6. Wait for the confirmation email. Most US fax transmissions to the IRS complete in 5-30 minutes.\n7. Save the confirmation email and the transmission receipt PDF.\n\nThere's no need for a fax machine, fax modem, landline, or any specialized hardware. Online fax services route through real fax protocols on the receiving side — the IRS Ogden line is a standard US fax line that accepts these transmissions transparently.",
      },
      {
        heading: "IRS fax delivery — included in every plan",
        body: "IRS fax delivery is included in every plan at no extra charge. We fax the signed package to +1-855-887-7737 for you. You get:\n\n• A timestamped IRS Fax Transmission Receipt PDF emailed back to you.\n• A copy of the receipt in your portal you can re-download anytime.\n• An email confirmation when the fax delivers.\n• Automatic retry if the first attempt fails.\n• Proof-of-filing language formatted to satisfy any future IRS questions about timing.\n\nIf the first fax attempt fails, we automatically retry. If multiple attempts fail (rare but possible during IRS Ogden maintenance windows), we'll reach out before falling back to certified mail. 100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
      {
        heading: "What if the fax fails?",
        body: "The IRS Ogden fax line is generally reliable but can experience temporary outages, especially during peak filing periods (early April).\n\nIf your fax fails:\n1. Wait 5-10 minutes and retry. Most failures are transient and self-resolve.\n2. If multiple retries fail over an hour, check the IRS website for any announced fax outages.\n3. If still failing the next business day, fall back to certified mail.\n\nCertified mail fallback:\n• Address: Internal Revenue Service, Ogden, UT 84201-0023.\n• Use certified mail with return receipt requested.\n• Postmark date counts as your filing date — same legal weight as a fax transmission timestamp.\n• Mail USPS or via any major US carrier (UPS, FedEx) that offers tracked international shipping if you're outside the US.\n\nKeep your USPS Certified Mail receipt AND the return receipt (PS Form 3811 or USPS tracking confirmation) for at least 6 years. These prove timely filing.",
      },
      {
        heading: "Common fax mistakes to avoid",
        body: "• Faxing only Form 5472 without the pro forma 1120 — the IRS will reject and treat as not filed. Always send the complete package.\n• Faxing to the wrong number — must be +1-855-887-7737 (Ogden PIN Unit). Other IRS fax numbers are for different filings.\n• Sending unsigned forms — the signature line on Form 1120 must be signed in pen on the printed page before fax.\n• Sending an unsigned cover letter — the cover letter itself doesn't require a signature; the 1120 inside does.\n• Faxing pages out of order — the IRS Ogden team handles thousands of these; well-ordered packages are processed faster.\n• Forgetting to save the transmission receipt — without it, you have no proof of timely filing.\n• Filing after midnight on April 15 (deadline) — the timestamp is what counts, so send before midnight in your local timezone.\n• Sending color or low-resolution scans — black and white at 200dpi or higher is the safe choice for fax fidelity.",
      },
      {
        heading: "Proof of filing — what to save",
        body: "Keep all of these for at least 6 years (IRS examination window for incomplete returns):\n\n• The signed PDF you faxed (full package).\n• The fax transmission receipt with timestamp.\n• The fax service's confirmation email.\n• If you used our service: the timestamped IRS Fax Transmission Receipt PDF we email and store in your portal.\n• If you filed by mail: the certified mail receipt (PS Form 3800) and return receipt (PS Form 3811).\n\nIf the IRS later (incorrectly) assesses a CP-15 penalty for a return you filed on time, you respond with the proof and they reverse the assessment. Without proof, you'd be in a much harder position to dispute the penalty.\n\nStore them somewhere durable: cloud storage (Google Drive, Dropbox), email folder, or paper file. Don't rely on your fax service's own retention — many services delete sent items after a year or two.",
      },
      {
        heading: "Mail vs. fax — which is better?",
        body: "Fax (preferred):\n• Faster delivery — transmission completes in minutes.\n• Immediate proof of receipt — the fax confirmation timestamp.\n• Lower risk of misdelivery (no chance of getting lost in physical mail).\n• Cheaper than international certified mail.\n• Works the same from anywhere in the world.\n\nMail (backup):\n• Slower — takes days to weeks for delivery, especially internationally.\n• Proof of timely filing relies on postmark date and certified mail receipt.\n• Risk of physical misdelivery or loss.\n• More expensive for international senders ($20-$80 vs $0-$5 for fax).\n• Can be the only option if fax service fails.\n\nFor most foreign LLC owners, fax is the right default. Mail is the fallback when fax fails or as a redundant filing method (some cautious filers fax AND mail to maximize proof).",
      },
      {
        heading: "Your annual fax routine",
        body: "If you file Form 5472 every year (and you should), the fax routine becomes:\n\n• Tax year ends December 31.\n• In January or February, prepare the filing (12-question wizard with us, ~5-10 minutes for returning customers).\n• Sign on screen.\n• We fax to +1-855-887-7737 and email you the timestamped receipt (included in every plan).\n• Save the transmission receipt.\n• Done until next year.\n\nTotal time investment: about 15 minutes once a year. Cost: Standard $199 with us (fax delivery included). Penalty avoided: $25,000.\n\nMost of our returning customers fax in early February and have the obligation handled with 10+ weeks of buffer before the April 15 deadline.",
      },
    ],
    faqs: [
      {
        q: "Is +1-855-887-7737 the right fax number for Form 5472 in 2026?",
        a: "Yes. This is the current IRS Ogden PIN Unit fax number for Form 5472 + pro forma 1120 filings by foreign-owned US disregarded entities. Has been the same number since the §6038A rule extension in 2017.",
      },
      {
        q: "Can I email Form 5472 to the IRS instead?",
        a: "No. The IRS does not accept Form 5472 by email under any circumstances. Fax or paper mail only.",
      },
      {
        q: "Do I get a confirmation from the IRS that they received my fax?",
        a: "Not directly from the IRS. Your fax transmission receipt (from your fax service) is the legal proof of timely filing. The IRS doesn't send a separate confirmation. If you don't see a CP-15 notice over the following 6-18 months, no news is good news.",
      },
      {
        q: "How long does it take you to fax it?",
        a: "Once you sign your filing and our accountant reviews the package, we fax it the same business day. You'll get the IRS fax transmission receipt by email within a few hours.",
      },
      {
        q: "What's the IRS Ogden mailing address?",
        a: "Internal Revenue Service, Ogden, UT 84201-0023. Use certified mail with return receipt. The postmark counts as your filing date.",
      },
      {
        q: "Can I fax from outside the US?",
        a: "Yes. Any online fax service that supports US destinations works from any country. The fax routes through standard US fax protocols on the receiving side — no special arrangement needed.",
      },
      {
        q: "What if the IRS Ogden fax is down on the deadline day?",
        a: "Retry every 30 minutes. If it stays down past evening, fax it the next morning (still on time if the original day's transmission attempt is logged) or send by certified mail with same-day postmark.",
      },
      {
        q: "Does the fax need a cover sheet?",
        a: "Recommended but not strictly required. Your filing package's cover letter (page 1 of the PDF) serves as the practical cover sheet. Some fax services add their own cover sheet automatically — that's fine too.",
      },
      {
        q: "Can I send multiple LLCs' filings in one fax?",
        a: "No. Each LLC's filing is a separate fax — different EIN, different package. Combining them risks mis-routing and incomplete processing.",
      },
      {
        q: "How do I get the timestamped receipt that's accepted as proof of filing?",
        a: "IRS fax delivery is included in every plan — Standard, Rush, and Premium. After we fax your package, we email you a polished IRS Fax Transmission Receipt PDF that's also stored in your portal for re-download at any time.",
      },
    ],
    relatedSlugs: ["file-form-5472", "form-5472-deadline", "form-5472-instructions", "irs-form-5472", "1120-pro-forma-instructions"],
  },
  {
    slug: "single-member-llc-foreign-owner",
    keyword: "single-member llc foreign owner",
    title: "Single-Member LLC With a Foreign Owner — Tax & IRS Filing Guide",
    metaDescription:
      "Single-member US LLCs owned by non-US persons must file IRS Form 5472 + pro forma 1120 every year. Full guide to the $25,000 penalty, deadlines, state filings, and a 15-minute accountant-reviewed online filer.",
    h1: "Single-member LLC with a foreign owner — what you actually have to file",
    intro:
      "If you are a non-US person who owns a single-member US LLC (Wyoming, Delaware, New Mexico, Florida, Nevada, or any state), you have one critical annual federal filing the IRS imposes on you: Form 5472 attached to a pro forma Form 1120. Miss it and the IRS charges $25,000 per year, per form — automatically, with no warning. This is the complete guide to what you owe, when, what your LLC actually pays (often nothing), and how to file it in 15 minutes.",
    sections: [
      {
        heading: "Why the IRS singles out foreign-owned single-member LLCs",
        body: "Most US single-member LLCs are \"disregarded entities\" — for tax purposes the IRS treats them as if the owner just earned the income directly. For US owners that's simple: pile it on your personal Schedule C of Form 1040 and you're done.\n\nFor foreign owners it's different. Before 2017, foreign-owned single-member LLCs were also disregarded for ALL tax purposes — including reporting. That created a transparency loophole: non-US persons could hold US LLCs and the IRS had no visibility into related-party transactions, beneficial ownership, or fund flows.\n\nSince 2017, Treasury Regulation § 1.6038A-1 reclassifies foreign-owned disregarded entities as corporations specifically for Section 6038A reporting. That triggers an annual obligation to file Form 5472 to track every related-party transaction between the foreign owner and the LLC. The substantive tax treatment didn't change — the LLC is still disregarded for income tax. Only the disclosure obligation was added.",
      },
      {
        heading: "Do you actually have to file?",
        body: "Almost certainly yes, if you meet all three:\n\n1. You own (100%) a single-member US LLC. Multi-member LLCs file Form 1065 instead and aren't covered by this guide.\n2. You are NOT a US person — not a US citizen, not a green card holder, not a US tax resident (substantial presence test, etc.).\n3. Your LLC had at least one reportable transaction in the year — capital contributions in, distributions out, loans, payments to or from you, or any related-party transaction.\n\nA reportable transaction is interpreted broadly. The list of things that count:\n• Wiring USD into the LLC's bank account to fund operations.\n• Paying yourself a distribution.\n• Loan from you to the LLC (or LLC to you).\n• Renting your home office to the LLC.\n• Payments between the LLC and any other entity you control (a foreign company, another US LLC).\n• Sales of property between you and the LLC.\n\nIn practice every active foreign-owned LLC files every year. The only realistic exception: an LLC that's truly dormant (no bank account opened, no money moved, no contracts) for the entire year.",
      },
      {
        heading: "What you owe vs. what you file",
        body: "These are different things — and the distinction matters:\n\nForm 5472 + pro forma Form 1120 (always required):\n• Annual federal information return.\n• Discloses related-party transactions.\n• No tax liability calculated on these forms.\n• $25,000 penalty per missed form per year.\n• Due April 15 (October 15 with extension).\n\nUS federal income tax (usually $0):\n• Foreign-owned single-member LLCs are disregarded for tax.\n• If income is foreign-source and you have no US trade or business: $0 US federal income tax.\n• If income is US-source effectively connected with a US trade or business: file Form 1040-NR personally; may owe US tax.\n• Most ecommerce / SaaS / consulting LLCs serving non-US customers owe nothing.\n\nState tax (depends on state):\n• Wyoming, Delaware (out-of-state), Nevada, Florida, Texas, New Mexico: no state income tax on LLCs.\n• California, New York, others: state-level tax may apply.\n• Annual report fee: varies $60-$300/year by state.\n\nMost foreign-owned single-member LLCs that sell internationally owe $0 in US federal tax but still must file Form 5472 + pro forma 1120 every year just to stay compliant.",
      },
      {
        heading: "The $25,000 penalty in detail",
        body: "The IRS penalty for not filing Form 5472:\n• Base: $25,000 per form, per year. Per LLC.\n• Continuation: another $25,000 per 30-day period after IRS notice, if not filed within 90 days.\n• No statutory cap.\n• Assessed automatically by IRS computer system, no human review.\n\nMath examples:\n• 1 LLC, 1 missed year: $25,000.\n• 1 LLC, 3 missed years: $75,000.\n• 2 LLCs, 3 missed years each: $150,000.\n• 1 LLC, 1 missed year + ignored CP-15 for 12 months: $25,000 + 12 × $25,000 = $325,000.\n\nThis is the single largest compliance risk most foreign LLC owners are unaware of. The penalty is for failing to FILE the disclosure return, not for failing to pay tax. Most foreign LLC owners owe zero US tax — the penalty applies anyway.\n\nIf you've missed prior years, file under DIIRSP (Delinquent International Information Return Submission Procedure) immediately. Most first-time catch-ups are accepted with no penalty assessed.",
      },
      {
        heading: "Typical foreign-owner LLC profiles",
        body: "Profile 1: SaaS founder.\n• Delaware LLC formed via Stripe Atlas.\n• Owner abroad (e.g. UK, Singapore, Hong Kong).\n• Selling SaaS via Stripe to global customers.\n• Revenue $50K-$2M.\n• US federal tax: $0 (no US trade or business, foreign-source services).\n• Required filings: Form 5472 + pro forma 1120 federal, Delaware franchise tax $300, BOI report once at formation. Total federal compliance with us: $98/year.\n\nProfile 2: Ecommerce / dropshipping.\n• Wyoming LLC.\n• Owner in Vietnam, Mexico, etc.\n• Shopify store with worldwide customers (no US warehouse).\n• Revenue $20K-$500K.\n• US federal tax: $0 (no US-source income).\n• Required filings: Form 5472 + pro forma 1120 federal, Wyoming annual report $60, BOI once, sales tax if nexus crossed. Total federal compliance with us: $98/year.\n\nProfile 3: Consulting / agency.\n• Wyoming or Delaware LLC.\n• Owner in EU, India, Brazil.\n• Consulting clients in US and abroad.\n• Revenue $30K-$300K.\n• US federal tax: $0 if consulting performed outside the US.\n• Required filings: Form 5472 + pro forma 1120 federal, state annual report. With us: $98/year.\n\nProfile 4: Stripe Atlas Delaware LLC, no revenue.\n• Just formed.\n• Funded $5K-$10K to open Mercury bank account.\n• No customers yet.\n• Required filings: Form 5472 + pro forma 1120 federal (the capital contribution counts as a reportable transaction). With us: $98/year.",
      },
      {
        heading: "What's in the federal filing package",
        body: "The complete federal filing package every year:\n\n1. Cover letter (1 page) identifying the filing.\n2. Pro forma Form 1120 with entity info and \"Foreign-Owned U.S. DE\" stamp.\n3. Form 5472 (Parts I, II, III, IV, V, VII).\n4. Part V supporting statement listing each reportable transaction.\n5. Reasonable Cause Statement (only if filing late under DIIRSP).\n\nTotal: 5-8 pages. Faxed as one package to the IRS Ogden PIN Unit at +1-855-887-7737.\n\nNo income tax calculation, no Schedule C / 1040, no payroll forms (unless you have US employees, which most foreign-owned LLCs don't).",
      },
      {
        heading: "When and how to file",
        body: "When: April 15 of the year following the tax year. October 15 with Form 7004 extension.\n\nHow:\n• Fax to +1-855-887-7737 (IRS Ogden PIN Unit) — preferred. Get a timestamped transmission receipt as proof of filing.\n• Mail to IRS Ogden, UT 84201-0023 — backup. Use certified mail with return receipt.\n• E-file: NOT available for foreign-owned DE filings.\n\nWho:\n• You, the owner. Pen signature required on Form 1120 (no separate signature on Form 5472).\n\nWith us:\n• Wizard (12 questions) → generated PDF → sign once on screen → accountant review → fax to IRS → timestamped receipt. ~15 minutes total. Standard $199 · Rush $279 · Premium $449. IRS fax delivery included. +$149 per additional past year.",
      },
      {
        heading: "If you've missed prior years (DIIRSP)",
        body: "Many foreign owners discover Form 5472 a year or more after forming their LLC. The IRS provides DIIRSP — Delinquent International Information Return Submission Procedure — as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement.\n• Fax to +1-855-887-7737.\n• Most well-documented first-time catch-ups are accepted without penalty.\n\nOur DIIRSP packages:\n• 2-year catch-up: Standard $348 · Rush $428 · Premium $598 (fax included).\n• 3-year catch-up: Standard $497 · Rush $577 · Premium $747 (fax included).\n• Reasonable cause statement auto-generated, accountant-reviewed.\n\nDon't wait. Once the IRS issues a CP-15 notice for a missed year, DIIRSP is no longer available for that year and you're stuck with a much harder post-assessment appeal.",
      },
      {
        heading: "Common scenarios we don't cover",
        body: "Our service is built specifically for single-member, foreign-owned, disregarded LLCs with no US tax liability. Scenarios that need a CPA, not us:\n\n• Multi-member LLCs (need Form 1065, not 1120).\n• LLCs that elected C-corp taxation via Form 8832 (need full Form 1120 with income/tax).\n• LLCs with US-source effectively connected income (need Form 1040-NR personally, possibly more complex 1120 filing).\n• LLCs with US employees (need payroll tax filings — Form 941, W-2, etc.).\n• LLCs that own US real estate generating rental income (need 1040-NR and 8288 withholding).\n• LLCs with Amazon FBA inventory in US warehouses (may be US trade or business; talk to a foreign-seller CPA).\n• LLCs with complex international structures (foreign parents, multiple jurisdictions, cost-sharing agreements).\n\nFor the standard profile — solo foreign founder, US LLC, customers worldwide, $0 US tax — our service is the right fit. Anything outside that: get a CPA familiar with foreign owners.",
      },
      {
        heading: "The fastest way to file",
        body: "Our 15-minute online filer handles everything for the standard foreign-owned single-member LLC case:\n\n• 12-question wizard pre-tuned for non-US founders.\n• Pre-fills the next year from your prior filing.\n• Generates the complete package: cover letter, pro forma Form 1120, Form 5472 (all parts), Part V supporting statement, Reasonable Cause Statement (if late).\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review on every package before submission.\n• IRS fax delivery + timestamped receipt as proof of filing.\n• 100% money-back guarantee if we fail to submit.\n\nPricing:\n• 1 tax year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 tax years (DIIRSP catch-up): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 tax years (DIIRSP catch-up): Standard $497 · Rush $577 · Premium $747 (fax included)\n• +$149 per additional past year beyond the base package",
      },
    ],
    faqs: [
      {
        q: "I just formed my LLC and haven't done anything with it yet. Do I file?",
        a: "If your LLC had ANY transactions in the year — including the capital contribution to fund the bank account — yes, file Form 5472. If it had genuinely zero activity (no bank account opened, no money in or out), you can argue no reportable transaction occurred. Most owners file anyway for safety.",
      },
      {
        q: "Can my US CPA file this for me?",
        a: "They can, but most US-based CPAs see this filing once or twice in their career and aren't comfortable with it. Expect $400-$800 and 1-2 weeks of back-and-forth. Our flat-fee service from $199 (IRS fax delivery included) takes 15 minutes and is reviewed by an accountant on our team.",
      },
      {
        q: "What if I have multiple foreign-owned LLCs?",
        a: "Each one needs its own Form 5472 + pro forma 1120 — separate filing per LLC. You'd start a separate filing in our portal for each LLC.",
      },
      {
        q: "Do I need a US ITIN or just my foreign tax ID?",
        a: "You don't need a US ITIN. Form 5472 accepts your foreign tax ID (FTIN) or a self-assigned Reference ID. If you leave the Reference ID blank in our wizard, we generate one based on your name (e.g. SMITH-J-A7B2).",
      },
      {
        q: "Does filing Form 5472 mean I owe US tax?",
        a: "No. Form 5472 is an information return — disclosure only. Most foreign-owned single-member LLCs owe $0 US federal income tax regardless of whether they file Form 5472. The form doesn't itself trigger any tax liability.",
      },
      {
        q: "What's the easiest US state for a foreign-owned LLC?",
        a: "Wyoming for cheapest ongoing fees ($60/year state, no state income tax). Delaware for investor-friendly governance (but $300/year franchise tax). New Mexico, Florida, Nevada also good. Avoid California and New York unless you have nexus there — they impose more state taxes.",
      },
      {
        q: "What if my LLC is dormant — no revenue all year?",
        a: "If you had even one capital contribution (e.g. wiring $1,000 to fund the bank account), that's a reportable transaction and you file. If truly dormant (no bank account, no activity), you may not have a filing obligation — but most owners file regardless to avoid the $25,000 penalty risk.",
      },
      {
        q: "How do I know if my LLC has US-source income?",
        a: "If your customers are outside the US and you have no fixed US place of business or US employees, your income is foreign-source. If you have a US warehouse (e.g. Amazon FBA), US employees, or US real estate, you may have US-source effectively connected income. Talk to a CPA for the borderline cases.",
      },
      {
        q: "Do I file BOI report too?",
        a: "Yes — separately. Beneficial Ownership Information report is due within 30 days of LLC formation, filed for free at fincen.gov. It's a separate FinCEN obligation, not part of Form 5472. We don't handle BOI; it's a self-serve 15-minute form on the FinCEN website.",
      },
      {
        q: "What's the worst case if I just never file?",
        a: "The IRS eventually issues a CP-15 penalty notice ($25,000 per missed year per form). If you ignore it past the 90-day window, continuation penalties stack at $25,000 per 30 days. A single LLC with 1 missed year could become $100,000+ in penalties within 18 months of ignored notices. Don't let it get there — file under DIIRSP now while it's still available.",
      },
    ],
    relatedSlugs: ["form-5472-vs-1120", "foreign-owned-llc-tax", "form-5472-penalty", "wyoming-llc-form-5472", "delaware-llc-form-5472", "stripe-atlas-form-5472"],
  },
  {
    slug: "stripe-atlas-form-5472",
    keyword: "stripe atlas form 5472",
    title: "Stripe Atlas LLC + Form 5472 — What You Must File",
    metaDescription:
      "Stripe Atlas LLCs owned by non-US founders must file IRS Form 5472 every year. Stripe doesn't handle this — we do. 15-minute accountant-reviewed online filing from $199.",
    h1: "Stripe Atlas LLC owners — Form 5472 is on you, not Stripe",
    intro:
      "Stripe Atlas makes US LLC formation effortless for foreign founders — Delaware LLC + EIN + Mercury bank account in days. What Stripe Atlas explicitly does NOT handle is the annual IRS filing your LLC owes every year: Form 5472 + pro forma Form 1120. Skip it and the IRS charges $25,000 per year, per form. This is the complete Stripe Atlas + Form 5472 playbook — including the typical year-2 surprise, the Delaware franchise tax, and how to catch up if you've missed prior years.",
    sections: [
      {
        heading: "What Stripe Atlas covers — and what it doesn't",
        body: "Stripe Atlas is excellent at:\n\n• Forming your Delaware LLC (typically completes in 1-3 days).\n• Getting your EIN (international applicants get one without needing a US SSN/ITIN).\n• Setting up a US business bank account via Mercury (or similar fintech).\n• Providing legal templates (operating agreement, member resolutions).\n• Issuing equity to founders if you have co-founders.\n• Stripe payment processing integration on day 1.\n\nWhat Stripe Atlas explicitly does NOT cover (and Stripe says so in their own docs):\n\n• Annual federal tax filings, including Form 5472.\n• Pro forma Form 1120 (the attachment to Form 5472).\n• Delaware franchise tax ($300/year — they remind you but don't pay it).\n• State annual reports.\n• BOI (Beneficial Ownership Information) reports to FinCEN.\n• Personal Form 1040-NR (if you have US-source income).\n• Sales tax registrations.\n• Bookkeeping or accounting.\n\nIf you formed your LLC through Stripe Atlas and you're a non-US person, Form 5472 is yours to file — every year, by April 15. Stripe's role ended at formation.",
      },
      {
        heading: "Why this catches Stripe Atlas founders off-guard",
        body: "Most Stripe Atlas LLCs are owned by overseas SaaS / e-commerce / consulting founders who incorporated US-side to access Stripe payments and US business banking. Their LLC has clear revenue, runs through Stripe and Mercury, and from their perspective the US side \"just works\".\n\nThe disconnect: the IRS requires Form 5472 even when:\n• Your LLC owes zero US federal tax (most do).\n• Your LLC's customers are 100% outside the US.\n• Your LLC's only activity is one wire from you to fund operations.\n\nThat wire is itself a reportable transaction. So almost every Stripe Atlas LLC owes Form 5472 every year.\n\nThe second disconnect: there's no IRS reminder. The IRS doesn't email you in March saying \"hey, Form 5472 is due in 30 days.\" You're expected to know. Most founders learn about Form 5472 from a Reddit thread, a Stripe Atlas community post, or — worst case — a CP-15 penalty notice in the mail two years after they should have filed.",
      },
      {
        heading: "The Stripe Atlas typical compliance stack",
        body: "If you formed your LLC via Stripe Atlas, here's your full annual compliance stack:\n\nFederal (us):\n• Form 5472 + pro forma Form 1120 due April 15. $25,000 penalty if missed. Our service: Standard $199 · Rush $279 · Premium $449 (IRS fax delivery included).\n• BOI report to FinCEN — required within 30 days of formation, one-time. Free, self-serve at fincen.gov.\n\nState (Delaware, self-serve):\n• Delaware Annual LLC Franchise Tax: $300, due June 1. Self-serve at corp.delaware.gov.\n\nSituational:\n• Personal Form 1040-NR — only if you have US-source income personally (rare for most Stripe Atlas LLCs).\n• Sales tax registrations — only if you cross economic nexus thresholds in specific states (rare for SaaS, more common for physical-goods ecommerce).\n• Payroll taxes — only if you have US employees (rare).\n\nNot Stripe's job after formation:\n• None of the above is included in the Stripe Atlas formation product. Some of Stripe Atlas's optional ongoing services may handle pieces, but the standard formation product ends at year 1 day 1.\n\nTotal annual federal compliance with us: Standard $199 (fax delivery included). Plus $300 Delaware state. Total year 2+: $499/year.",
      },
      {
        heading: "What you actually file for Form 5472",
        body: "For a Stripe Atlas Delaware LLC owned by one non-US founder, the federal filing package is:\n\n1. Cover letter identifying the filing.\n2. Pro forma Form 1120 — entity info only, stamped \"Foreign-Owned U.S. DE\" at the top. Income, deductions, tax sections all blank.\n3. Form 5472 — Parts I (your LLC), II (you as foreign shareholder), III (you again as related party), IV (monetary transactions, often blank), V (reportable transactions — capital contributions, distributions), VII (FDE confirmation).\n4. Part V supporting statement — list of each reportable transaction.\n5. Reasonable Cause Statement — only if filing late under DIIRSP.\n\nAll faxed to the IRS Ogden PIN Unit at +1-855-887-7737. The fax transmission receipt is your proof of timely filing.\n\nTotal pages: 5-8. Total time to file with us: ~15 minutes. Total cost with us: Standard $199 (IRS fax delivery included).",
      },
      {
        heading: "Common Stripe Atlas LLC scenarios",
        body: "Scenario A — Year 1, no revenue yet: Lucia formed her Stripe Atlas LLC in June 2024. By December 2024 the only activity was: $5K capital contribution to open Mercury account + $500 spent on Stripe Atlas formation fee. Required for tax year 2024: Form 5472 + pro forma 1120. Part V reports the $5K capital contribution. Files by April 15, 2025 with our service for Standard $199 (fax included).\n\nScenario B — Year 2, growing SaaS: Mei has been running her Stripe Atlas Delaware LLC for 2 years selling SaaS to EU customers. Year 2 revenue: $180K, $0 US tax owed. She files Form 5472 + 1120 reporting capital contributions and distributions to/from her HK bank account. Standard $199 (fax included) with our service.\n\nScenario C — Discovered Form 5472 late: Carlos formed his Stripe Atlas LLC in 2022. Three years later (2025) he discovers Form 5472 obligation. He files 2022, 2023, 2024 together under DIIRSP using our 3-year catch-up (Standard $497, fax included). Reasonable cause statement auto-generated for first-time foreign-owner unawareness. Typical outcome: penalty waived.\n\nScenario D — Multiple Stripe Atlas LLCs: Mei has 3 separate Stripe Atlas LLCs for 3 different product lines. Each one needs its own Form 5472 + pro forma 1120 every year — 3 separate filings, Standard $199 each with us = $597/year just for federal compliance.",
      },
      {
        heading: "How we handle it",
        body: "We built Form5472 Prep specifically for the Stripe Atlas / Mercury / non-US-founder profile. Most of our customers are Stripe Atlas Delaware LLC owners — the wizard is pre-tuned for this exact case:\n\n• 12-question wizard. Pre-filled state (Delaware), common NAICS suggestions for SaaS / ecommerce / consulting.\n• In-portal canvas signature — no printing, scanning, or uploading needed.\n• Accountant review on every package before submission.\n• IRS fax delivery + timestamped receipt as proof of filing.\n• Pre-fills the next year from your prior filing — year 2 onward takes 5 minutes.\n• Optional annual reminder emails so you don't miss the April 15 deadline.\n\nPricing:\n• 1 tax year: Standard $199 · Rush $279 · Premium $449 (fax included)\n• 2 tax years (DIIRSP catch-up): Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3 tax years (DIIRSP catch-up): Standard $497 · Rush $577 · Premium $747 (fax included)\n• +$149 per additional past year\n\n100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
      {
        heading: "If you've missed prior years",
        body: "Many Stripe Atlas founders discover Form 5472 a year or two after forming their LLC. The IRS provides DIIRSP — Delinquent International Information Return Submission Procedure — as the standard catch-up:\n\n• File all missed years together as one package.\n• Include a Reasonable Cause Statement explaining first-time foreign-owner unawareness.\n• Fax to +1-855-887-7737 (IRS Ogden PIN Unit).\n• Most first-time catch-ups are accepted with no penalty assessed.\n\nDIIRSP eligibility: you have not yet been contacted by the IRS about the specific year's delinquency. As long as no CP-15 notice has arrived for those years, DIIRSP is available.\n\nOur multi-year packages:\n• 2-year catch-up: Standard $348 · Rush $428 · Premium $598 (fax included).\n• 3-year catch-up: Standard $497 · Rush $577 · Premium $747 (fax included).\n\nDon't wait. Once the IRS issues a CP-15, that year's DIIRSP eligibility ends and you're in the harder post-assessment appeal process.",
      },
      {
        heading: "The Stripe Atlas + Mercury banking dimension",
        body: "Most Stripe Atlas LLCs bank with Mercury. Mercury is a US-based fintech, so the LLC's main bank account is considered US — no FBAR (foreign bank account report) is required just for the Mercury account.\n\nIf you supplement Mercury with Wise USD, Brex, Relay, or other US-based business banking — also fine, no FBAR.\n\nFBAR enters the picture only if your LLC opens accounts OUTSIDE the US (e.g. Wise EUR account, Revolut Business EU). In those cases the LLC itself may need to file FBAR, separate from Form 5472. Talk to a tax professional if your LLC has non-US accounts.\n\nFor the standard Stripe Atlas + Mercury / Wise USD / Brex profile, Form 5472 + Delaware franchise tax + BOI report is the complete compliance picture. No FBAR needed.",
      },
      {
        heading: "Common Stripe Atlas + Form 5472 mistakes",
        body: "• Assuming Stripe Atlas \"handles everything\" — they don't. Annual federal filings (including Form 5472) are explicitly excluded from the formation product.\n\n• Waiting until April 14 to start — gather records earlier. Year 1 you'll need: Mercury statements, Stripe payout reports, any wires you made to/from the LLC.\n\n• Ignoring the BOI report — separate from Form 5472, due within 30 days of LLC formation. Self-serve at fincen.gov, free, takes 15 minutes. Penalty for missing: up to $500/day plus criminal liability.\n\n• Forgetting Delaware franchise tax — $300/year due June 1. Different deadline from Form 5472. Pay directly at corp.delaware.gov.\n\n• Assuming your CPA back home (in your country) knows about Form 5472 — they almost certainly don't. This is US-specific.\n\n• Filing only Form 5472 without the pro forma 1120 — invalid filing, triggers $25,000 penalty.\n\n• Filing through a regular tax software like TurboTax — doesn't support Form 5472 for foreign-owned DEs. Fax or mail only.",
      },
      {
        heading: "Bottom line for Stripe Atlas LLC owners",
        body: "Stripe Atlas got you the LLC, the EIN, and the Mercury account. That's where their job ended. From year 1 onward, Form 5472 + pro forma 1120 is on you, due April 15 each year, with a $25,000 penalty per year if missed.\n\nOur service is built for this profile — flat-fee, accountant-reviewed, with a money-back guarantee. Standard $199 · Rush $279 · Premium $449 (IRS fax delivery included). Most of our customers come from Stripe Atlas, Mercury, and similar foreign-founder onboarding paths.\n\nFile early, file every year, keep the fax receipt for your records. The $25,000 penalty is the single largest compliance risk for your LLC — bigger than every other federal/state obligation combined.",
      },
    ],
    faqs: [
      {
        q: "Does Stripe Atlas file Form 5472 for me?",
        a: "No. Stripe Atlas's own documentation explicitly states they do not handle annual federal tax filings, including Form 5472. You're responsible for filing it every year. Their optional ongoing services may include some help; the standard formation product ends after year 1 day 1.",
      },
      {
        q: "I just got my Stripe Atlas LLC this year — do I file Form 5472 already?",
        a: "If your LLC had any reportable transaction in its first year (including the initial capital contribution to fund the Mercury account or pay the Stripe Atlas formation fee), yes. The filing is due April 15 of the following year.",
      },
      {
        q: "Do I also need Delaware franchise tax compliance?",
        a: "Yes — Delaware charges a $300 annual franchise tax for LLCs, due June 1. Completely separate from Form 5472. We don't handle Delaware state filings; pay it directly at corp.delaware.gov (10-minute self-serve form).",
      },
      {
        q: "What's the cheapest option if I have one year to file?",
        a: "Standard $199 (fax delivery included). IRS fax delivery is included in every plan — no separate fee.",
      },
      {
        q: "I have 3 Stripe Atlas LLCs — do I file 3 separate Form 5472s?",
        a: "Yes. Each LLC files its own Form 5472 + pro forma 1120 separately. Three LLCs = three filings = $597/year at our Standard rate (3 × $199, fax included). Each gets its own fax receipt.",
      },
      {
        q: "Stripe Atlas says I don't owe US tax — so why file Form 5472?",
        a: "Both are true. You owe $0 US federal income tax (Stripe Atlas is right). But you still must file Form 5472 + pro forma 1120 as an INFORMATION return — disclosure only, not tax. The $25,000 penalty applies to non-filing regardless of whether tax is owed.",
      },
      {
        q: "Does Stripe send my info to the IRS automatically?",
        a: "Stripe issues a 1099-K to your LLC each year showing payment processing volume (if it exceeds reporting thresholds). The IRS sees this and knows your LLC has revenue. That makes them more likely to notice if you don't file Form 5472. Filing protects you from the penalty regardless.",
      },
      {
        q: "I formed my LLC through Atlas but moved it to Wyoming. Does that change anything?",
        a: "Federal Form 5472 obligation is identical in Wyoming and Delaware. State fees are lower in Wyoming ($60 vs $300). The federal piece — what we handle — is the same in both states.",
      },
      {
        q: "I missed Stripe's note about Form 5472. Is it really my responsibility?",
        a: "Yes. The IRS doesn't care whose website you read. Once you formed a US LLC as a foreign person, the Form 5472 obligation is yours. The good news: if you missed prior years and haven't been contacted by the IRS, DIIRSP catch-up is available and most first-time foreign-owner cases are accepted without penalty.",
      },
      {
        q: "Does your service work for Stripe Atlas LLCs specifically?",
        a: "Yes — most of our customers are Stripe Atlas Delaware LLC owners. The wizard is pre-tuned for this profile (defaults to Delaware, common NAICS for SaaS / ecommerce / consulting, Mercury-style banking assumptions). 15 minutes for year 1, even faster for year 2+.",
      },
    ],
    relatedSlugs: ["delaware-llc-form-5472", "foreign-owned-llc-tax", "single-member-llc-foreign-owner", "form-5472-deadline", "irs-form-5472"],
  },
  {
    slug: "form-5472-reasonable-cause-statement",
    keyword: "form 5472 reasonable cause statement",
    title: "Form 5472 Reasonable Cause Statement (DIIRSP Template Guide)",
    metaDescription:
      "How to write a reasonable cause statement for a late Form 5472 filing under DIIRSP. Required elements, what to include, what to avoid, and an auto-generator that does it for you.",
    h1: "Reasonable cause statement for Form 5472 — what to include",
    intro:
      "If you're filing Form 5472 late, the IRS requires a Reasonable Cause Statement under DIIRSP (Delinquent International Information Return Submission Procedure) to request abatement of the $25,000-per-form-per-year penalty. Done right, it can save tens of thousands of dollars. Done poorly — or skipped entirely — and the penalty is assessed automatically. This is the complete guide: what the IRS expects, what to include, what kills a request, sample structure, and how our DIIRSP-aware filer generates one for you that's accountant-reviewed before fax submission.",
    sections: [
      {
        heading: "What the IRS expects",
        body: "A reasonable cause statement is the IRS's standard mechanism for requesting penalty relief on a late international information return (Forms 5472, 5471, 8865, 8938). It must demonstrate that:\n\n1. You acted in good faith and exercised ordinary business care and prudence.\n2. Your failure to file on time was due to circumstances beyond your reasonable control or based on a reasonable misunderstanding of the law.\n3. You corrected the failure as soon as you became aware of it.\n\nThe IRS evaluates each statement on its merits — there's no automatic waiver, but well-documented reasonable cause is typically accepted for first-time delinquencies. The IRS published DIIRSP specifically to encourage voluntary catch-up filing by international information return filers, and accepting most reasonable-cause requests is the implicit goal of the procedure.\n\nThe \"ordinary business care and prudence\" standard is the same one the IRS uses across penalty abatement contexts. The question isn't whether you were perfect — it's whether a reasonable person in similar circumstances would have known to file.",
      },
      {
        heading: "What to include",
        body: "A complete reasonable cause statement for Form 5472 includes:\n\n1. Taxpayer identification:\n• LLC legal name, EIN, US address.\n• Foreign owner name, FTIN or Reference ID, country of citizenship and tax residence.\n• Tax year(s) being filed late.\n\n2. Description of the failure:\n• Which years were not filed.\n• When and how you became aware of the Form 5472 obligation.\n• What triggered the discovery (Google search, advisor, online community, IRS reference materials).\n• Explicit acknowledgment that the form should have been filed timely.\n\n3. Reasonable cause narrative:\n• Specific circumstances that prevented timely filing.\n• Common bases: first-time foreign LLC owner unaware of US filing requirements; reliance on a tax professional who didn't flag the obligation; LLC formed via Stripe Atlas / formation service that didn't include annual compliance; language barrier; complex international circumstances.\n• Concrete dates and facts, not vague generalizations.\n\n4. Corrective action:\n• Explicit statement that you are filing all delinquent returns concurrently in this DIIRSP submission.\n• Steps taken to ensure future compliance (annual reminder, calendar entry, filing service subscription, professional advisor relationship).\n• Confirmation that no US tax is owed for the years in question (most foreign-owned single-member LLCs owe $0 US tax).\n\n5. Request:\n• Clear request that penalties be abated under DIIRSP.\n• Reference to IRS published DIIRSP procedure.\n\nTotal length: 1-2 pages. Concise and factual is more persuasive than long and discursive.",
      },
      {
        heading: "What NOT to put in it",
        body: "Avoid these red flags — they hurt your reasonable cause argument:\n\n• \"I didn't think it applied to me\" without explanation of why you reasonably held that belief.\n• Excuses that suggest negligence: \"I forgot,\" \"I was too busy,\" \"my accountant never told me\" without further context.\n• Statements that contradict facts visible on the form itself (e.g. claiming unawareness while reporting years of revenue).\n• Boilerplate language copied verbatim from forums or generic templates with no facts specific to your situation.\n• Aggressive or accusatory language toward the IRS.\n• Vague timelines or contradictory dates.\n• Claims of reliance on a professional without naming when you consulted them or what they advised.\n• Implications that tax avoidance motivated the non-filing.\n• Statements that you'd file in the future only if penalties are waived.\n• Excessive length (over 3 pages) — the IRS examiner has limited time per case.\n• Lawyer-speak when the underlying situation is simple.\n• Filing under DIIRSP when you actually owe US tax (use Streamlined Filing Compliance Procedures or another path instead).\n\nThe statement should be factual, specific to your circumstances, and concise — typically 1-2 pages.",
      },
      {
        heading: "Sample structure",
        body: "A well-structured reasonable cause statement follows this outline:\n\nHeader:\n• [LLC Legal Name]\n• EIN: [XX-XXXXXXX]\n• Foreign Owner: [Your Name]\n• Tax Year(s): [Year(s) being filed late]\n• Subject: Reasonable Cause Statement under DIIRSP\n\nOpening paragraph (1-2 sentences):\n• \"This statement is submitted under the Delinquent International Information Return Submission Procedure (DIIRSP) in support of the attached delinquent Form 5472 + pro forma Form 1120 for tax year(s) [year(s)]. We request that the IRC § 6038A penalties be abated based on reasonable cause as described below.\"\n\nBackground (3-5 sentences):\n• Describe the LLC, its formation date, the foreign owner, and the LLC's basic business activity.\n• Confirm the LLC owes no US federal income tax for the years in question (if true).\n\nReasonable cause narrative (1-3 paragraphs):\n• Specific facts about why the filing was missed.\n• Timeline of when and how you became aware.\n• Why your circumstances qualify as reasonable cause under the IRS's framework.\n\nCorrective action (1 paragraph):\n• Confirmation that all delinquent returns are being filed concurrently.\n• Steps taken to ensure future compliance.\n\nClosing:\n• \"Based on the foregoing, we respectfully request that the IRC § 6038A penalties for the tax year(s) be fully abated under DIIRSP.\"\n• Signature, date, printed name.\n\nThat's the entire structure. Roughly 1-2 pages depending on the depth of the narrative section.",
      },
      {
        heading: "Common reasonable cause narratives that work",
        body: "These narratives, when supported by your actual facts, typically meet the reasonable cause standard:\n\n• First-time foreign LLC owner unaware of Form 5472: \"I formed [LLC] in [year] through [Stripe Atlas / IncFile / etc.] as my first US business entity. As a [country] resident with no prior US tax filing experience, I was unaware of the specific IRC § 6038A reporting requirement for foreign-owned single-member LLCs introduced in 2017. I learned of the obligation in [month/year] through [source] and immediately began preparing this catch-up filing.\"\n\n• Reliance on formation service: \"I formed [LLC] through [Stripe Atlas / similar], whose service materials emphasized that they did not provide ongoing tax services. As a foreign-resident first-time US LLC owner, I assumed the annual federal compliance obligations were communicated by the IRS directly if applicable. I learned of the Form 5472 obligation in [month/year] and am filing all missed returns concurrently.\"\n\n• Pre-2017 LLC owner: \"My LLC was formed in [year before 2017] and prior to the §6038A rule extension in 2017, no Form 5472 filing was required for foreign-owned single-member LLCs. I was unaware that the 2017 regulatory change applied retroactively to entities formed before its effective date. Upon learning of the obligation in [month/year], I am filing all post-2017 missed returns concurrently.\"\n\n• Reliance on prior tax professional: \"For tax years [years], I retained [Name / Firm] in [country] to handle my international tax matters. They were not familiar with the specific US Form 5472 obligation for foreign-owned disregarded US entities. I learned of the obligation in [month/year] from [source] and am now filing under DIIRSP.\"\n\nIn all of these, the structure is: specific circumstances + how you discovered the obligation + prompt corrective action.",
      },
      {
        heading: "How our filer handles this",
        body: "Our 2-year and 3-year DIIRSP catch-up packages automatically include a Reasonable Cause Statement tailored to the most common foreign-LLC-owner scenario: first-time non-US owner who was unaware of the Form 5472 obligation until recently. The narrative is written to satisfy the standard IRS reasonable cause framework and follows the structure outlined above.\n\nAt the Reasonable Cause Statement step in the wizard, you can:\n• Use the default narrative as-is if it matches your situation.\n• Edit specific paragraphs to add personal context (when you became aware, what professional you relied on, etc.).\n• Replace the whole narrative if your circumstances are unique.\n\nAn accountant on our team reviews every late-filing package before we fax it to the IRS. If we see anything in the reasonable cause statement that's likely to be rejected (vague excuses, contradictions, missing dates), we'll reach out before submission.\n\nMost of our DIIRSP customers' first-time foreign-owner narratives are accepted by the IRS without follow-up.",
      },
      {
        heading: "What happens after you file",
        body: "After submitting a DIIRSP package with a Reasonable Cause Statement:\n\n• Week 0-2: Fax delivered to IRS Ogden PIN Unit. You have the timestamped transmission receipt as proof. No IRS acknowledgment yet — that's normal.\n\n• Month 1-2: Internal IRS processing at Ogden Service Center.\n\n• Month 3-6: IRS reviews the reasonable cause request. If accepted, you typically hear nothing — no news is good news.\n\n• Month 4-9: If IRS wants more information, you'll receive Letter 5891 or a similar request for documentation. Respond promptly with whatever the letter asks for.\n\n• Month 6-12: If IRS rejects the reasonable cause and assesses the penalty, you'll receive a CP-15 notice. You then have the right to appeal through the IRS Office of Appeals (separate process; consider engaging a tax professional).\n\nKeep the entire DIIRSP package (signed PDF, reasonable cause statement, fax receipt) for at least 6 years. If the IRS contacts you 18 months later about year 2 filing, the original receipts prove timely DIIRSP submission.\n\nFor most first-time foreign-owner DIIRSP cases with strong reasonable cause statements: penalty waived, no further IRS contact, file again next year on time.",
      },
      {
        heading: "Pricing for catch-up filings",
        body: "• 1-year late filing: Standard $199 · Rush $279 · Premium $449 (fax included, reasonable cause statement included)\n• 2-year DIIRSP catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year DIIRSP catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\nFiling all missed years together with one comprehensive reasonable cause statement gives the strongest abatement argument. Don't space them out — the IRS treats a single concurrent catch-up far more favorably than serial late filings.\n\nFor 4+ missed years, run two back-to-back packages or message us and we'll coordinate.\n\n100% money-back guarantee if we fail to submit.",
      },
      {
        heading: "When you should not use the template",
        body: "Skip our auto-generated statement and write your own (or hire a tax professional) if:\n\n• You've previously been audited or in IRS examination.\n• You've previously had penalties assessed for international information return failures.\n• Your circumstances are genuinely unusual (e.g. you actively decided not to file based on legal advice you now believe was wrong).\n• You're filing late as a result of an estate / inheritance / death-in-family situation that needs to be explained.\n• Your LLC has US-source income or any potential US tax liability.\n• You've received any prior IRS correspondence about the LLC.\n\nOur template is built for the most common case: first-time foreign owner who didn't know the rule existed. It's not designed for unusual circumstances. If your facts don't match the template, get individualized help.",
      },
      {
        heading: "Bottom line",
        body: "A Reasonable Cause Statement is the single most important document in a DIIRSP catch-up filing. Done well, it can save you tens of thousands of dollars in penalties. Done poorly, the IRS assesses $25,000 per form per year automatically.\n\nThe winning formula: specific facts, clear timeline, prompt corrective action, concise length, no vague excuses or boilerplate.\n\nOur DIIRSP packages include an auto-generated, accountant-reviewed Reasonable Cause Statement tailored to the most common foreign-owner scenario. Editable in the wizard if your facts differ.\n\n• 2-year DIIRSP catch-up: Standard $348 · Rush $428 · Premium $598 (fax included)\n• 3-year DIIRSP catch-up: Standard $497 · Rush $577 · Premium $747 (fax included)\n\n100% money-back guarantee if we fail to submit your filing to the IRS.",
      },
    ],
    faqs: [
      {
        q: "Does the IRS guarantee my penalty is waived if I submit a reasonable cause statement?",
        a: "No. DIIRSP is the IRS's stated process for requesting relief, but each request is evaluated on its facts. Most well-documented first-time late filings are accepted, but there's no formal guarantee.",
      },
      {
        q: "Can I write the statement myself instead of using a template?",
        a: "Yes — and if your circumstances are unusual you probably should. The statement just has to address the IRS's reasonable cause framework: good faith, circumstances beyond your control, prompt corrective action. Our filer's auto-generated narrative is editable in the wizard.",
      },
      {
        q: "Do I need a lawyer to write this?",
        a: "Almost never. A reasonable cause statement for a first-time late Form 5472 is a straightforward 1-2 page document. If you've been audited, are facing IRS collection action, or have complex circumstances, a lawyer or enrolled agent can help — but for a standard catch-up filing, the wizard handles it.",
      },
      {
        q: "What happens after I file?",
        a: "The IRS processes the return. If they accept the reasonable cause, you'll hear nothing (no news is good news, typically 3-6 months). If they assess a penalty anyway, they send a notice and you have the right to appeal — uncommon for clean first-time DIIRSP filings.",
      },
      {
        q: "How long should the reasonable cause statement be?",
        a: "1-2 pages. Concise and factual beats long and discursive. The IRS examiner has limited time per case — a tight, well-organized statement gets read in full.",
      },
      {
        q: "Should I include supporting documentation?",
        a: "Generally no for first-time foreign-owner cases. The statement itself is enough. If you reference specific events (e.g. you consulted a CPA on a specific date and they didn't flag the obligation), having those records on hand is wise but you don't attach them to the initial filing. If the IRS asks for documentation later, you can provide it then.",
      },
      {
        q: "Can I submit the same reasonable cause statement for multiple years?",
        a: "Yes — one statement can cover multiple late years. In fact, the IRS prefers one comprehensive statement covering all missed years over separate per-year statements. Our wizard auto-formats the statement to cover all years in the catch-up package.",
      },
      {
        q: "What if my reasonable cause is rejected?",
        a: "You'll receive a CP-15 notice with the assessed penalty. You have the right to appeal through the IRS Office of Appeals (different from DIIRSP — it's a formal appeal process). At that stage, consider engaging a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
      {
        q: "Does our service handle CP-15 abatement appeals?",
        a: "Not currently. We handle preventative DIIRSP filings only. If you've already received a CP-15, contact a tax attorney or enrolled agent who handles international information return penalty appeals.",
      },
      {
        q: "Can I sign the reasonable cause statement digitally?",
        a: "The reasonable cause statement is signed as part of the cover-letter / declaration portion of the DIIRSP package. The Form 1120's signature line (which gets the wet/ink signature) is what carries the legal signature for the package. The reasonable cause statement itself doesn't typically need a separate signature — your signature on the 1120 covers the whole submission.",
      },
    ],
    relatedSlugs: ["diirsp", "late-form-5472", "form-5472-penalty", "form-5472-deadline", "file-form-5472"],
  },
  // ────────────────────────────────────────────────────────────────────
  // PREMIUM (Google Ads) — noindex, premium pricing, premium positioning.
  // Slug is also registered in PREMIUM_SOURCES in src/lib/pricing.ts so the
  // pricing flows through wizard + checkout + Stripe end-to-end.
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "pro-form-5472",
    keyword: "form 5472 pro",
    title: "Form 5472 Priority Filing — Accountant-Reviewed, Same-Day Fax",
    metaDescription:
      "Priority Form 5472 filing for foreign-owned US LLCs. Direct accountant access, same-day IRS fax delivery, and end-to-end DIIRSP coordination. Done in 15 minutes.",
    h1: "Form 5472 Priority Filing — done right, same day.",
    intro:
      "Skip the queue. Our Priority plan gets your Form 5472 + pro forma Form 1120 prepared, reviewed by a tax accountant on our team, and faxed to the IRS Ogden PIN Unit the same business day you sign. Direct support line to the reviewing accountant from the moment you start. Avoid the $25,000 §6038A penalty with the smallest possible margin of error.",
    noindex: true,
    pricingMode: "premium",
    sections: [
      {
        heading: "Who Priority is for",
        body: "Priority is built for foreign LLC owners who would rather pay for certainty than save a few dollars. The most common Priority customers:\n\n• You're up against a tight IRS deadline and need same-day fax delivery, not next-business-day.\n• You've already received an IRS notice (CP-15 or letter) and want a professional handling the late filing.\n• You own multiple LLCs and value a single dedicated point of contact over self-serve forms.\n• You're a high-net-worth individual or family office where one $25,000 penalty would dwarf any plan-price difference.\n• You're a CPA / tax attorney filing on behalf of a client and need direct accountant collaboration.\n\nIf you'd rather DIY through a wizard at the lowest price, our standard plan starts at $199 — that's fine too. Priority is for customers who want the white-glove version.",
      },
      {
        heading: "What's included in Priority",
        body: "Every Priority filing includes:\n\n• Filled IRS Form 5472 + pro forma Form 1120 with Part V supporting statement.\n• Reasonable Cause Statement for late filings (DIIRSP), drafted by the accountant.\n• Same-day fax delivery to the IRS Ogden PIN Unit (orders signed by 4pm ET fax by EOD).\n• Direct email / WhatsApp line to the accountant reviewing your filing.\n• Priority review queue — your filing skips ahead of standard-plan filings.\n• Timestamped IRS Fax Transmission Receipt emailed back, plus stored in your portal.\n• 100% money-back guarantee if we fail to submit.\n\nYou still sign once on screen in your portal (no printing or scanning required). The accountant signs off on the package before we fax — no autopilot.",
      },
      {
        heading: "Priority vs. standard — what's the actual difference?",
        body: "Same filing, different service level:\n\n• Forms filed: identical. Both plans produce the same cover letter, pro forma 1120, Form 5472, and Part V supporting statement.\n• IRS acceptance: identical. Both plans satisfy the §6038A reporting requirement.\n• Review: standard gets accountant review on the day it queues (typically same-week). Priority gets accountant review same-day, with the reviewing accountant assigned to your case end-to-end.\n• Fax timing: standard faxes when ready in the queue (1-2 business days typical). Priority faxes same business day.\n• Support: standard support is via the in-portal chat. Priority adds a direct email / WhatsApp line to the accountant.\n• Multi-year DIIRSP coordination: standard handles up to 3 years via wizard. Priority can coordinate complex multi-year and multi-entity catch-up scenarios with personal guidance.\n\nThe filings are functionally equivalent. Priority is for customers who value time and white-glove service.",
      },
      {
        heading: "Same-day fax delivery — how it works",
        body: "1. Complete the 12-question wizard (about 15 minutes for first-time, 5 minutes for returning customers).\n2. Sign once on screen.\n3. We email the assigned accountant immediately.\n4. Accountant reviews end-to-end, reaches out if anything needs clarification.\n5. Accountant signs off — fax goes out to +1-855-887-7737 (IRS Ogden PIN Unit) the same business day.\n6. You receive the timestamped IRS Fax Transmission Receipt by email.\n\nCutoff: orders signed by 4:00 PM Eastern fax by end-of-day. Orders signed after 4pm ET fax the next business morning. Weekends fax Monday morning. Force-majeure on the IRS Ogden line (rare but happens) defers to certified mail with same-day postmark.",
      },
      {
        heading: "Priority pricing",
        body: "• 1 tax year — Priority: $149\n• 2 tax years (DIIRSP catch-up) — Priority: $249\n• 3 tax years (DIIRSP catch-up) — Priority: $349\n• IRS fax delivery & submission included.\n\nNo subscription. Pay once per filing. 100% money-back guarantee if we fail to submit your filing to the IRS.\n\nIf you'd prefer self-serve at lower prices, our standard plan starts at $199 — you can find it on our homepage. Priority is the same end-result with personal accountant handling and same-day delivery.",
      },
      {
        heading: "What happens if the IRS still assesses a penalty?",
        body: "DIIRSP (Delinquent International Information Return Submission Procedure) is the IRS-published path for catch-up filings with reasonable cause requests. Most well-documented first-time late filings are accepted with no penalty assessed. There's no formal IRS guarantee, but the acceptance rate for properly-prepared DIIRSP submissions is high.\n\nIf the IRS assesses a penalty despite a complete DIIRSP submission, the reviewing accountant on your case will help you respond and appeal. This isn't part of the base Priority service (penalty abatement appeal is a separate scope and may require additional fees), but having a relationship with the accountant who prepared the original filing significantly streamlines any follow-up.\n\nOur 100% money-back guarantee covers failure-to-submit. It does not cover IRS penalty assessment — no service can guarantee an IRS outcome.",
      },
      {
        heading: "Confidentiality and data handling",
        body: "• Your filing data is encrypted in transit (HTTPS) and at rest (database + storage).\n• Bank statements (if you upload any for transaction extraction) are processed in memory and never written to permanent storage.\n• Signed PDFs are held only long enough to fax to the IRS and deliver the receipt back, then deleted.\n• We retain the fax confirmation receipt + the basic entity/owner info needed to pre-fill next year's filing.\n• Direct accountant communication via email or WhatsApp is between you and the accountant; we don't store these transcripts beyond what's needed for service delivery.\n• We never share your data with third parties for marketing.\n• Standard data-retention policy applies — see Data Retention page.",
      },
      {
        heading: "Get started",
        body: "Click Start filing now. You'll fill in the 12-question wizard (about 15 minutes), sign once on screen, and the assigned accountant will take it from there with same-day fax delivery.\n\nPrefer to discuss your situation with the accountant before paying? Use the in-portal chat once you start, or email support@form5472prep.com with PRIORITY in the subject — a Priority response goes out the same business day.",
      },
    ],
    faqs: [
      {
        q: "Is the Priority plan a different filing than the standard plan?",
        a: "No — same filing, same forms, same IRS process. Priority adds a dedicated accountant, same-day fax delivery, and a direct support line.",
      },
      {
        q: "Why is Priority more expensive than the standard plan?",
        a: "Higher level of personal service: dedicated accountant assigned to your case, same-day fax delivery, direct email/WhatsApp line for questions. The filing scope is identical to the standard plan.",
      },
      {
        q: "Can I switch from Priority to standard?",
        a: "Yes — message us before payment. Once paid, we'll process at whichever plan you paid for. After completion, refund and re-purchase is the cleanest path.",
      },
      {
        q: "Does Priority guarantee my IRS penalty is waived for late filings?",
        a: "No service can guarantee an IRS outcome. Priority maximizes the strength of your DIIRSP submission — proper documentation, accountant-reviewed reasonable cause statement, fast filing — but the IRS makes the final decision. Most well-documented first-time late filings are accepted.",
      },
      {
        q: "I have 5+ missed years — can Priority handle that?",
        a: "Yes. Multi-year catch-up beyond 3 years requires coordination across multiple DIIRSP filings, which is exactly the kind of case Priority is built for. Message us at support@form5472prep.com with PRIORITY in the subject to scope the work.",
      },
      {
        q: "Can my CPA or tax attorney work with the assigned accountant?",
        a: "Yes. Direct accountant access on Priority is designed to support collaboration with your existing tax professionals.",
      },
      {
        q: "Same-day fax delivery — what's the cutoff?",
        a: "Orders signed by 4:00 PM Eastern fax the same business day. After 4pm ET, the fax goes out the next business morning. Weekends fax Monday morning.",
      },
      {
        q: "Do I still sign in the portal, or does the accountant sign?",
        a: "You sign — the signature must come from you as the LLC owner. The portal's canvas signature is embedded into the required signature boxes. The accountant reviews and signs off internally on the package before fax.",
      },
      {
        q: "What if I want to talk to the accountant before paying?",
        a: "Email support@form5472prep.com with PRIORITY in the subject. A Priority response goes out the same business day. Once you start a filing, the in-portal chat connects you to the team.",
      },
      {
        q: "Money-back guarantee — what does it cover?",
        a: "If we fail to submit your filing to the IRS, you get a 100% refund. It does not cover IRS penalty assessment (no service can guarantee an IRS outcome) or change-of-mind cancellations after the package has been faxed.",
      },
    ],
    relatedSlugs: [],
  },
];

export function getLandingPage(slug: string): LandingPage | null {
  return LANDING_PAGES.find((p) => p.slug === slug) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Topic clusters — drive the "Related guides" cross-linking block at the
// bottom of each landing page. Goals:
//   1. SEO: more internal links from topical neighbours pass authority sideways
//      between pages that already rank for related queries.
//   2. AEO / GEO: AI crawlers (and Google's site-quality signals) treat tight
//      topic clusters as evidence of expertise on a subject area.
//   3. UX: a reader on "form-5472-deadline" probably also wants "form-5472-fax-number"
//      and "diirsp"; surface them inline so they don't have to hunt.
//
// A page can belong to multiple clusters. Order within a cluster doesn't matter.
// noindex pages (e.g. /pro-form-5472) are intentionally excluded from being
// suggested — getRelatedSlugs() filters them out so paid-ad landing pages don't
// leak into organic neighbours.
const TOPIC_CLUSTERS: Record<string, string[]> = {
  // Step-by-step / instructional core
  "how-to": [
    "file-form-5472",
    "form-5472-instructions",
    "irs-form-5472",
    "1120-pro-forma-instructions",
  ],
  // Late filing & penalty mitigation
  "late-and-penalty": [
    "diirsp",
    "late-form-5472",
    "form-5472-penalty",
    "form-5472-reasonable-cause-statement",
  ],
  // Pro forma 1120 mechanics
  "1120": [
    "pro-forma-1120",
    "form-1120-foreign-owned-llc",
    "form-1120-disregarded-entity",
    "1120-pro-forma-instructions",
    "form-5472-vs-1120",
  ],
  // Operational / logistical
  "logistics": [
    "form-5472-deadline",
    "form-5472-fax-number",
    "file-form-5472",
  ],
  // State-specific guides
  "state": [
    "wyoming-llc-form-5472",
    "delaware-llc-form-5472",
  ],
  // Audience / persona
  "audience": [
    "foreign-owned-llc-tax",
    "single-member-llc-foreign-owner",
    "stripe-atlas-form-5472",
  ],
};

// Membership index: slug → list of cluster names it appears in.
const CLUSTER_MEMBERSHIP: Record<string, string[]> = (() => {
  const m: Record<string, string[]> = {};
  for (const [cluster, slugs] of Object.entries(TOPIC_CLUSTERS)) {
    for (const slug of slugs) {
      (m[slug] ??= []).push(cluster);
    }
  }
  return m;
})();

// Returns up to N suggested slugs for the given page, preferring:
//   1. Anything explicitly set on the page's relatedSlugs[]
//   2. Cluster mates (same topic cluster)
//   3. Other indexable pages (random tie-break, deterministic per slug)
// Always excludes the page itself, noindex pages, and duplicates.
export function getRelatedSlugs(forSlug: string, limit = 4): string[] {
  const out: string[] = [];
  const seen = new Set<string>([forSlug]);
  const indexable = new Set(
    LANDING_PAGES.filter((p) => !p.noindex).map((p) => p.slug),
  );

  const add = (s: string) => {
    if (out.length >= limit) return;
    if (seen.has(s)) return;
    if (!indexable.has(s)) return;
    out.push(s);
    seen.add(s);
  };

  // 1) Explicit overrides
  const page = LANDING_PAGES.find((p) => p.slug === forSlug);
  for (const s of page?.relatedSlugs ?? []) add(s);

  // 2) Cluster mates
  for (const cluster of CLUSTER_MEMBERSHIP[forSlug] ?? []) {
    for (const s of TOPIC_CLUSTERS[cluster] ?? []) add(s);
  }

  // 3) Deterministic fallback: walk the rest of LANDING_PAGES in order
  for (const p of LANDING_PAGES) add(p.slug);

  return out;
}

// Pull just the title + meta description for a slug (used by the related-guides
// renderer so it can show "title + one-line teaser" without re-importing the
// whole page object at every call site).
export function getLandingTeaser(slug: string): { title: string; description: string } | null {
  const p = LANDING_PAGES.find((x) => x.slug === slug);
  if (!p) return null;
  return { title: p.h1, description: p.metaDescription };
}
