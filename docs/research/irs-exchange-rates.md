# Research notes — IRS Yearly Average Currency Exchange Rates tool

Tool: `/irs-yearly-average-exchange-rates`
Retrieved: 2026-09-29 (raw HTML fetched directly with curl, table parsed
programmatically — not summarized by an LLM — to guarantee every row/column
matches the published source byte-for-byte).

## Primary source 1 — the rates table

URL: https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates
Page title: "Yearly average currency exchange rates | Internal Revenue Service"
Page's own footer: **"Page Last Reviewed or Updated: 17-Sep-2026"**

### Coverage captured

- 39 country/currency rows, 5 years of data: **2021, 2022, 2023, 2024, 2025**
  (the IRS page currently only publishes a rolling 5-year window; there is no
  older data on this page to omit or miss).
- Every row and every year cell from the table was captured. No cells were
  blank on the live page, so there are no nulled-out cells in this data set.
- Full row list (Country — Currency): Afghanistan–Afghani, Algeria–Dinar,
  Argentina–Peso, Australia–Dollar, Bahrain–Dinar, Brazil–Real, Canada–Dollar,
  Cayman Islands–Dollar, China–Yuan, Denmark–Krone, Egypt–Pound, Euro
  Zone–Euro, Hong Kong–Dollar, Hungary–Forint, Iceland–Krona, India–Rupee,
  Iraq–Dinar, Israel–New Shekel, Japan–Yen, Lebanon–Pound, Mexico–Peso,
  Morocco–Dirham, New Zealand–Dollar, Norway–Kroner, Qatar–Rial,
  Russia–Ruble, Saudi Arabia–Riyal, Singapore–Dollar, South Africa–Rand,
  South Korean–Won, Sweden–Krona, Switzerland–Franc, Taiwan–Dollar,
  Thailand–Baht, Tunisia–Dinar, Turkey–New Lira, United Arab
  Emirates–Dirham, United Kingdom–Pound, Venezuela–Bolivar (Fuerte).
- Row/column labels are reproduced exactly as published, including "South
  Korean" (not "South Korea") and "Bolivar (Fuerte)" — these look like IRS
  copy-editing choices, not our typos, so we keep them verbatim in the
  on-page table and in `IRS_EXCHANGE_RATE_LAST_UPDATED`/data comments.

### Two source typos found and how we handled them

The published HTML itself contains two malformed numeric cells (confirmed by
inspecting the raw `<td>` markup, not a rendering artifact):

1. **Euro Zone, 2024** is published as `0,924` (comma instead of a decimal
   point). The adjacent years (0.886, 0.924, 0.951, 0.846) make the intended
   value unambiguous: `0.924`.
2. **Russia, 2021** is published as `.73.686` (stray leading period). The
   adjacent years (83.755, 92.837, 85.509, 69.896) make the intended value
   unambiguous: `73.686`.

We do not silently "guess" a missing fact — these are not missing values,
they are transcription typos in an otherwise-present published number. Per
the plan's fail-closed rule we chose transparency over blind literalism:
`src/lib/tools/exchange-rates/data.ts` stores the corrected numeric `rate`
used by the converter/table, and flags both cells in a `SOURCE_TYPOS` array
with the literal published string, which the page renders as a footnoted
disclosure directly under the table ("Published on irs.gov as `0,924` /
`.73.686` — shown here as ... because ..."). This keeps the calculator
correct while never hiding a discrepancy with the source.

### Key sentences quoted from the rates page

- "To convert from foreign currency to U.S. dollars, divide the foreign
  currency amount by the applicable yearly average exchange rate in the
  table below."
- "To convert from U.S. dollars to foreign currency, multiply the U.S.
  dollar amount by the applicable yearly average exchange rate in the table
  below."
- "The Internal Revenue Service has no official exchange rate. Generally, it
  accepts any posted exchange rate that is used consistently."
- "For additional exchange rates not listed below, refer to the governmental
  and external resources listed on the Foreign currency and currency
  exchange rates page or any other posted exchange rate (that is used
  consistently)." (links to
  https://www.irs.gov/individuals/international-taxpayers/foreign-currency-and-currency-exchange-rates)
- Meta description on the page: "Income and expense transactions must be
  reported in U.S. dollars on U.S. tax returns. Review a chart of yearly
  average currency exchange rates."

These sentences are the basis for the page's "How we calculate this" copy
and the general disclaimer that the IRS does not mandate one official rate.

## Primary source 2 — Form 5472 and currency conversion

URL: https://www.irs.gov/instructions/i5472
Page title: "Instructions for Form 5472 (12/2024) | Internal Revenue Service"
Page's own footer: "Page Last Reviewed or Updated: 30-Apr-2026"

The exact sentence we rely on, from **Part IV — Monetary Transactions
Between Reporting Corporations and Foreign Related Party**:

> "State all amounts in U.S. dollars and attach a schedule showing the
> exchange rates used."

A parallel instruction appears under **Part VIII — Cost Sharing Arrangement
(CSA)**:

> "All amounts should be reported in U.S. dollars."

### What this does and does not support

- It supports: Form 5472 reportable-transaction amounts must be stated in
  U.S. dollars, and the filer must attach a schedule showing whatever
  exchange rate(s) were used.
- It does **not** say the IRS yearly-average table is mandatory or the only
  acceptable rate. The instructions never name a required rate for Form
  5472 specifically. The general "no official exchange rate" sentence from
  the rates page (source 1, above) is the only IRS statement we found on
  which rate is acceptable, and it says any *consistently used, posted*
  rate is accepted.
- The page copy therefore says the IRS yearly-average rate is "a commonly
  used, consistently posted rate you can use for the schedule Form 5472
  requires" — not "the rate the IRS requires you to use." This is the
  accurate, non-overclaiming way to connect the two primary sources.

## Unverifiable / out of scope

- No IRS statement was found that endorses using the yearly-average rate
  specifically for the spot-rate-based general translation rule (26 CFR
  §1.988 / IRC §988) that applies to most other income/expense items — only
  Form 5472's Part IV/VIII schedule requirement was in scope for this page,
  per the task brief. We did not state anything about the general §988
  spot-rate rule beyond quoting it does exist, to avoid overreaching past
  what was asked.
- Historical years before 2021 are not on the live IRS page and are not
  included; a future data refresh (each January, when the IRS adds a new
  year and rolls the earliest year off) is explicitly out of scope for this
  build per the plan's "owner-gated / out of scope" section.
