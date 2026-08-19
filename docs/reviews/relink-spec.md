# Re-link spec — restore internal links de-linked on 2026-08-19

Only these files: content/blog/{foreign-owned-llc-filing-requirements-checklist,how-to-fill-out-form-5472,ein-for-foreign-owned-llc-without-ssn,form-5472-uae-dubai-residents-us-llc,multi-member-llc-form-5472-or-1065,amended-form-5472-correcting-errors}.md
A render guard now makes links to not-yet-published sibling posts safe, so restore them. Find each phrase (exact, may have been lightly edited) and wrap it as a markdown link to the slug. Do NOT change any other text. No git writes.

| file | phrase to link | slug |
|---|---|---|
| foreign-owned-llc-filing-requirements-checklist | "See do I need an ITIN for Form 5472" (line ~99, ITIN bullet) — if the phrase was removed, append " See [do I need an ITIN for Form 5472](/blog/itin-required-form-5472)." to the end of that bullet | itin-required-form-5472 |
| foreign-owned-llc-filing-requirements-checklist | in the "Year-round — keep the records" step, link the words "Retain bank statements" sentence's subject: change to "Our [recordkeeping checklist](/blog/form-5472-recordkeeping-checklist) covers what to retain: bank statements, ..." keeping the existing list | form-5472-recordkeeping-checklist |
| how-to-fill-out-form-5472 | item 6 of the documents list ends "...if your country does not issue one." — append " Details in our [FTIN and reference ID guide](/blog/form-5472-ftin-reference-id-foreign-address)." | form-5472-ftin-reference-id-foreign-address |
| how-to-fill-out-form-5472 | "Line 1g is usually 1." paragraph — append " See [multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472)." | multiple-related-parties-form-5472 |
| how-to-fill-out-form-5472 | "You do not need a US ITIN to file Form 5472." paragraph — append " Details: [do I need an ITIN for Form 5472](/blog/itin-required-form-5472)." | itin-required-form-5472 |
| ein-for-foreign-owned-llc-without-ssn | "Do not confuse the EIN with an ITIN." paragraph — append " See [do I need an ITIN for Form 5472](/blog/itin-required-form-5472)." | itin-required-form-5472 |
| form-5472-uae-dubai-residents-us-llc | paragraph starting "Do not use an Emirates ID number as an FTIN" — append " Details in our [FTIN and reference ID guide](/blog/form-5472-ftin-reference-id-foreign-address) and [do I need an ITIN for Form 5472](/blog/itin-required-form-5472)." | both |
| form-5472-uae-dubai-residents-us-llc | bullet "If your US LLC transacts with your UAE free-zone company" — the sentence "You file one Form 5472 per related party..." → prepend "See [multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472). " | multiple-related-parties-form-5472 |
| multi-member-llc-form-5472-or-1065 | "3. A corporation in your group is 25% foreign-owned." paragraph — sentence "One Form 5472 is filed per related party, not one covering them all." → "Our [multiple related parties guide](/blog/multiple-related-parties-form-5472) covers the one-form-per-related-party rule." | multiple-related-parties-form-5472 |
| amended-form-5472-correcting-errors | "If you omitted a related party entirely" paragraph — after "reasonable cause statement." insert " See [multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472)." (keep the line-1g sentence) | multiple-related-parties-form-5472 |
| amended-form-5472-correcting-errors | step 1 "Get the original." — after "worth fixing" insert " — see our [recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)" before the em-dash clause | form-5472-recordkeeping-checklist |
| amended-form-5472-correcting-errors | records section, sentence "Retain the bank and payment-processor statements..." → prefix "Our [recordkeeping checklist](/blog/form-5472-recordkeeping-checklist) sets out what to retain and for how long: " and lower-case the following word | form-5472-recordkeeping-checklist |

Verify: `grep -c '](/blog/' <file>` increased by the expected count per file; `npx vitest run src/lib/blog.test.ts` passes; paste `git diff --stat`.
