# Claude handoff — September11 AEO five-guide batch

## Status

Five supported article candidates and images complete. Final build, rendered checks and Git-linkedproductionverification in progress; do not inferdeployment from this initialhandoff. Releasecommit and liveevidence will be added afterverification.

This executes `docs/marketing/form5472-aeo-blog-execution-brief-2026-09-11.md`. It is distinct from the earlieruncommon-topicbatch already shipped today.

## New public paths

- `/blog/form-5472-irs-receipt-confirmation-status`
- `/blog/form-5472-line-1c-total-assets`
- `/blog/form-5472-pro-forma-1120-signature`
- `/blog/form-5472-ein-pending-deadline`
- `/blog/form-5472-1099-k-foreign-owned-llc`

All dated/updated2026-09-11, `draft:false`, organizationalauthor, threeFAQs, originaltables. Heroes at `public/blog/<slug>.webp`,1280×720,55–89KB. OriginalPNGpaths and fullprompts: `docs/research/2026-09-11-aeo-artwork.md`.

## Owned changes

- Five newMarkdownposts and fiveWebPheroes matching the slugsabove.
- Fivealtentries only in shared `src/lib/blog.ts`.
- Targetedcopychanges in `src/lib/landing-pages.ts` (25objects; no route/pricing/noindex/startSrc changes) and public `src/components/FaxReceipt.tsx`, `src/components/FaxReceiptProof.tsx`. These are samplemarketingcomponents, not operationalfaxreceiptgeneration.
- Existingposts: `amended-form-5472-correcting-errors`, `ein-for-foreign-owned-llc-without-ssn`, `ein-processing-time-international-applicants`, `form-5472-deadline-2026`, `form-5472-extension`, `form-5472-recordkeeping-checklist`, `how-to-fax-form-5472-irs`, `how-to-fill-out-form-5472`, `pro-forma-form-1120-foreign-owned-llc`, `stripe-paypal-wise-form-5472`.
- Research/evidence/review/baseline/artwork files named `docs/research/2026-09-11-aeo-*` and this sessionfile.

Core editorialdecisions and exact remainingissues are in `docs/research/2026-09-11-aeo-editorial-review.md`; perarticleledgers identifydirectauthority versusderivedrecommendations. Do not convert the assets/signature/EINcaveats into categoricalIRSclaims.

## Baseline

One accessible neutralPerplexityreceiptprompt citedexistinghomepage in clickableexpanded15-sourcelist; not an explicitservicerecommendation, not a postpublicationgain. Copilot sign-in gate means unavailable, notzero. Otherprompttopics and aggregateanalytics/conversionsunmeasured. No account/settings/analyticschanges or recurringautomation. ExactCSV: `docs/research/2026-09-11-aeo-baseline.csv`.

## Verification and release record

- BaseHEAD `03bbbe2`; fetchedorigin andconfirmed0ahead/0behind beforefinalreleasepreparation.
- PrismaClientgeneration passed.
- TypeScript passed afterrepair of interruptedagentedit.
- All244tests passed (17testfiles), finalprebuildrun17:17KST.
- Structuralcomparison: all existinglandingslugs/order/sectioncounts/FAQcounts and pricingMode/startSrc/noindex/relatedSlugs preserved.
- Finalbuild log `/tmp/form5472-aeo-final-build-20260911.log`; outcome pending.
- Local/publicbatchverifier: pending.
- Productiondeployment andthreeREPO-STATEmarkers: pending.

Deploy ONLY via `git push origin main`; neverVercelproductionCLI. No productionDBread/migration performed locally. Localblogbuild fallsbacktoMarkdown because localhostPostgresis unavailable; publicchecks are required to detectDBoverrides.

## Shared-worktree warnings

Userbrief and earlierbriefsessionMD were alreadyuntracked and are not incidentallyincluded in thisrelease. PreservepersonalIMGfiles, emailimageoriginals/variants and `src/lib/wizard/` untrackedwork. No email, analytics, checkout, pricing, customerrecords, schema, crawlerpolicy or hktax changes in thisbatch.

Subagents hitaccountusage limits duringfinalcleanup aftercompleting drafts; rootcompletedrepair/review/checks. No resetcreditused and no model/providerconfigurationchanged.

## Required separate follow-up

Qualified review of operationalcanvassignatureauthority; alignment of email/generatedreceiptproofwording; dedicatedaudit of remaininglegacytaxguides. These are not blockers for the narrowly supportednewarticles, but are not certifiedcorrect by thisrelease. See editorialreview forconcreteexamples. Do not silentlymodifycustomerfilings as a consequence of educationalcopy.
