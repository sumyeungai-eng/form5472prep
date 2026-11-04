# GSC long-tail query to page mapping (form5472prep.com)

Built 2026-11-04, read-only on the repo. Inputs: `gsc-longtail-2026-11-04.md` (tables A and D; B and C used to see what Google shows) and site source at `/Users/sumyeung/Developer/f5472-wt/moz-1104-fix` (main at `4cf1909`). Nothing in the repo was edited.

## How to read this

- **115 unique queries** (table A: 72, table D: 81, 38 in both) merged into **46 intents**; **412 impressions** in total (A alone = 278, D alone = 228). All 0 clicks. Position in the table is impression-weighted.
- Status: **ANSWERED** = a question-form heading (H2, H3, FAQ q, or a blog whose H1/title is the question with a lede answer) and a direct answer of 60 words or fewer directly under it. **BURIED** = the answer exists but not as a question heading, or not first, or over 60 words. **WRONG-PAGE** = Google shows a page that is not the best one. **GAP** = no page answers it. **OFF-TOPIC** = not our business or not real intent.
- "Google shows" comes from table C where the query is in the top 15, otherwise it is inferred from table B by impression and position match and labelled "likely", or "unknown" when the page cannot be inferred.
- Word counts in parentheses were counted from source. Proposed answer text uses only facts already on the site and is each 60 words or fewer; where a new fact would be needed it says **needs fact check**.
- Standing rule respected: every proposal is a body-level change (H2, FAQ, link). **None changes a `<title>`** (no bulk retitling; wait 3+ weeks between title batches).

## Counts by status

| Status | Intents | Impressions | Share |
|---|---:|---:|---:|
| ANSWERED | 25 | 131 | 32% |
| BURIED | 10 | 194 | 47% |
| WRONG-PAGE | 5 | 78 | 19% |
| GAP | 1 | 2 | 0% |
| OFF-TOPIC | 5 | 7 | 2% |
| **Total** | **46** | **412** | 100% |

Reading: content exists for almost everything (only 1 GAP, 2 impressions). The 15 BURIED and WRONG-PAGE intents carry 272 of 412 impressions (66%) and are mostly one heading rename, one FAQ or one internal link each. For 16 of the 25 ANSWERED intents the weighted position is 20 or worse, so the cause there is authority and cannibalisation, not wording.

## Summary table (sorted by total impressions, descending)

| ID | Intent | Sample query (impr, pos) | Total impr (wtd pos) | Google shows | Best page and existing heading | Status | Proposed change |
|---|---|---|---:|---|---|---|---|
| I01 | Form 5472 due dates: calendar-year 2025 tax-year dates, deadline 2026, extension | irs form 5472 calendar year 2025 tax year dates (42, 28.4) | 97 (38) | /blog/form-5472-deadline-2026 (pos 18-54), /blog/form-5472-deadline-tomorrow-urgent-filing (20-40), /form-5472-deadline-calculator (46-58), /faq (28), plus stragglers (short-tax-year, foreign-owned-llc-filing-requirements-checklist, /file-form-5472). Table C rows 1, 2, 7 | /blog/form-5472-deadline-2026. Existing: H2 "When is Form 5472 due?" (41w, ok); H2 "When is the Form 5472 for tax year 2025 due?" (76w, over 60); the dates table sits under a non-question H2 "The deadline calendar" | **BURIED** | (1) Rename H2 "The deadline calendar" to "What are the Form 5472 due dates for each calendar-year tax year (2024-2027)?" and add this above the table: "A calendar-year foreign-owned US LLC files Form 5472 with its pro forma Form 1120 by 15 April of the following year, or by 15 October with a timely Form 7004. Tax year 2025 was due 15 April 2026 (15 October 2026 extended); tax year 2026 is due 15 April 2027 (15 October 2027 extended)." (54w) (2) Cut the "tax year 2025" H2 answer to: "For a calendar-year foreign-owned LLC, the tax year 2025 Form 5472 and pro forma Form 1120 were due 15 April 2026, or 15 October 2026 if Form 7004 reached the Ogden PIN Unit by 15 April. Both dates have passed, so an unfiled 2025 return is now late." (48w) (3) Make it the one owner: add a link with anchor "Form 5472 deadline 2026 for a foreign-owned US LLC" from /form-5472-deadline-calculator and /faq (neither links it today); the urgent post is linked from no other page body. (4) Guide /form-5472-deadline has no tax-year-2026 / 2027 date (see facts list). |
| I02 | How to fill out Form 5472 free | how to fill form 5472 free (38, 70.5) | 38 (70) | Unknown (not in tables B/C). Position 70.5 | /blog/how-to-fill-out-form-5472 (title "Form 5472: How to Fill It Out Part by Part", 82w lede). The free answer lives elsewhere: /blog/form-5472-software-turbotax-taxact-hr-block FAQ "Is there free Form 5472 software?" (41w) and /blog/form-5472-cost FAQ "Can I file Form 5472 for free?" (33w) | **BURIED** | Add an FAQ to /blog/how-to-fill-out-form-5472: "Can I fill out Form 5472 for free?" with "Yes. The IRS publishes Form 5472 and Form 1120 as free fillable PDFs on irs.gov and charges no filing fee. A foreign-owned US LLC still has to print, sign and fax or mail the package, because it cannot e-file." (39w) Link it from /file-form-5472 H2 "How do I fill out Form 5472 online?". Second-largest single query; no title change needed. |
| I03 | What is Form 5472 / what is it used for | what is form 5472 (22, 59.5) | 25 (56) | Unknown (not in tables B/C). Positions 59.5 / 33.5 / 19 | /irs-form-5472: H2 "What is IRS Form 5472?" (48w). /blog/what-is-form-5472: H1 is the question and the 48w lede answers it, but its first H2 is "The 30-second version" (163w list) | **ANSWERED** | None on-page. Two pages share the intent; in GSC check which URL Google picks for "what is form 5472" before touching either. Optional: rename "The 30-second version" to "What is Form 5472, in 30 seconds?". |
| I04 | IRS penalty for late filing of Form 5472 (incl. $25,000 / site:irs.gov variants) | irs penalty for late filing of form 5472 (20, 44.9) | 24 (38) | /form-5472-penalty-calculator (15 @43), /blog/form-5472-filed-late-never-filed (11 @64), /services/late-form-5472-filing-service (2 @19.5), /faq (1 @81). The penalty guide /form-5472-penalty does not appear at all. The three site:irs.gov-style variants (4 imp, pos 4-8): page not identifiable from table B. Table C row 5 | /form-5472-penalty. Existing: H2 "What is the Form 5472 penalty and how can I avoid it?" (58w, opens "$25,000 per form for each tax year under IRC 6038A(d)"); H2 "How is the penalty calculated?" (47w) | **WRONG-PAGE** | Rename that H2 to "What is the IRS penalty for filing Form 5472 late?" (keep the 58w answer). Link to /form-5472-penalty with anchor "IRS penalty for late filing of Form 5472" from /form-5472-penalty-calculator (hero) and /services/late-form-5472-filing-service, neither of which links the guide today, and re-anchor the existing /form-5472-penalty link inside the penalty section of /blog/form-5472-filed-late-never-filed the same way. |
| I05 | How to file Form 5472 alongside the Form 1120 | how do i handle form 5472 filing alongside my form 1120? (21, 48.5) | 21 (48) | /file-form-5472 (14 imp @63), /blog/form-5472-vs-1120-f (10 @44.5, a different return), /blog/pro-forma-form-1120-foreign-owned-llc (4 @43), /form-5472-vs-1120 (3 @58), /form-5472-example (1 @10). Table C row 4 | /form-5472-vs-1120 (H2 "How are these forms filed together?" opens with a 7w lead-in then a numbered list; the answer is only the last sentence). Also /file-form-5472 FAQ "Do I file Form 5472 or Form 1120 — or both?" (31w, direct) | **WRONG-PAGE** | On /file-form-5472 rename that FAQ q to "How do I file Form 5472 alongside my Form 1120?" (answer unchanged). On /form-5472-vs-1120 put this above the list: "Form 5472 is attached behind the pro forma Form 1120 and the two go to the IRS Ogden PIN Unit as one package, by fax or mail, by the Form 1120 due date. You cannot file them at different times, and you get one transmission receipt for the whole package." (50w) Add a link from /blog/form-5472-vs-1120-f to /form-5472-vs-1120 (anchor "how Form 5472 and the pro forma Form 1120 are filed together"); that post links to neither, and no blog post links to /form-5472-vs-1120. |
| I06 | EIN filing service with no hidden fees | is it ein filing service with no hidden fees (21, 7.6) | 21 (8) | /blog/ein-cost-irs-free-vs-service (21 @7.6). Table C row 3 | /blog/ein-cost-irs-free-vs-service: relevant section is H2 "Avoid misleading “EIN fees”" (46w, a statement not a question); the flat price appears only in its last paragraph. Our /ein page says "Flat fee · one-time · no subscription" | **BURIED** | Rename the H2 to "Is there an EIN filing service with no hidden fees?" and lead with: "The IRS charges $0 for an EIN. Form5472 Prep's EIN service is a flat {{price.ein}}, one-time, with no subscription. Before paying any EIN service, confirm the total price, refund terms, deliverables, processing estimate and whether it applies for a new number." (41w) Needs owner check before the literal phrase "no hidden fees" is used for the EIN order (the site states it only for the 5472 filing, in src/lib/faq.ts id hidden-fees). Already pos 7.6 with 0 clicks, so this is the cheapest snippet win in the set. |
| I07 | Form 5472 filing service price for a foreign-owned single-member LLC | foreign-owned single member us llc form 5472 filing service price (15, 48.5) | 19 (49) | /single-member-llc-foreign-owner (7 @73), /irs-form-5472 (6 @23), /blog/form-5472-filing-service-comparison (3 @1.0), /services/foreign-owned-llc-tax-filing-service (1 @76), /blog/form-5472-foreign-corporate-owner (2 @96), /pricing (1 @95). Table C rows 6, 11 | /services/form-5472-filing-service (H2 "How much does the Form 5472 filing service cost?", 42w, states Standard/Express/additional-year prices). Same on /services/foreign-owned-llc-tax-filing-service (H2 "How much does the foreign-owned LLC tax filing service cost?", 40w) | **WRONG-PAGE** | Google surfaces two guides whose price sections are not question headings. On /irs-form-5472 rename H2 "Pricing" to "How much does a Form 5472 filing service cost for a foreign-owned LLC?" and open it with one sentence stating the Standard and Express prices (they are already in the bullets). On /single-member-llc-foreign-owner add the same H2 and a link to /services/form-5472-filing-service with anchor "Form 5472 filing service price". No competitor is named in these queries; the comparison post already ranks 1.0 for them. |
| I08 | IRS yearly average exchange rates (by currency and year) | irs yearly average exchange rates for converting foreign currencies into u.s. dollars (6, 10.5) | 14 (14) | /irs-yearly-average-exchange-rates (pos 9-30; 10.5 and 9.3 for the two largest). Table C rows 9, 15 | /irs-yearly-average-exchange-rates: FAQ "What is the IRS yearly average exchange rate?" (short, direct) + table. Data file covers EUR/CAD/CHF/INR for 2021-2025 and the quoted values match (EUR 2025 0.886, EUR 2024 0.924, CHF 2023 0.899) | **ANSWERED** | None. Top queries are already pos 9-11; the 28-30 rows (CHF 2023, INR 2024, EUR 2024) are rank, not content. |
| I09 | Form 5472 requirements for a foreign-owned single-member LLC ("official" phrasing) | irs foreign-owned single-member us llc form 5472 official (7, 79.6) | 13 (75) | /blog/form-5472-foreign-corporate-owner (9 imp @75-81; wrong audience, it is about a foreign COMPANY owner), /irs-form-5472 (2 @91.5). Table C rows 8, 13 | /do-i-need-to-file-form-5472: H2 "What are the Form 5472 filing requirements?" (53w) and H2 "Who must file Form 5472?" (52w). Also /irs-form-5472 H2 "Who is required to file Form 5472?" (58w) | **WRONG-PAGE** | Rename H2 "What are the Form 5472 filing requirements?" to "What are the Form 5472 filing requirements for a foreign-owned US LLC?" (keep the 53w answer). In /blog/form-5472-foreign-corporate-owner add a first-paragraph pointer: "If an individual rather than a company owns the LLC, see the Form 5472 filing requirements for a foreign-owned US LLC" linking /do-i-need-to-file-form-5472; the post has no link to it, to /irs-form-5472 or to /single-member-llc-foreign-owner. |
| I10 | What are reportable transactions for Form 5472 | what are reportable transactions for form 5472 (12, 22.7) | 12 (23) | Unknown (not in tables B/C). Position 22.7 | /blog/form-5472-reportable-transactions-examples: H2 "What counts as a reportable transaction on Form 5472?" (47w). Also central FAQ "What counts as a reportable transaction?" (48w) and /form-5472-reportable-transactions-checker | **ANSWERED** | None on-page (pos 22.7). If one link is wanted: /file-form-5472 and /do-i-need-to-file-form-5472 to the examples post with anchor "what are reportable transactions for Form 5472". |
| I11 | How / where to file Form 5472 | how to file form 5472 (11, 54.4) | 12 (51) | Unknown (not in tables B/C). Positions 54.4 and 14 | /file-form-5472: H2 "How do you file Form 5472 step by step?" (50w), H2 "Where do I send Form 5472?" (44w). /form-5472-fax-number: H2 "Where do I file Form 5472?" (44w) | **ANSWERED** | None. Both are already question + short answer; rank only. |
| I12 | Who must file / do I need to file Form 5472 (incl. non-resident owners, no reportable transactions) | do i need to file form 5472? (4, 24.5) | 11 (18) | /do-i-need-to-file-form-5472 (pos 10 for the no-transactions query); other queries pos 8-24 (page not shown in tables B/C for them: unknown) | /do-i-need-to-file-form-5472: H1 "Do I need to file Form 5472?" + H2 "Who must file Form 5472?" (52w, first <p> is the speakable answer) + FAQ "Who usually needs to file Form 5472?". No-transactions variant: /what-is-a-disregarded-entity H2 "Does a disregarded entity with no transactions file Form 5472?" (52w, "No, if it had no reportable transactions...") | **ANSWERED** | None needed (positions 8-24). Optional one-liner: add FAQ "Is Form 5472 required if there are no reportable transactions?" to the checker page, answer taken from the /what-is-a-disregarded-entity H2 above. |
| I13 | EIN (or LLC) without an SSN / social security number | how to get an ein without an ssn (2, 53.5) | 10 (72) | /blog/ein-for-foreign-owned-llc-without-ssn (11 imp, pos 54-98 per variant) | /blog/ein-for-foreign-owned-llc-without-ssn: H2 "Do you need an SSN or ITIN to get an EIN?" (46w) + FAQ "Can a non-US resident get an EIN?" (40w). Open-an-LLC variants: /can-a-foreigner-own-a-us-llc H2 "Can a non-resident alien own a US LLC?" (48w) | **ANSWERED** | None on-page; ranking only (pos 54-100). Do not add more FAQs here. |
| I14 | How to get an ITIN as a non-resident / foreigner (incl. outside the US, from India) | how to get itin number for non resident (4, 69) | 9 (72) | /blog/itin-application-checklist-nonresidents (6 imp @73.2 in table B; matches 4 @69 + the "foreigner" query @84 + the spouse query @79); other variants unknown | /blog/itin-application-checklist-nonresidents (title is a checklist, not a how-to; 49w lede lists what a complete application needs; first H2 "First confirm that an ITIN is the right number"). /itin hub has H2 "How does the ITIN service work?" | **BURIED** | Rename the first H2 on the checklist post to "How do I get an ITIN as a non-resident?" and put this under it: "A non-resident needs Form W-7, proof of identity and foreign status (usually a passport) and the US federal return the ITIN is for, unless a W-7 exception applies. Submit by mail to the IRS, at a Taxpayer Assistance Center, or through a CAA. Allow about 7 weeks, or 9-11 weeks overseas." (51w) Facts are in the post's lede and its "What happens after submission?" section. |
| I15 | How long an ITIN takes (7 variants) | how long to get an itin (2, 53) | 8 (37) | /blog/itin-processing-time-status-delays (4 imp, pos 1.0 / 36 / 37 / 39); other variants pos 33-53 unknown page | /blog/itin-processing-time-status-delays: title "How Long Does an ITIN Take? Processing Time and Delays" + 53w lede (seven weeks; nine to eleven during tax season / overseas). Also /itin H2 "How long does the ITIN take?" and central FAQ (44w) | **ANSWERED** | None on-page (H1 + lede answer it; rank is the issue). Optional: add H2 "How long does an ITIN take to process?" above the first section and move the lede sentence under it. |
| I16 | Change a single-member LLC to multi-member (incl. new EIN) | single member llc to multi member llc new ein (3, 43.3) | 8 (41) | /blog/single-member-to-multi-member-llc-what-changes (about 11 imp @44, shared with the reverse direction) | Same post: H2 "What does a second member do to your LLC's federal tax classification?" (25w) and FAQ "Do I file anything to make the partnership classification happen?" (39w). New-EIN variant: FAQ "Does the LLC need a new EIN?" (36w) and /blog/new-ein-llc-ownership-structure-change H2 "Moving from one member to several" (55w) | **BURIED** | The post answers consequences, the queries ask how. Rename that FAQ to "How do I change a single-member LLC to a multi-member LLC?" and use: "Admit a second member under your operating agreement and state law. No IRS filing is needed to create the partnership classification: a domestic LLC with at least two members is a partnership by default unless it files Form 8832 to elect corporate treatment. Form 5472 then generally stops applying going forward." (51w) Needs fact check on the first sentence (state-law mechanics); the rest is already on the page. |
| I17 | Who is the designee on an EIN form (third-party designee) | who is the designee in a ein form (4, 9) | 5 (12) | /blog/ein-third-party-designee-apply-on-your-behalf (5 imp, pos 9.0 and 22). Table C row 10 | Same post: title "Can a Third-Party Designee Get an EIN for You?", 57w lede, H2 "What does an SS-4 third-party designee authorise?" (40w) - phrased as "what", the query asks "who" | **BURIED** | Add an FAQ "Who is the designee on an EIN application?" with "The designee is the person you name in the Third Party Designee block of Form SS-4. You authorise them to answer IRS questions about that application and receive the newly assigned EIN. Their authority ends when the EIN is assigned and released, and they do not own or control the LLC." (51w) Already pos 9, so heading wording is the only gap. |
| I18 | What is a foreign TIN / foreign tax ID number | what is a foreign tin number (2, 64.5) | 5 (65) | Unknown (not in tables B/C). Positions 63-66 | /blog/form-5472-ftin-reference-id-foreign-address: H2 "What is an FTIN on Form 5472?" (58w). The post's first paragraph is only a "Last updated" line | **ANSWERED** | Optional wording tweak: H2 to "What is an FTIN (foreign tax ID number) on Form 5472?" so the queries' own words appear. No new facts. |
| I19 | Foreign EIN / does a foreign company need an EIN / "98" EIN | how to get a foreign ein (2, 65.5) | 5 (69) | Unknown (not in tables B/C). Positions 54-79 | No page uses the phrase "foreign EIN". Pieces: /blog/ein-for-foreign-owned-llc-without-ssn FAQ "Can a non-US resident get an EIN?" (40w); /blog/form-5472-foreign-corporate-owner FAQ "Does the foreign parent need a U.S. EIN?" (31w) | **BURIED** | Add an FAQ to /blog/ein-for-foreign-owned-llc-without-ssn: "Is there a separate foreign EIN?" with "There is no separate foreign EIN. A foreign owner with no SSN or ITIN gets the same nine-digit EIN by filing Form SS-4 with foreign on line 7b, by fax, mail or the international phone line. A foreign company that owns a US LLC does not need an EIN just for owning it; the LLC needs its own." (58w) The first sentence is an inference from those FAQs, and the "98" query needs the same fact check (facts list item 3); skip the 98 part. |
| I20 | IRS Letter 147C (what it is, how to request it) | how to get 147c letter (1, 62) | 5 (69) | /blog/lost-ein-147c-letter-replacement (1 imp @67; others unknown, pos 62-79) | Same post: "what is" is covered by H2 "What is the difference between CP575 and Letter 147C?" (47w). "How to request" is H2 "How does a foreign owner request Letter 147C?" (99w) and an 8-step list, no short answer | **BURIED** | Add H2 "How do I request Letter 147C from the IRS?" (or put it as the first answer in the existing H2) with "Call the IRS Business and Specialty Tax Line (800-829-4933 from inside the US, +1-267-941-1000 from abroad), authenticate as the responsible party or an authorised representative, and ask for Letter 147C, EIN Previously Assigned. The IRS can fax it or mail it to the address of record." (46w) Phone numbers are already in the post. |
| I21 | Pro forma 1120 for a foreign-owned DE, IRS "official" (site:irs.gov style, machine-looking) | site:irs.gov foreign-owned u.s. disregarded entity form 5472 pro forma 1120 official (3, 6) | 5 (16) | /services/pro-forma-1120-filing-service (4 imp @6.5: 3 @6 + 1 @8). The pos-53 variant: page unknown. Table C row 14 | Same page: H2 "What is a pro forma 1120, in plain terms?" (35w), H2 "Which boxes does the pro forma 1120 filing service fill in?" (42w, cites the Form 5472 instructions); outbound IRS links | **ANSWERED** | None. These look like AI fan-out queries; the page already ranks 6-8 and cites the IRS instructions. |
| I22 | Which rate to convert to US dollars (CAD to USD, rate in 2021) | where can i find cad to usd historical exchange rate data for my us tax return? (2, 6) | 4 (15) | /irs-yearly-average-exchange-rates (CAD query @6.0, "foreign currency exchange rate used..." @39; table B math: this page = 17 imp @14.7 across both exchange-rate intents). The "rate in 2021" query: unknown, likely the same page | /irs-yearly-average-exchange-rates FAQ "How do I convert foreign currency to USD using this table?" (with a worked example) and CAD 2021-2025 in the table. /blog/form-5472-currency-conversion-exchange-rates H2 "How do you convert foreign currency into U.S. dollars?" (31w) | **ANSWERED** | None. |
| I23 | What is a disregarded entity / disregarded LLC / foreign disregarded entity | what is a disregarded entity (2, 71.5) | 4 (69) | Unknown (not in tables B/C). Positions 44-88 | /what-is-a-disregarded-entity: H2 "What is a disregarded entity under IRS rules?" (43w) | **ANSWERED** | None; rank only. |
| I24 | Difference between FBAR and Form 8938 | what is the difference between fbar and form 8938 (3, 92.3) | 3 (92) | /blog/form-5472-vs-fbar-vs-form-8938 (3 imp @92.3) | Same post: the comparison is a table under H2 "How do the three compare side by side?" (14w lead-in); nearest FAQ is "Does Form 8938 replace the FBAR?" (32w, says they differ but not how) | **BURIED** | Low value (pos 92, off our core service). If done: add FAQ "What is the difference between the FBAR and Form 8938?" with "The FBAR (FinCEN Form 114) reports foreign financial accounts to FinCEN, electronically, when their aggregate value exceeds $10,000 at any time in the year. Form 8938 reports specified foreign financial assets to the IRS, attached to your annual return. Filing one does not satisfy the other." (46w) Every fact is already in that post's table. |
| I25 | C corp vs LLC for international founders | c corp vs llc for international founders and non residents (3, 85.7) | 3 (86) | /blog/llc-vs-c-corp-non-resident-founders (3 imp @85.7) | Same post: H2 "What is the main LLC vs C corp difference for a non-resident founder?" (57w) + FAQ "Is an LLC or C corp better for a non-US founder?" (36w) | **ANSWERED** | None; rank only. |
| I26 | Change a multi-member LLC / partnership to single-member | how to change multi member llc to single member llc (1, 25) | 3 (53) | /blog/single-member-to-multi-member-llc-what-changes (shared with single-to-multi; pos 25-87) | Only a table row in /blog/form-5472-change-of-ownership ("Two-member LLC redeems one member -> Single-member disregarded by default...") under H2 "Does adding or removing a member change the LLC's tax classification?" (60w). No heading or FAQ for this direction | **BURIED** | Add an FAQ to /blog/form-5472-change-of-ownership: "How do I change a multi-member LLC to a single-member LLC?" with "If one member is redeemed and one remains, a domestic LLC is single-member and disregarded by default unless it elects corporate treatment. A foreign-owned LLC then files Form 5472 with a pro forma Form 1120 when it has reportable transactions, and the partnership is closed out. A qualified tax adviser should set the effective date." (55w) Link it from the single-to-multi post, which is where Google sends this query. Needs fact check (see facts list) before the redemption wording is final. |
| I27 | EIN for non-US residents: speed, steps, EU founder ("in 3 days") | ein in 3 days for non us residents ? (1, 4) | 3 (32) | Unknown (not in tables B/C). Positions 4, 6, 85 | /ein: H2 "How long does it take to get the EIN?" and "Flat fee ... EIN delivered in 1-5 business days"; /blog/ein-processing-time-international-applicants (59w lede). Formation ("get a US LLC") is not something we sell | **ANSWERED** | None. Note the "3 days" in the query may come from the Express tier ("ready to sign in under 3 days", which is the 5472 package, not the EIN); keep the EIN speed line on /ein separate and quotable. |
| I28 | Non-intent strings: "is this good?", "where's the code", "do audiobook platforms provide tax reporting?" | is this good? (1, 7) | 3 (9) | Unknown (positions 7, 9, 11). The audiobook one likely lands on /blog/form-5472-kdp-authors-royalties | n/a - chat-widget text / noise; the audiobook query is about platform 1099/1042-S reporting, which the KDP post does not cover | **OFF-TOPIC** | None. |
| I29 | Total / yearly cost of a US LLC for a non-resident (year one and year two) | what are the yearly costs (1, 2) | 2 (6) | Unknown (not in tables B/C). Positions 9.0 and 2.0 (so something already ranks) | No page assembles it. Ingredients exist separately: /llc-annual-fees-by-state (state fees), /stripe-atlas-form-5472 (Atlas US$500, checked 2026-10-05), our EIN/5472/ITIN prices, /blog/wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads H2 "What do the state figures add up to over three years?" (20w) | **GAP** | Do not write a post for 2 impressions. Add a worked-example H2 to /llc-annual-fees-by-state: "What does a US LLC cost a non-resident in year one and year two?" using only sourced state fees plus our published prices. Needs fact check: formation fee and registered-agent range. |
| I30 | Change business address on an EIN | how to change business address for ein (2, 39.5) | 2 (40) | Unknown (not in tables B/C). Position 39.5 | /blog/ein-address-change-form-8822-b: title + 60w lede ("Changing your LLC's address generally does not require a new EIN. Businesses with an EIN application on file use Form 8822-B...") | **ANSWERED** | None; rank only. |
| I31 | How to fill out Form SS-4 for an LLC | how to fill out ss4 form for llc (2, 5.5) | 2 (6) | /blog/how-to-fill-out-form-ss-4-foreign-owned-llc (2 imp @5.5) | Same post: title is the question; 53w lede answers; line-by-line H2s | **ANSWERED** | None (pos 5.5). |
| I32 | Difference between Form 5471 and 5472 | what is the difference between form 5471 and 5472 (2, 35.5) | 2 (36) | Unknown (neither /blog/form-5472-vs-form-5471 nor /blog/what-is-form-5472 appears in table B). Position 35.5 | /blog/form-5472-vs-form-5471: H2 "What is the basic Form 5472 vs Form 5471 difference?" (25w). Also FAQ in /blog/what-is-form-5472 (45w) | **ANSWERED** | None; rank only. |
| I33 | ITIN for a non-resident spouse | how to apply for itin for non resident spouse (1, 79) | 1 (79) | /blog/itin-application-checklist-nonresidents (likely; table B arithmetic puts this 1 imp @79 there, not on the spouse post) | /blog/itin-nonresident-spouse-joint-return-w7 (not in table B): 47w lede; H2 "Put the package together in the right order" (43w) is the how-to but is not phrased as a question | **WRONG-PAGE** | Rename that H2 to "How do I apply for an ITIN for a nonresident spouse?" (answer unchanged) and link the spouse post from the checklist post with anchor "ITIN for a nonresident spouse". 1 impression; do it only when touching either post. |
| I34 | Most affordable US tax compliance for global startups (LLM-style, price) | most affordable us tax compliance solution for global startups? (1, 1) | 1 (1) | Probably /blog/form-5472-software-turbotax-taxact-hr-block (1 imp @1.0 in table B; unconfirmed) | /blog/form-5472-filing-service-comparison FAQ "What is the cheapest of these five Form 5472 services?" (37w, "Snapfile's $79 AI-reviewed filing, checked 24 October 2026") | **ANSWERED** | None. Price/competitor-adjacent: the answer names our sister brand Snapfile and a dated price; keep the date current. |
| I35 | How much an ITIN costs | how much does it cost to get an itin number (1, 59) | 1 (59) | /blog/itin-cost-irs-fee-caa-service (1 imp @59) | Same post: title is the question; 55w lede ("The IRS charges $0 to issue an ITIN. Any amount you pay is for preparation...") | **ANSWERED** | None. |
| I36 | How to change the name on an ITIN | how to change name on itin number (1, 10) | 1 (10) | Unknown (probably /blog/itin-name-change-marriage-passport; pos 10) | /blog/itin-name-change-marriage-passport: title + 60w lede + FAQ "Does marriage mean I need a second ITIN?" (29w) | **ANSWERED** | None. |
| I37 | Where to find a Wyoming certificate of good standing | where do i find the certificate of good standing for an wy llc? (1, 29) | 1 (29) | /blog/certificate-of-good-standing-foreign-owned-llc (1 imp @29) | Same post: FAQ "How do I get a Wyoming certificate of good standing?" (32w) | **ANSWERED** | None. |
| I38 | What happens if I miss my annual report deadline | what happens if i miss my annual report deadline (1, 70) | 1 (70) | /blog/llc-annual-report-late-fees-by-state (1 imp @70) | Same post: FAQ "What happens if I don't file my LLC's annual report?" (42w) and H2 (57w) | **ANSWERED** | None. |
| I39 | Tax-free LLC income for foreign owners | tax-free llc income for foreign owners of a us llc (1, 49) | 1 (49) | /blog/does-foreign-owned-llc-pay-us-tax (1 imp @49) | Same post: FAQ "Is a US LLC tax-free for non-residents?" (41w); /blog/us-llc-tax-free-digital-nomads-myth H2 "Is a US LLC tax-free for a nonresident owner?" (24w) | **ANSWERED** | None. |
| I40 | FinCEN BOI requirements for an LLC in 2026 ("official") | fincen beneficial ownership information reporting requirements llc 2026 official (1, 88) | 1 (88) | /blog/boi-reporting-foreign-owned-us-llc-2026 (1 imp @88) | Same post: H2 "What is the current BOI rule for a foreign-owned US LLC?" (36w) | **ANSWERED** | None. The answer matches /single-member-llc-foreign-owner FAQ "Do I file BOI report too?" (exempt since 26 March 2025). |
| I41 | IRS Ogden PIN Unit mailing address (pasted address) | internal revenue service 1973 rulon white blvd m/s 6112 attn: pin unit ogden, ut 84201 (1, 8) | 1 (8) | /form-5472-fax-number (1 imp @8.0) | Same page: FAQ "What's the IRS Ogden mailing address?" (21w); address constant matches the query string | **ANSWERED** | None. |
| I42 | How wholesale rates work for white-label formation partners | how do wholesale rates work for white label formation partners? (1, 9) | 1 (9) | /blog/form-5472-white-label-vs-standard-partner (1 imp @9.0) | Same post: H2 "How is partner delivery priced?" (46w: same per-filing price as direct customers, no platform fee, volume pricing on request) | **ANSWERED** | None. Price-adjacent: the asker assumes a wholesale tier; the site correctly says none is published. |
| I43 | Which EIN brands are recognized for full documentation (LLM-style prompt) | which ein brands are recognized for consistently maintaining full required documentation? (1, 5) | 1 (5) | /blog/ein-for-stripe-amazon-paypal-seller-account (1 imp @5.0) | n/a - no stable answer exists (brand-comparison prompt) | **OFF-TOPIC** | None. Brand/competitor-style prompt; we do not rank EIN providers. |
| I44 | Georgia (the country) customs service vs software (LLM-style prompt) | what should a business in georgia, the country, verify before ordering a managed customs service instead of using preparation software? (1, 8) | 1 (8) | /blog/tbilisi-digital-nomad-georgian-ie-us-llc-records (1 imp @8.0) | n/a - "managed customs service" is not our business | **OFF-TOPIC** | None. |
| I45 | VAT on an electric company car (UK) | can a company reclaim vat on electric car (1, 59) | 1 (59) | /blog/uk-company-car-vat-buy-lease-electric (1 imp @59) | n/a - UK VAT is not our business; page already exists | **OFF-TOPIC** | No query-driven change. Existing note stands: decide separately whether the UK company-car posts belong on this domain. |
| I46 | Rent an apartment with a tax ID number (tenant question) | can i rent an apartment with a tax id number (1, 49) | 1 (49) | /blog/itin-nonresident-rental-property (1 imp @49; page is about OWNING rental property) | n/a - tenant question, not our business | **OFF-TOPIC** | None. |

## New posts needed

None that the data justifies. The two candidates are smaller than a post:

1. **Total cost of a US LLC for a non-resident, year one and year two** (I29, 2 impressions, already ranking 9.0 and 2.0). Add one worked-example H2 to `/llc-annual-fees-by-state` instead of a new post. Needs sourced formation and registered-agent figures first.
2. **Multi-member to single-member LLC** (I26, 3 impressions). One FAQ on `/blog/form-5472-change-of-ownership` is enough; promote to a short post only if GSC later shows more than about 10 impressions a month and the fact check below passes.

Everything else is a heading rename, an FAQ, or an internal link on an existing page.

## Facts to check

| # | Item | Why | Source to check |
|---|---|---|---|
| 1 | Multi-member to single-member: tax result of a redemption, and what the partnership does | I26 answer is built from one table row only | IRS "Single Member Limited Liability Companies" page (already cited on the site); Rev. Rul. 99-6; Treas. Reg. 301.7701-3 |
| 2 | Mechanics of admitting a second member (operating agreement, state filings) | I16 first sentence is state law, not IRS | The formation state's Secretary of State LLC FAQ; or drop the sentence |
| 3 | EIN prefix "98" | "how to get a 98 ein number" (I19); no page mentions it | IRS "How EINs are assigned and valid EIN prefixes" page |
| 4 | "No hidden fees" for the EIN order | I06; site states it only for the 5472 filing (`src/lib/faq.ts`, id `hidden-fees`); `/ein` says flat fee, one-time, no subscription | Owner confirms the EIN order has no add-on charges |
| 5 | Formation fee and registered-agent annual fee ranges | I29 total-cost section | Formation state fee schedules; registered-agent providers' own price pages (dated) |
| 6 | `/form-5472-deadline` (guide, title "When Is It Due in 2026?") has no tax-year-2026 / 2027 date; its FAQ stops at tax year 2025. The `/file-form-5472` FAQ "What's the deadline to file Form 5472?" also gives only the tax-year-2025 example | I01: the 2026 deadlines have passed, people searching "deadline 2026" can mean tax year 2026 (due 15 April 2027, 15 October 2027 extended). Dates are already on `/blog/form-5472-deadline-2026` | Instructions for Form 1120 and Form 7004 (already cited); weekday roll (15 April 2027 is a Thursday per `/blog/foreign-owned-llc-compliance-calendar-2027`) |
| 7 | EIN speed wording | "ein in 3 days" (I27) likely conflates Express (5472, under 3 days) with the EIN service (1-5 business days; IRS fax about 4 business days) | `/ein`, `/faq` EIN timing lines vs Form SS-4 instructions |

## Other flags

- **Wrong or missing facts on existing pages:** only item 6 above. No query contradicts a fact we state. Exchange-rate queries quote IRS values (EUR 2025 0.886, EUR 2024 0.924, CHF 2023 0.899) that match `src/lib/tools/exchange-rates/data.ts`.
- **Competitor or price mentions:** no query names a competitor brand. Price-seeking queries: I07 (filing-service price), I06 (EIN fees), I34 (most affordable solution), I29 (total cost of a US LLC), I35 (ITIN cost), I42 (white-label wholesale rates). The "which EIN brands are recognized" prompt (I43) is brand-comparison in form but names none.
- **Machine-looking queries:** `site:irs.gov ... official`, `site.irs.gov` (a dot, so probably not treated as an operator, which would explain why our pages show), exact-rate-number queries and LLM-style prompts account for about 29 of the 278 table-A impressions. Do not optimise copy for them; they suggest AI agents are already reading the pages that rank 4-9.
- **Cannibalisation:** the deadline intent splits across at least 7 URLs (deadline post, urgent post, calculator, /faq, short-tax-year post, requirements checklist, /file-form-5472) and the canonical guide `/form-5472-deadline` is absent from the 8+ word results; `/blog/form-5472-deadline-tomorrow-urgent-filing` has no in-body link from any other page; `/form-5472-vs-1120` has no link from any blog post; the 1120 intent is answered best by a page Google does not show.
- **Zero clicks at good positions:** e.g. the EIN-fee query has 21 impressions at 7.6 and no clicks. A snippet-shaped heading and answer is the lever to test, not rank.

## Appendix: every raw query to intent

Source column: A# = row in table A, D# = row in table D (both listed when the query is in both).

| Source | Query | Impr | Pos | Intent | Status |
|---|---|---:|---:|---|---|
| A1 | irs form 5472 calendar year 2025 tax year dates | 42 | 28.4 | I01 | BURIED |
| A2 | form 5472 deadline 2026 foreign owned us llc | 40 | 48 | I01 | BURIED |
| A7 | irs form 5472 calendar year tax year dates | 12 | 45.3 | I01 | BURIED |
| D13 | when is form 5472 due | 2 | 6 | I01 | BURIED |
| D37 | when is the extension deadline | 1 | 9 | I01 | BURIED |
| D1 | how to fill form 5472 free | 38 | 70.5 | I02 | BURIED |
| D2 | what is form 5472 | 22 | 59.5 | I03 | ANSWERED |
| D17 | what is form 5472 used for | 2 | 33.5 | I03 | ANSWERED |
| D44 | what is irs form 5472 | 1 | 19 | I03 | ANSWERED |
| A5 | irs penalty for late filing of form 5472 | 20 | 44.9 | I04 | WRONG-PAGE |
| A19 | site.irs.gov foreign owned single member llc form 5472 pro forma 1120 25000 | 2 | 4 | I04 | WRONG-PAGE |
| A33 | site.irs.gov foreign owned single member llc form 5472 pro forma 1120 penalty 25000 | 1 | 7 | I04 | WRONG-PAGE |
| A36 | site:irs.gov foreign-owned u.s. disregarded entity form 5472 pro forma 1120 penalty $25,000 official | 1 | 8 | I04 | WRONG-PAGE |
| A4/D4 | how do i handle form 5472 filing alongside my form 1120? | 21 | 48.5 | I05 | WRONG-PAGE |
| A3/D3 | is it ein filing service with no hidden fees | 21 | 7.6 | I06 | BURIED |
| A6 | foreign-owned single member us llc form 5472 filing service price | 15 | 48.5 | I07 | WRONG-PAGE |
| A11 | form 5472 filing service price foreign-owned us llc | 4 | 48.8 | I07 | WRONG-PAGE |
| A9 | irs yearly average exchange rates for converting foreign currencies into u.s. dollars | 6 | 10.5 | I08 | ANSWERED |
| A15 | site.irs.gov yearly average currency exchange rates 2025 euro 0.886 | 3 | 9.3 | I08 | ANSWERED |
| A41 | irs yearly average currency exchange rates 2024 euro 0.924 | 1 | 11 | I08 | ANSWERED |
| A42 | yearly average currency exchange rates internal revenue service | 1 | 11 | I08 | ANSWERED |
| A46 | irs yearly average currency exchange rates 2023 switzerland franc 0.899 | 1 | 28 | I08 | ANSWERED |
| A47 | irs yearly average currency exchange rates 2024 india rupee | 1 | 28 | I08 | ANSWERED |
| A49 | irs yearly average currency exchange rates 2024 euro | 1 | 30 | I08 | ANSWERED |
| A8 | irs foreign-owned single-member us llc form 5472 official | 7 | 79.6 | I09 | WRONG-PAGE |
| A13 | irs form 5472 requirements for foreign-owned us llc | 4 | 80.5 | I09 | WRONG-PAGE |
| A43 | form 5472 instructions for foreign owned us llc | 1 | 16 | I09 | WRONG-PAGE |
| A67 | foreign owned single member us llc form 5472 requirement | 1 | 84 | I09 | WRONG-PAGE |
| D5 | what are reportable transactions for form 5472 | 12 | 22.7 | I10 | ANSWERED |
| D6 | how to file form 5472 | 11 | 54.4 | I11 | ANSWERED |
| D43 | where to file form 5472 | 1 | 14 | I11 | ANSWERED |
| D8 | do i need to file form 5472? | 4 | 24.5 | I12 | ANSWERED |
| D10 | who must file form 5472 | 3 | 15.7 | I12 | ANSWERED |
| A22/D15 | do non-resident llc owners need to file form 5472 | 2 | 15 | I12 | ANSWERED |
| D34 | who needs to file form 5472 | 1 | 8 | I12 | ANSWERED |
| A40/D40 | is form 5472 required if no reportable transactions | 1 | 10 | I12 | ANSWERED |
| A25/D21 | how to get an ein without an ssn | 2 | 53.5 | I13 | ANSWERED |
| A26/D22 | how to get an ein for llc without ssn | 2 | 62.5 | I13 | ANSWERED |
| A27/D26 | can i get an ein without a social security number | 2 | 98 | I13 | ANSWERED |
| D42 | how to get ein number without ssn | 1 | 11 | I13 | ANSWERED |
| A66/D76 | can you open an llc without a social security number | 1 | 81 | I13 | ANSWERED |
| A72 | getting an ein without a social security number | 1 | 98 | I13 | ANSWERED |
| D81 | can i open llc without ssn | 1 | 100 | I13 | ANSWERED |
| A12/D9 | how to get itin number for non resident | 4 | 69 | I14 | BURIED |
| D59 | how to apply for itin outside us | 1 | 58 | I14 | BURIED |
| D70 | how to apply for itin from india | 1 | 72 | I14 | BURIED |
| D71 | how to apply itin for foreigner | 1 | 73 | I14 | BURIED |
| A68/D77 | how to get an itin as a foreigner | 1 | 84 | I14 | BURIED |
| D78 | how to apply for itin for non-resident | 1 | 85 | I14 | BURIED |
| D20 | how long to get an itin | 2 | 53 | I15 | ANSWERED |
| A28/D27 | how long does an itin take to process | 1 | 1 | I15 | ANSWERED |
| D48 | how long does itin take | 1 | 33 | I15 | ANSWERED |
| A50/D49 | how long does it take to get a itin | 1 | 36 | I15 | ANSWERED |
| A51/D50 | how long does it take to get an itin number | 1 | 37 | I15 | ANSWERED |
| A53/D51 | how long does it take to apply for an itin | 1 | 39 | I15 | ANSWERED |
| D53 | how long to get itin | 1 | 42 | I15 | ANSWERED |
| A16 | single member llc to multi member llc new ein | 3 | 43.3 | I16 | BURIED |
| A23/D16 | how do i change a single member llc to a multi member | 2 | 33.5 | I16 | BURIED |
| A54 | converting a single member llc to a multi member llc | 1 | 40 | I16 | BURIED |
| A55/D52 | how to change a single member llc to multi member | 1 | 41 | I16 | BURIED |
| A57/D56 | how to convert single member llc to multi member | 1 | 48 | I16 | BURIED |
| A10/D7 | who is the designee in a ein form | 4 | 9 | I17 | BURIED |
| A44/D45 | what is a third party designee for ein | 1 | 22 | I17 | BURIED |
| D23 | what is a foreign tin number | 2 | 64.5 | I18 | ANSWERED |
| D63 | what is foreign tax id number | 1 | 63 | I18 | ANSWERED |
| D65 | what is foreign tax identifying number | 1 | 66 | I18 | ANSWERED |
| D66 | what is foreign tin number | 1 | 66 | I18 | ANSWERED |
| D24 | how to get a foreign ein | 2 | 65.5 | I19 | BURIED |
| D58 | does a foreign company need an ein | 1 | 54 | I19 | BURIED |
| D73 | how to get a 98 ein number | 1 | 79 | I19 | BURIED |
| D74 | how to get a foreign ein number | 1 | 79 | I19 | BURIED |
| D62 | how to get 147c letter | 1 | 62 | I20 | BURIED |
| D64 | how to request irs letter 147c | 1 | 66 | I20 | BURIED |
| A63/D67 | how to request a 147c letter from irs | 1 | 67 | I20 | BURIED |
| D69 | how to get a 147c letter | 1 | 71 | I20 | BURIED |
| D75 | what is irs letter 147c | 1 | 79 | I20 | BURIED |
| A14 | site:irs.gov foreign-owned u.s. disregarded entity form 5472 pro forma 1120 official | 3 | 6 | I21 | ANSWERED |
| A35 | site:irs.gov foreign-owned single-member llc form 5472 pro forma 1120 official | 1 | 8 | I21 | ANSWERED |
| A60 | irs foreign-owned single-member llc form 5472 pro forma 1120 official | 1 | 53 | I21 | ANSWERED |
| A21/D14 | where can i find cad to usd historical exchange rate data for my us tax return? | 2 | 6 | I22 | ANSWERED |
| D33 | what was the rate in 2021 | 1 | 8 | I22 | ANSWERED |
| A52 | foreign currency exchange rate used to convert to u.s. dollars | 1 | 39 | I22 | ANSWERED |
| D25 | what is a disregarded entity | 2 | 71.5 | I23 | ANSWERED |
| D54 | what is a disregarded llc | 1 | 44 | I23 | ANSWERED |
| D80 | what is a foreign disregarded entity | 1 | 88 | I23 | ANSWERED |
| A18/D11 | what is the difference between fbar and form 8938 | 3 | 92.3 | I24 | BURIED |
| A17 | c corp vs llc for international founders and non residents | 3 | 85.7 | I25 | ANSWERED |
| A45/D46 | how to change multi member llc to single member llc | 1 | 25 | I26 | BURIED |
| A56/D55 | how to change from multi member llc to single member | 1 | 48 | I26 | BURIED |
| A70/D79 | how to change llc partnership to single member | 1 | 87 | I26 | BURIED |
| A30 | ein in 3 days for non us residents ? | 1 | 4 | I27 | ANSWERED |
| A32/D30 | what is the fastest way to get a us llc with an ein as an eu founder? | 1 | 6 | I27 | ANSWERED |
| A69 | ein for non us residents step by step | 1 | 85 | I27 | ANSWERED |
| D31 | is this good? | 1 | 7 | I28 | OFF-TOPIC |
| D38 | where's the code | 1 | 9 | I28 | OFF-TOPIC |
| D41 | do audiobook platforms provide tax reporting? | 1 | 11 | I28 | OFF-TOPIC |
| D28 | what are the yearly costs | 1 | 2 | I29 | GAP |
| A39/D36 | what's the real total cost of a us llc for a non-resident, year one and year two? | 1 | 9 | I29 | GAP |
| D19 | how to change business address for ein | 2 | 39.5 | I30 | ANSWERED |
| A20/D12 | how to fill out ss4 form for llc | 2 | 5.5 | I31 | ANSWERED |
| A24/D18 | what is the difference between form 5471 and 5472 | 2 | 35.5 | I32 | ANSWERED |
| A65/D72 | how to apply for itin for non resident spouse | 1 | 79 | I33 | WRONG-PAGE |
| A29 | most affordable us tax compliance solution for global startups? | 1 | 1 | I34 | ANSWERED |
| A62/D61 | how much does it cost to get an itin number | 1 | 59 | I35 | ANSWERED |
| D39 | how to change name on itin number | 1 | 10 | I36 | ANSWERED |
| A48/D47 | where do i find the certificate of good standing for an wy llc? | 1 | 29 | I37 | ANSWERED |
| A64/D68 | what happens if i miss my annual report deadline | 1 | 70 | I38 | ANSWERED |
| A59 | tax-free llc income for foreign owners of a us llc | 1 | 49 | I39 | ANSWERED |
| A71 | fincen beneficial ownership information reporting requirements llc 2026 official | 1 | 88 | I40 | ANSWERED |
| A34 | internal revenue service 1973 rulon white blvd m/s 6112 attn: pin unit ogden, ut 84201 | 1 | 8 | I41 | ANSWERED |
| A38/D35 | how do wholesale rates work for white label formation partners? | 1 | 9 | I42 | ANSWERED |
| A31/D29 | which ein brands are recognized for consistently maintaining full required documentation? | 1 | 5 | I43 | OFF-TOPIC |
| A37/D32 | what should a business in georgia, the country, verify before ordering a managed customs service instead of using preparation software? | 1 | 8 | I44 | OFF-TOPIC |
| A61/D60 | can a company reclaim vat on electric car | 1 | 59 | I45 | OFF-TOPIC |
| A58/D57 | can i rent an apartment with a tax id number | 1 | 49 | I46 | OFF-TOPIC |

### Intent index

| ID | Intent | Queries | Impr | Status |
|---|---|---:|---:|---|
| I01 | Form 5472 due dates: calendar-year 2025 tax-year dates, deadline 2026, extension | 5 | 97 | BURIED |
| I02 | How to fill out Form 5472 free | 1 | 38 | BURIED |
| I03 | What is Form 5472 / what is it used for | 3 | 25 | ANSWERED |
| I04 | IRS penalty for late filing of Form 5472 (incl. $25,000 / site:irs.gov variants) | 4 | 24 | WRONG-PAGE |
| I05 | How to file Form 5472 alongside the Form 1120 | 1 | 21 | WRONG-PAGE |
| I06 | EIN filing service with no hidden fees | 1 | 21 | BURIED |
| I07 | Form 5472 filing service price for a foreign-owned single-member LLC | 2 | 19 | WRONG-PAGE |
| I08 | IRS yearly average exchange rates (by currency and year) | 7 | 14 | ANSWERED |
| I09 | Form 5472 requirements for a foreign-owned single-member LLC ("official" phrasing) | 4 | 13 | WRONG-PAGE |
| I10 | What are reportable transactions for Form 5472 | 1 | 12 | ANSWERED |
| I11 | How / where to file Form 5472 | 2 | 12 | ANSWERED |
| I12 | Who must file / do I need to file Form 5472 (incl. non-resident owners, no reportable transactions) | 5 | 11 | ANSWERED |
| I13 | EIN (or LLC) without an SSN / social security number | 7 | 10 | ANSWERED |
| I14 | How to get an ITIN as a non-resident / foreigner (incl. outside the US, from India) | 6 | 9 | BURIED |
| I15 | How long an ITIN takes (7 variants) | 7 | 8 | ANSWERED |
| I16 | Change a single-member LLC to multi-member (incl. new EIN) | 5 | 8 | BURIED |
| I17 | Who is the designee on an EIN form (third-party designee) | 2 | 5 | BURIED |
| I18 | What is a foreign TIN / foreign tax ID number | 4 | 5 | ANSWERED |
| I19 | Foreign EIN / does a foreign company need an EIN / "98" EIN | 4 | 5 | BURIED |
| I20 | IRS Letter 147C (what it is, how to request it) | 5 | 5 | BURIED |
| I21 | Pro forma 1120 for a foreign-owned DE, IRS "official" (site:irs.gov style, machine-looking) | 3 | 5 | ANSWERED |
| I22 | Which rate to convert to US dollars (CAD to USD, rate in 2021) | 3 | 4 | ANSWERED |
| I23 | What is a disregarded entity / disregarded LLC / foreign disregarded entity | 3 | 4 | ANSWERED |
| I24 | Difference between FBAR and Form 8938 | 1 | 3 | BURIED |
| I25 | C corp vs LLC for international founders | 1 | 3 | ANSWERED |
| I26 | Change a multi-member LLC / partnership to single-member | 3 | 3 | BURIED |
| I27 | EIN for non-US residents: speed, steps, EU founder ("in 3 days") | 3 | 3 | ANSWERED |
| I28 | Non-intent strings: "is this good?", "where's the code", "do audiobook platforms provide tax reporting?" | 3 | 3 | OFF-TOPIC |
| I29 | Total / yearly cost of a US LLC for a non-resident (year one and year two) | 2 | 2 | GAP |
| I30 | Change business address on an EIN | 1 | 2 | ANSWERED |
| I31 | How to fill out Form SS-4 for an LLC | 1 | 2 | ANSWERED |
| I32 | Difference between Form 5471 and 5472 | 1 | 2 | ANSWERED |
| I33 | ITIN for a non-resident spouse | 1 | 1 | WRONG-PAGE |
| I34 | Most affordable US tax compliance for global startups (LLM-style, price) | 1 | 1 | ANSWERED |
| I35 | How much an ITIN costs | 1 | 1 | ANSWERED |
| I36 | How to change the name on an ITIN | 1 | 1 | ANSWERED |
| I37 | Where to find a Wyoming certificate of good standing | 1 | 1 | ANSWERED |
| I38 | What happens if I miss my annual report deadline | 1 | 1 | ANSWERED |
| I39 | Tax-free LLC income for foreign owners | 1 | 1 | ANSWERED |
| I40 | FinCEN BOI requirements for an LLC in 2026 ("official") | 1 | 1 | ANSWERED |
| I41 | IRS Ogden PIN Unit mailing address (pasted address) | 1 | 1 | ANSWERED |
| I42 | How wholesale rates work for white-label formation partners | 1 | 1 | ANSWERED |
| I43 | Which EIN brands are recognized for full documentation (LLM-style prompt) | 1 | 1 | OFF-TOPIC |
| I44 | Georgia (the country) customs service vs software (LLM-style prompt) | 1 | 1 | OFF-TOPIC |
| I45 | VAT on an electric company car (UK) | 1 | 1 | OFF-TOPIC |
| I46 | Rent an apartment with a tax ID number (tenant question) | 1 | 1 | OFF-TOPIC |
