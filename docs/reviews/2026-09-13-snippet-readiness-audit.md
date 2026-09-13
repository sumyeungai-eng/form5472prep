# Snippet readiness audit — 2026-09-13

## Before (production, 2026-09-13; live run by the architect with the final audit script, before deploy)
```text
path                                         h23  q  40-60 35-70 <35 >80 noP ol4 ul4 tbl thead
/                                             29  22     8    10   9   0   1   1   6   1   1
/1120-pro-forma-instructions                  15  19     3     9   2   7   0   0   5   0   0
/about                                         8   4     0     1   3   0   0   1   2   0   0
/blog                                        129  16     0     0  16   0   0   0   0   0   0
/clemta-form-5472                             11  10     2     4   3   1   0   0   7   0   0
/contact                                       5   4     0     0   3   0   1   0   1   0   0
/data-retention                                6   0     0     0   0   0   0   0   1   2   2
/delaware-llc-form-5472                       15  20     3     7   3  10   0   0   5   0   0
/diirsp                                       15  19     3     8   2   9   0   0   6   0   0
/do-i-need-to-file-form-5472                   4   8     1     1   6   0   1   0   0   0   0
/doola-form-5472                              11  10     0     5   2   1   0   0   6   0   0
/editorial-policy                              6   0     0     0   0   0   0   0   0   0   0
/ein                                          26  21    14    15   5   0   1   0   5   0   0
/faq                                           7  51    27    37  13   0   0   0   0   0   0
/file-form-5472                               15  19     6     6   4   9   0   0   7   0   0
/firstbase-form-5472                          11  10     1     3   4   2   0   0   6   0   0
/foreign-owned-llc-tax                        15  19     0     0  10   8   0   0   7   0   0
/form-1120-disregarded-entity                 15  19     3     6   4   9   0   0   5   0   0
/form-1120-foreign-owned-llc                  15  19     5     9   1   8   0   0   6   0   0
/form-5472-deadline                           15  20     2     3   7  10   0   0   5   0   0
/form-5472-deadline-calculator                 8   6     0     0   5   0   1   0   0   0   0
/form-5472-fax-number                         15  19     1     3   7   9   0   0   6   0   0
/form-5472-germany                            13  16     2     5   4   7   0   0   5   0   0
/form-5472-instructions                       15  20     4     7   3   9   0   0   6   0   0
/form-5472-penalty                            15  20     4     6   4  10   0   0   5   0   0
/form-5472-penalty-calculator                  7   7     0     0   6   0   1   0   0   0   0
/form-5472-reasonable-cause-statement         15  18     5     6   4   8   0   0   6   0   0
/form-5472-uae                                13  16     2     6   3   7   0   0   5   0   0
/form-5472-vs-1120                            15  19     3     4   6   9   0   0   6   0   0
/irs-form-5472                                15  19     4     6   4   9   0   0   6   0   0
/itin                                         19  13     9    11   1   0   1   0   5   0   0
/late-form-5472                               15  19     7     9   1   9   0   0   6   0   0
/northwest-registered-agent-form-5472         11   9     0     4   4   0   0   0   6   0   0
/partners                                     15   9     3     5   3   0   1   0   2   0   0
/pricing                                      12   4     0     0   3   0   1   0   3   0   0
/privacy                                      14   0     0     0   0   0   0   0   2   0   0
/pro-forma-1120                               15  19     4     8   2   8   0   0   5   0   0
/security                                     10   0     0     0   0   0   0   0   3   0   0
/single-member-llc-foreign-owner              15  19     7     9   1   9   0   0   7   0   0
/startglobal-form-5472                        11  10     0     2   4   0   0   0   6   0   0
/stripe-atlas-form-5472                       15  18     5     7   3   8   0   0   6   0   0
/terms                                        13   0     0     0   0   0   0   0   0   0   0
/wyoming-llc-form-5472                        15  20     2     5   5  10   0   0   5   0   0
/zenind-form-5472                             11  10     1     5   3   1   0   0   7   0   0
/blog/ein-address-change-form-8822-b          11   5     0     0   5   0   0   0   1   1   1
/blog/foreign-owned-us-llc-fbar               14   9     4     4   5   0   0   0   1   3   3
/blog/form-5472-1099-k-foreign-owned-llc      13   9     1     3   6   0   0   0   1   3   3
TOTAL q=643 40-60=146 35-70=239 tables=10 thead=10
```
The landing-page-style `/...-form-5472` pages show `ol4=0`; they rely on unordered checklist sections rather than ordered extractable steps.
There is 1 marketing table on `/`, and it already has both `<thead>` and `<tbody>`.
The policy-style `/data-retention` page has 2 structured tables, both with `<thead>` and `<tbody>`.
Question-led intros are mostly outside the 40-60 word target: 140 of 643 questions hit the range, 232 land in the wider 35-70 band.
The clearest opportunity is the first answer block under question headings, especially on guide and blog pages with many short or long leads.

## Brief for the blog owner
The blog's tables are already correct. The audit counts each table that has both `<thead>` and `<tbody>`, and the sampled blog posts all pass that check because the Markdown table pipeline uses `remark-gfm`.

The gap is not table markup. The gap is the first paragraph under each question H2 in blog posts. Right now, only 0-3 of roughly 5-9 question-answer paragraphs per sampled post fall in the 40-60 word range that tends to be easiest for search engines and answer engines to lift cleanly.

Going forward, treat the first paragraph under every question H2 as the answer block. Keep it to 40-60 words, make the first sentence directly answer the heading, and include one concrete figure or form number when the topic supports it, such as Form 5472, Form 1120, Form 8822-B, $25,000, or a deadline.

Do not touch `content/blog/**` in this session. This is a brief for a future session and the blog owner, not a content change being made now.

## After (production, 2026-09-13, deployment form5472prep-kvpr4vqco Ready; commits ff7b94b..4f5c4e9)

```text
path                                         h23  q  40-60 35-70 <35 >80 noP ol4 ul4 tbl thead
/                                             29  22    10    11   8   0   1   1   6   1   1
/1120-pro-forma-instructions                  15  19     7    12   7   0   0   1  10   0   0
/about                                         8   4     0     1   3   0   0   1   2   0   0
/blog                                        129  16     0     0  16   0   0   0   0   0   0
/clemta-form-5472                             11  10     7     7   3   0   0   0   7   1   1
/contact                                       5   4     0     0   3   0   1   0   1   0   0
/data-retention                                6   0     0     0   0   0   0   0   1   2   2
/delaware-llc-form-5472                       15  20     7    12   8   0   0   1  10   1   1
/diirsp                                       15  19     6    11   8   0   0   1   9   1   1
/do-i-need-to-file-form-5472                   4   8     1     1   6   0   1   0   0   0   0
/doola-form-5472                              11  10     6     8   2   0   0   0   6   1   1
/editorial-policy                              6   0     0     0   0   0   0   0   0   0   0
/ein                                          28  23    15    16   6   0   1   1   5   1   1
/faq                                           7  51    50    51   0   0   0   0   0   0   0
/file-form-5472                               15  19    11    11   8   0   0   2   9   0   0
/firstbase-form-5472                          11  10     6     6   4   0   0   0   6   1   1
/foreign-owned-llc-tax                        15  19     8     8  11   0   0   0   9   2   2
/form-1120-disregarded-entity                 15  19    11    14   5   0   0   0   9   0   0
/form-1120-foreign-owned-llc                  15  19    11    15   4   0   0   1   8   1   1
/form-5472-deadline                           15  20     6     7  13   0   0   1   7   1   1
/form-5472-deadline-calculator                 8   6     5     5   0   0   1   0   0   0   0
/form-5472-fax-number                         15  19     4     6  13   0   0   2  13   1   1
/form-5472-germany                            13  16     5     7   9   0   0   1   6   0   0
/form-5472-instructions                       15  20     8    11   9   0   0   0  11   1   1
/form-5472-penalty                            15  20    10    12   8   0   0   1   8   2   2
/form-5472-penalty-calculator                  7   7     5     5   1   0   1   0   0   0   0
/form-5472-reasonable-cause-statement         15  18     8     9   9   0   0   0   9   0   0
/form-5472-uae                                13  16     7    10   6   0   0   1   6   0   0
/form-5472-vs-1120                            15  19     8     9  10   0   0   1  10   1   1
/irs-form-5472                                15  19    10    12   7   0   0   2   7   1   1
/itin                                         19  13     9    11   1   0   1   1   5   1   1
/late-form-5472                               15  19    12    14   5   0   0   2  10   1   1
/northwest-registered-agent-form-5472         11   9     5     5   4   0   0   0   6   1   1
/partners                                     15   9     3     5   3   0   1   1   2   0   0
/pricing                                      13   5     0     0   4   0   1   0   3   1   1
/privacy                                      14   0     0     0   0   0   0   0   2   0   0
/pro-forma-1120                               15  19    11    15   4   0   0   1   9   1   1
/security                                     10   0     0     0   0   0   0   0   3   0   0
/single-member-llc-foreign-owner              15  19    10    12   7   0   0   1  20   1   1
/startglobal-form-5472                        11  10     6     6   4   0   0   0   6   1   1
/stripe-atlas-form-5472                       15  18     8    11   7   0   0   1  11   1   1
/terms                                        13   0     0     0   0   0   0   0   0   0   0
/wyoming-llc-form-5472                        15  20     5     9  11   0   0   1   9   1   1
/zenind-form-5472                             11  10     6     7   3   0   0   0   7   1   1
/blog/ein-address-change-form-8822-b          11   5     0     0   5   0   0   0   1   1   1
/blog/foreign-owned-us-llc-fbar               14   9     4     4   5   0   0   0   1   3   3
/blog/form-5472-1099-k-foreign-owned-llc      13   9     1     3   6   0   0   0   1   3   3
TOTAL q=646 40-60=312 35-70=379 tables=36 thead=36
```

Reading: TOTAL 40-60 answers 146 → 312 of ~645 question headings; tables 10 → 36 (all with thead/tbody);
ordered lists now on /ein, /itin, /partners and every landing page (0 → 1–10 per page); /faq 51/51 in
40–70 words; question-heading answers over 80 words site-wide: 0. Remaining `<35` counts are short leads
that precede a list (exempt by rule), UI headings (CTAs, qualifier cards), and the checker/legal pages,
which were out of scope. Note the `>80` column counts the first `<p>` only; landing sections are now
paragraphs, so this reflects real snippet-eligible blocks.
