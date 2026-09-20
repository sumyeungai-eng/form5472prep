# Nomad batch 4 — pre-publication source audit

Date: 2026-09-20
Scope: ten unpublished posts in `content/blog/`, highest-risk claims only.
Method: each claim grepped in the post first, then checked against the primary
source the post cites plus at least one independent official page. Where a first
page disagreed, a second official page was checked before recording a defect
(the batch-3 audit wrongly flagged a correct figure off a stale page).
No post was edited. Fixes are for the orchestrator.

Severity: **P0** wrong figure/date/line number/legal term, or a factual claim
with no supporting source — must fix before publishing. **P1** correct but badly
cited. **P2** wording. **VERIFIED** correct and sourced.

---

## Priority 1 — `pay-yourself-from-us-llc-non-resident.md`

### Verdict: VERIFIED. No hallucinated lines. One citation gap (P1).

The writer's concern was that a summarised read of the Form 5472 PDF invented
"Management fees" lines. That contamination is **not** present in the post. To
rule it out, the December 2023 form and the December 2024 instructions were
downloaded and the text extracted locally (`pypdf`) rather than summarised:

- `https://www.irs.gov/pub/irs-pdf/f5472.pdf` — Form 5472 (Rev. December 2023)
- `https://www.irs.gov/pub/irs-pdf/i5472.pdf` — Instructions (Rev. December 2024,
  "Use with December 2023 revision of Form 5472")

There is **no** line anywhere on the form labelled "management fees". The only
line touching managerial work is line 29 (paid) / line 15 (received),
"Consideration ... for technical, managerial, engineering, construction,
scientific, or like services". The post uses line 29 and quotes that label
verbatim.

Every line number and label in the post's mapping table, checked against the
extracted PDF text:

| Post's claim | Form 5472 (Rev. 12-2023) actual text | Verdict |
|---|---|---|
| Line 17, *Amounts borrowed*, beginning and ending balance or monthly average | "17 Amounts borrowed (see instructions) **a** Beginning balance **b** Ending balance or monthly average" | VERIFIED |
| Line 31, *Amounts loaned*, same balance basis | "31 Amounts loaned (see instructions) **a** Beginning balance **b** Ending balance or monthly average" | VERIFIED |
| Line 18, *Interest received* | "18 Interest received" | VERIFIED |
| Line 32, *Interest paid* | "32 Interest paid" | VERIFIED |
| Line 29, *Consideration paid for technical, managerial, engineering, construction, scientific, or like services* | identical, word for word | VERIFIED |
| Part IV = monetary categories | "Part IV Monetary Transactions Between Reporting Corporations and Foreign Related Party" | VERIFIED |
| Part V = other transactions of a foreign-owned U.S. DE, on an attached statement | "Part V Reportable Transactions of a Reporting Corporation That Is a Foreign-Owned U.S. DE" | VERIFIED |
| The Part V block quote | Post's quotation matches the form's Part V text exactly, including "Regulations section 1.482-1(i)(7)" and "contributions to and distributions from the entity" | VERIFIED |
| Draws, "salaries", contributions, reimbursements → Part V | Instructions, Part V: "any other transaction, as defined by Regulations section 1.482-1(i)(7) **not already entered in Part IV** ... including contributions to, and distributions from, the entity" | VERIFIED |
| "there is no compensation line for it" | Correct. No wage/compensation line exists. And the catch-all line 35 does not take a distribution: "Include amounts on line 35 **to the extent that these amounts are taken into account in determining the taxable income of the reporting corporation**" — a distribution is not. Part V is the right home. | VERIFIED |
| Loans are a **balance**, not a list of transfers; balance method = beginning + ending, monthly-average method = skip 17a/31a | Instructions line 17/31: "using either the outstanding balance method or the monthly average method. If the outstanding balance method is used, enter the beginning and ending outstanding balances ... If the monthly average method is used, skip line 17a and enter the monthly average" | VERIFIED |
| Value flows to line 1f; line 1h totals across all Forms 5472 | Instructions line 1f: "total value in U.S. dollars of all foreign related party transactions reported in Parts IV and VI (**and if the reporting corporation is a foreign-owned U.S. DE, Part V**)". Line 1h: "... of all Forms 5472 filed for the tax year" | VERIFIED — and note 1f **does** include Part V for a DE, so the post's step 6 is right |
| Two foreign related parties = two Forms 5472 | Instructions line 1g: "File a separate Form 5472 for each foreign or U.S. person who is a related party with which the reporting corporation had a reportable transaction" | VERIFIED |
| Attach an exchange-rate schedule | Instructions, Part IV: "State all amounts in U.S. dollars and attach a schedule showing the exchange rates used." | VERIFIED |
| Pro forma 1120, "Foreign-owned U.S. DE" across the top, only name/address and items B and E | Instructions: "The only information required to be completed on Form 1120 is the name and address of the foreign-owned U.S. DE and items B and E on the first page"; "'Foreign-owned U.S. DE' should be written across the top of the Form 1120" | VERIFIED |
| Cannot e-file; fax 855-887-7737; mail 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201 | Instructions: "If you are a foreign-owned U.S. DE, you cannot file Form 5472 electronically"; "Fax (300 DPI or higher) to 855-887-7737"; address identical | VERIFIED |
| $25,000 penalty; substantially incomplete = failure to file | Instructions: "A penalty of $25,000 will be assessed on any reporting corporation that fails to file Form 5472 when due and in the manner prescribed"; "Filing a substantially incomplete Form 5472 constitutes a failure to file Form 5472" | VERIFIED |

Directional note (not a defect): the interest row lists line 18 and line 32
without mapping each to a direction. Line 18 is correct where the owner pays the
LLC interest, line 32 where the LLC pays the owner. Both appear, so the row is
usable as written.

### The two doctrinal claims

**Owner of a disregarded entity is not its employee — VERIFIED.**
IRS, *Single member limited liability companies*
(`https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies`):
"For income tax purposes, an LLC with only one member is treated as an entity
disregarded as separate from its owner, unless it files Form 8832 and
affirmatively elects to be treated as a corporation." And: "An individual owner
of a single-member LLC that operates a trade or business is subject to the tax
on net earnings from self employment in the same manner as a sole
proprietorship." The post quotes the second sentence verbatim.

The post's handling of the employment-tax carve-out is also right, and is the
distinction most competing content misses: same page, "A single-member LLC that
is classified as a disregarded entity for income tax purposes is treated as a
separate entity for purposes of employment tax and certain excise taxes" — which
lets the LLC run payroll for staff without making the member an employee.

**Nonresident aliens are not subject to self-employment tax — VERIFIED,
verbatim.** IRS, *Social security tax, Medicare tax and self-employment*
(`https://www.irs.gov/individuals/international-taxpayers/social-security-tax-medicare-tax-and-self-employment`):
"Nonresident aliens are not subject to self-employment tax." Both of the post's
qualifications are on the same page and correctly stated — liability arising once
the individual becomes a US resident alien, and the Totalization Agreement
exception.

**P1 — the one citation gap.** Twice (body and FAQ) the post attributes the
W-2-designation rule to "The IRS's 'Paying yourself' page" with **no URL**, while
every other authority in the post is hyperlinked. The fact is correct; the page
reads: "You cannot designate a worker, including yourself, as an employee or
independent contractor solely by the issuance of Form W-2, Wage and Tax
Statement or Form 1099-NEC, Nonemployee Compensation." Fix: link
`https://www.irs.gov/businesses/small-businesses-self-employed/paying-yourself`.
Optionally restore "or independent contractor" and the Form 1099-NEC reference,
which the paraphrase drops.

---

## Priority 2 — `form-5472-argentina-residents-us-llc.md`

### Verdict: VERIFIED. The residency claim is right, and right for the right reason.

**No 183-day test for foreign nationals — VERIFIED, near-verbatim.** ARCA,
*Residencia* (`https://www.arca.gob.ar/gananciasYBienes/ganancias/conceptos-basicos/residencia.asp`):

- Argentine nationals: "Las personas humanas de nacionalidad argentina, nativas
  o naturalizadas, excepto las que hayan perdido la condición de residentes por
  haber adquirido la residencia permanente en un Estado extranjero o por
  permanecer en forma continuada en el exterior durante 12 meses."
- Foreign nationals: "Las personas humanas de nacionalidad extranjera que hayan
  obtenido su residencia permanente en el país o que, sin haberla obtenido,
  hayan permanecido con autorizaciones temporarias durante un período de 12
  meses."
- No 183-day test appears on the page at all.
- The six-month test appears once, and only for deductions: "A los efectos de
  las deducciones personales, se considera residentes a las personas humanas que
  vivan más de 6 meses en el país en el transcurso del año fiscal."

The post's sentence — permanent migratory residence or twelve months on
temporary authorisations, with a six-month test only for personal deductions and
no 183-day residency test for foreign nationals — tracks the source limb for
limb. This is a genuine differentiator against competing content that asserts a
flat 183-day rule; keep it.

**Provisional CUIT for foreign residents without a DNI — VERIFIED.** ARCA
(`https://www.arca.gob.ar/inscripcion/cuit-cdi/extranjeros-residentes-sin-dni.asp`):
"De aprobarse la solicitud, se asigna CUIT por un plazo de validez máximo de 2
años (o condicionada al plazo de admisión -residencia transitoria/temporaria-)".
Required documents match the post: "Documento o cédula de identidad del país de
origen (frente y dorso) o pasaporte", "Formulario 460 F/PD (completar rubros 1 a
5)", and "Certificado o comprobante vigente que acredite número de expediente
asignado por la Dirección Nacional de Migraciones donde conste el carácter de su
residencia". The post's "maximum of two years, or until the residency
authorisation expires" is an accurate rendering of the parenthetical.

**Digital-nomad transitory residence — VERIFIED on every limb.**
`https://www.argentina.gob.ar/servicio/obtener-una-residencia-transitoria-como-nomada-digital`:
"Artículo 24 inciso h) de la Ley N° 25.871, reglamentada por el Decreto N°
616/2010 y Disposición DNM N° 758/2022"; "una residencia transitoria por un
plazo de hasta ciento ochenta (180) días, prorrogable"; open to nationals of
countries that do not require a tourist visa; remote services "en favor de
personas físicas o jurídicas domiciliadas en el exterior". The page sets no
minimum income threshold and the post asserts none.

**Supporting claims — VERIFIED.** CUIL via ANSES
(`https://www.argentina.gob.ar/servicio/obtener-cuil`): "El Código Único de
Identificación Laboral (CUIL) es necesario al inicio de una actividad laboral y
se utiliza también para cobrar prestaciones que brinda ANSES" — the post's
description is exact. No US–Argentina treaty: Argentina is absent from the IRS
A-to-Z page, whose A entries are exactly Armenia, Australia, Austria, Azerbaijan
as the post states, and absent from the Treasury treaty table
(`https://home.treasury.gov/policy-issues/tax-policy/treaties`).

**Good practice worth preserving:** the post marks the CUIL-as-tax-key question
unverified and tells the reader to ask an Argentine accountant, rather than
guessing. It also refuses to quote a peso rate. Both are correct calls.

---

## Priority 3 — `form-5472-taiwan-residents-us-llc.md`

### Verdict: VERIFIED — nothing has taken effect. Not a P0.

Four independent checks, all consistent as at 2026-09-20:

1. **IRS treaty A-to-Z, fetched today.** Taiwan appears nowhere. The T entries
   are exactly Tajikistan, Thailand, Trinidad, Tunisia, Turkey, Turkmenistan —
   precisely the list the post prints.
   `https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z`
2. **Treasury treaty table, fetched today.** No Taiwan entry.
   `https://home.treasury.gov/policy-issues/tax-policy/treaties`
3. **CRS In Focus IF10256, "U.S.-Taiwan Trade and Economic Relations", updated
   24 February 2026** (text extracted locally from the PDF). Still conditional:
   "In 2025, H.R. 33 passed the House (423-1). H.R. 33/S. 199 includes the
   U.S.-Taiwan Expedited Double-Tax Relief Act and the U.S.-Taiwan Tax Agreement
   Authorization Act. ... It **would** amend the Internal Revenue Code of 1986
   ... It **would** authorize the President to negotiate a tax agreement with
   Taiwan and require a Senate vote on an agreement."
   `https://www.congress.gov/crs_external_products/IF/PDF/IF10256/IF10256.35.pdf`
4. **Post-February 2026 coverage** shows Taiwan still urging Senate passage in
   June 2026; no enactment. No enrolled (ENR) version of H.R. 33 exists.

Could not read: `congress.gov` bill pages return HTTP 403 to WebFetch, and
`govinfo.gov/app/details/BILLS-119hr33enr` returns HTTP 500 — so "no enrolled
version" rests on the absence of any public law and the CRS report's tense, not
on a direct negative fetch. `uscode.house.gov` refused the connection, so
26 U.S.C. § 894A could not be checked directly. Stated plainly here because the
post's own claim is a hedged "could not confirm", which those failures support
rather than undermine.

**Post's supporting sources — VERIFIED.**
- Treasury announcement: `https://home.treasury.gov/news/press-releases/jy2693`,
  dated **29 October 2024** as the post says: "The United States and Taiwan,
  under the auspices of the American Institute in Taiwan (AIT) and the Taipei
  Economic and Cultural Representative Office in the United States (TECRO), will
  begin negotiations on a comprehensive agreement to address double taxation
  issues." The post's characterisation — negotiations starting, not an agreement
  in effect — is exact.
- H.R. 33 received in the Senate 16 January 2025, read twice and referred to the
  Committee on Finance: the govinfo RFS text the post links is the correct
  primary record. Title I is indeed the "United States-Taiwan Expedited
  Double-Tax Relief Act", inserting a new § 894A.
- Taiwanese Taxpayer ID No.: `ntbt.gov.tw` confirms issuance by the National
  Immigration Agency, appearance on the Alien Resident Certificate and on the
  Record of ID No. for Hong Kong/Macau/PRC nationals and overseas Chinese, and
  the format change — old "two letters and eight Arabic numerals", new "one
  letter and nine numerals", "The replacement period is from January 2, 2021, to
  December 31, 2030". Every figure in the post matches.
- MOF alien income tax page: "An individual who stays in the Republic of China
  for 183 days or more within a taxable year is regarded as a resident and the
  individual income tax shall be declared and assessed by a progressive rate";
  the under-90-day and 90-to-183-day treatments are both there as described.

**P1 — `form-5472-taiwan-residents-us-llc.md`** — "Residents file the annual
return in the following May" sits immediately after, and reads as part of, the
Ministry of Finance citation, but that page does not state a filing month. The
fact is correct (1–31 May per the National Taxation Bureau of Taipei); add the
NTBT filing-period page as its own citation or detach the sentence from the MOF
attribution.

**Good practice worth preserving:** the post marks the Employment Gold Card tax
benefits unverified and refuses to state eligibility conditions or amounts.

---

## 4. `form-5472-hungary-residents-us-llc.md` — VERIFIED

All four treaty-termination limbs are exact, with no swapped limb and no
off-by-one year:

- Termination effective **8 January 2023** — Treasury: "Termination will be
  effective on January 8, 2023"; IRS: "termination was effective on January 8,
  2023". `https://home.treasury.gov/news/press-releases/jy0872`
- **Taxes withheld at source: ceased 1 January 2024** — IRS: "with respect to
  taxes withheld at source, the Convention ceased to have effect on January 1,
  2024".
- **Other taxes: taxable periods beginning on or after 1 January 2024** — IRS:
  "ceased to have effect with respect to taxable periods beginning on or after
  January 1, 2024".
  `https://www.irs.gov/businesses/international-businesses/hungary-tax-treaty-documents`
- **2010 convention never entered into force** — NAV's "Currently not applicable
  taxation treaties" table lists the USA, signed 2010.II.4., promulgated by Act
  XXII of 2010, status "ratification has not been completed by the partner
  country". `https://nav.gov.hu/en/taxation/double_taxation_treaties`

The IRS A-to-Z flag "CAUTION Treaty Terminated" against Hungary is reproduced
exactly, and the post's near-verbatim use of "Withholding agents may not accept
treaty claims for withholding taxes due on payments made on or after January 1,
2024" is sourced.

**183-day characterisation — VERIFIED, and the post is right.** The 183-day test
is the free-movement limb only, not a general test for all foreign nationals.
NAV's own booklet, footnoted to Szja tv. 3. § 2., renders it: "az a magánszemély,
aki a külön jogszabály szerinti szabad tartózkodás jogát egy naptári évben
legalább 183 napig Magyarországon gyakorolja (**elsősorban EU, EGT állampolgár**)"
— the post's "primarily the EU and EEA route" is a literal rendering of NAV's
parenthetical. Hungary's OECD residency submission confirms the same structure.
The post's third limb (third-country national with long-term residence
entitlement, "huzamos tartózkodási jogosultsággal rendelkező magánszemély", Act
XC of 2023) is also exact, which makes its follow-on — a White Card is not
long-term residence entitlement — correct.

**White Card — VERIFIED** against the official factsheet
(`https://oif.gov.hu/factsheets/white-card-residency-for-digital-nomads`): "A
White Card shall be only granted to a third country national who does not pursue
any gainful activity in Hungary and does not hold a share in a Hungarian
company"; maximum one year, "may be extended once for another year". The post
states no income threshold, so nothing is wrong; the factsheet does set one (net
income at or above EUR 3,000 for at least 6 months prior to entry, maintained
throughout), which is an optional addition, not a correction.

**P1** — the NAV information booklet is cited by name and date ("published 11
February 2025", which is exact: "Közzétéve: 2025. 02. 11.") but carries no URL
while every other authority in the post is linked. Add
`https://nav.gov.hu/pfile/file?path=%2Fugyfeliranytu%2Fnezzen-utana%2Finf_fuz%2F2025%2F04.-Maganszemelyek-kulfoldrol-szarmazo-jovedelme-2025.02.11`
and note it is Hungarian-only (the NAV English booklet listing has no
foreign-income booklet).

---

## 5. `form-5472-turkey-residents-us-llc.md` — VERIFIED

**"More than six months", not 183 days — VERIFIED, and the string "183" appears
nowhere in the post.** Income Tax Law No. 193 art. 4, official consolidated
text: "1. İkametgahı Türkiye'de bulunanlar ...; 2. Bir takvim yılı içinde
Türkiye'de devamlı olarak **altı aydan fazla** oturanlar (Geçici ayrılmalar
Türkiye'de oturma süresini kesmez.)" The post's "a domicile (ikametgah) in
Türkiye, or residing there continuously for more than six months in one calendar
year, with temporary departures not breaking the period" is a faithful
translation, and art. 3 taxing "Türkiye'de yerleşmiş olanlar" on worldwide income
is correctly stated. Art. 5 exceptions (study, treatment, rest, travel;
temporary assignment) exist as described.
Primary text: `https://dhgm.meb.gov.tr/dosyalar/Kanun/193_sayılı_Gelir_Vergisi_Kanunu.pdf`

Could not read: `mevzuat.gov.tr`, the URL the post cites for art. 4, returns
HTTP 200 but is a JavaScript-rendered shell — the article text is not in the
fetched HTML, so only the link's resolution could be confirmed, not its content.
The wording was verified from the official consolidated Law 193 PDF instead.
**P1:** cite that PDF (or a GİB page) as primary, since a reader following the
mevzuat link lands on a search shell.

**Digital nomad visa — VERIFIED, both figures, the age band, and the framing.**
Go Türkiye: "between the ages of 21-55" and "monthly income of 3,000 USD or
36,000 USD annually" — stated as **alternatives**, exactly as the post presents
them.
`https://goturkiye.com/digitalnomads/application-requirements-for-digital-nomad-visa-and-short-term-residence`
The travel-document validity, degree document, contract with a company outside
Türkiye and biometric photo all match, and the post's hedge on nationality
coverage is accurate against the published list.

**Other figures — VERIFIED.** Türkiye's IRS entry carries no caution note (unlike
Hungary's "Treaty Terminated" and Belarus/Russia's "Treaty Partially
Suspended"), and the instrument published there is the 1996 Convention, as the
post says. The potential-tax-ID application at
`https://dijital.gib.gov.tr/foreigners/kimlikNoBasvuru` requires no residence
permit, supporting the post's claim. The post self-flags the
identity-number-to-tax-number mapping as unverified and that gap could not be
sourced from a GİB page either — leave the hedge in place.

---

## 6. `form-5472-croatia-residents-us-llc.md` — VERIFIED (one P2 on currency)

**Treaty not in force as at 2026-09-20 — VERIFIED by four independent checks.**

- **Signed 7 December 2022** — Treasury jy1148 confirms the date and the "first of
  its kind" framing. The post's entry-into-force quotation is verbatim-exact,
  including "which in the case of the United States refers to the advice and
  consent to ratification by the U.S. Senate."
  `https://home.treasury.gov/news/press-releases/jy1148`
- **Protocol 28 April 2026** — Treasury sb0475, dated 28 April 2026, and the
  sentence the post quotes is exact: the protocol "will be transmitted as a
  package with the 2022 tax treaty to the U.S. Senate for that body's advice and
  consent to ratification." `https://home.treasury.gov/news/press-releases/sb0475`
  The protocol text is published at
  `https://home.treasury.gov/system/files/131/Treaty-Croatia-Protocol-04-28-2026.pdf`.
- **IRS A-to-Z, fetched today: Croatia absent.** The C entries are Canada, Chile,
  China, Cyprus, Czech Republic — exactly as the post states. IRS Table 3 (list
  of tax treaties) has no Croatia entry either.
  `https://www.irs.gov/pub/irs-lbi/table-3-list-of-tax-treaties.pdf`
- **Treasury treaty table, fetched today**, lists only the instruments: the
  Convention of December 7, 2022 and the Protocol of April 28, 2026 — no
  entry-into-force date.

So the post's conclusion is right, and the existence of a 2026 protocol amending
the 2022 convention is itself proof the convention was still unratified.

**P2 — currency.** The package has since been transmitted: it reached the Senate
as **Treaty Doc. 119-2, "Tax Convention with Croatia and Protocol Amending the
Tax Convention with Croatia", dated 14 September 2026** — six days before this
post's date. `https://www.govinfo.gov/app/details/CDOC-119tdoc2`
The post's "will be transmitted" is therefore stale. This does **not** change the
conclusion — transmission is not ratification and the treaty remains out of force
— and citing Treaty Doc. 119-2 would make the post's own argument stronger and
more current. Worth updating before publication.

**Digital-nomad temporary stay — VERIFIED.** mup.gov.hr: "Temporary stay is
granted for up to a maximum of eighteen months"; an extension is available where
less than 18 months was granted and "shall be granted for the maximum of 6
months"; a new application may be made "6 months after the expiry of previously
granted temporary stay". The post's 18 months / 6-month re-apply is correct, and
it correctly does **not** describe the permit as non-extendable. The
digital-nomad definition is quoted accurately, including "does not perform work
or provide services to employers in the Republic of Croatia", and the post's
observation that the page says nothing about tax is correct.
`https://mup.gov.hr/aliens-281621/temporary-stay-of-digital-nomads-286853/286853`
The post states no income threshold, so nothing is wrong; the page sets one
(2.5× average monthly net salary, minimum EUR 3,622.50) if the orchestrator wants
to add it.

**Croatian residency — VERIFIED.** Porezna uprava: permanent residence turns on
owning or possessing a dwelling "at least 183 days in one or two calendar years.
The actual stay in the apartment shall not be required"; habitual residence is a
"continuous or time-linked stay for at least 183 days in one or two calendar
years". The post's rendering matches on every limb, and no figure is unsourced.
`https://porezna-uprava.gov.hr/en/determination-of-residency-status/7378`
P2 only: "under the General Tax Act" is generically supported but no article
number is given. The OIB claims check out against the same authority.

---

## 7. `form-5472-south-korea-residents-us-llc.md` — **P0**

### P0 — the F-1-D workation visa terms are superseded

Post: *"The Consulate General of the Republic of Korea in Seattle describes the
F-1-D Workation (Digital Nomad) visa as open to someone employed by — or owning —
a foreign company for over a year who can work remotely in Korea, with a one-year
sojourn period, multiple entry, and **income above twice Korean GNI per
capita**."*

The Ministry of Justice made the F-1-D a formal programme and changed both
figures with effect from **30 June 2026**, before this post's date. Verified
directly against the MOJ release (`https://www.moj.go.kr/bbs/immigration/214/608294/artclView.do`):

- Formal operation: "'26년 6월 30일(화)부터 정식 운영".
- Maximum stay: "최대 체류기간을 3년으로 늘립니다" — increased from 2 years to
  **3 years** (previously "1회 1년씩 연장하여 최대 2년까지").
- Income: no longer a flat 2× GNI but "1인당 GNI의 1~2배 범위에서 완화된 소득
  요건" — a **tiered 1× to 2×** requirement by age and region, with "만 18~34세
  외국인이 비수도권에서 워케이션하는 경우 1인당 GNI의 1배 적용" (1× GNI, about
  KRW 52.41m) for applicants aged 18–34 outside the capital region.

**Correct fact:** as at 20 September 2026 the income requirement is 1×–2× GNI per
capita depending on the applicant's age and region, not "above twice GNI", and
the maximum stay is three years. Stating "income above twice Korean GNI per
capita" as the requirement is a wrong figure and must be fixed before publishing.

The post's hedge — "Requirements vary between consulates, so read the page for the
post you will apply through; the income figure moves with published GNI" — covers
consulate variation and GNI drift, but not a change in the rule itself, so it does
not save the sentence.

Note on the stay period: "a one-year sojourn period" is still defensible as the
period granted per stamp; the defect is the 2→3 year maximum being absent and the
flat 2× figure being wrong. Fix the income figure as a P0 and the duration as part
of the same rewrite.

**P1 (same paragraph) — wrong tier of authority.** The scheme is sourced to a
single consulate page on mofa.go.kr, which is itself stale. Cite the MOJ release
and `immigration.go.kr` instead; that is what let the superseded figures through.
The consulates also disagree with each other on the insurance figure (Seattle
EUR 70,000, Los Angeles KRW 100m) against MOJ's own annex (≥ KRW 100m). The post
states no insurance figure, so there is no error — but if one is added, use
KRW 100m.

**P2 (same paragraph)** — "employed by — or owning — a foreign company for over a
year": MOJ's current wording is one year "동일 업종에 근무", i.e. in the same
*industry*, not one year with that company. The "or owns" limb is supported by the
consulate page but omitted from MOJ's current annex.

**VERIFIED (same paragraph)** — "must not get employed in Korea or conduct profit
work in Korea" matches MOJ's "취업·영리활동 제한"; multiple entry and the
foreign-employer condition are both correct.

### P1 — the 183-day rule is cited to the wrong-tier instrument

Post: *"The threshold is 183 days. Article 2 of the Enforcement Decree of the
Income Tax Act deems a person to have a domicile in Korea where they have an
occupation usually requiring continual residence in Korea for at least 183 days,
or have family living with them in Korea…"*

The content is **accurate** — Enforcement Decree art. 2(3)1 and 2(3)2 say exactly
that — and the post is careful to say "deems… a domicile" rather than "defines a
resident". But the operative definition of a resident is **Income Tax Act
art. 1-2(1)(i)**: "any individual who has his/her domicile in Korea or maintains
a place of residence for at least 183 days therein", which the post never cites.
So "the threshold is 183 days" rests on the subordinate instrument. Not a P0 — add
the ITA art. 1-2(1)(i) citation.
`https://elaw.klri.re.kr/eng_service/jomunPrint.do?hseq=42184&cseq=1091091` ·
`https://www.oecd.org/content/dam/oecd/en/topics/policy-issue-focus/aeoi/korea-tax-residency.pdf`

The post's side-observation that older NTS pages still say "one year or longer" is
**VERIFIED** — the NTS English page still reads that way — and the history is
right: Act No. 12852 of 23 December 2014, effective 1 January 2015, replaced
"1년 이상" with "183일 이상".

### Verified in the Korea post

Korea appears in the K section of the IRS A-to-Z list alongside Kazakhstan and
Kyrgyzstan with its own treaty-documents page (correct); IRS Table 3 records
"Korea, Republic of — TIAS 9506 — Jan. 1, 1980". **The post quotes no treaty
rate**, so there is no rate to mis-state. "Korea does not issue a separate
standalone personal taxpayer number on top of those" is **VERIFIED** against
Korea's own OECD TIN submission, which lists only the Resident Registration
Number and the Business Registration Number and whose RRN structure table covers
foreigners. The Form 5472 mechanics (penalty, no e-filing, fax number, Ogden
address, pro forma 1120 items B and E) all match the instructions verbatim.

P2: Korea accepts a passport number as a TIN for CRS purposes, which is worth a
clause since the post's own "Unverified" box flags this exact gap. P2: from tax
years beginning 1 January 2026 the 183-day test can also be met by 183
*consecutive* days spanning two tax years — secondary sources only, not confirmed
on a primary page, so do not add it without one.

---

## Batch-wide notes

**P2 (8 of 10 posts: Argentina, Taiwan, Hungary, Turkey, Croatia, South Korea,
Costa Rica, coaches).** All say § 1.6038A-1 applies "for tax years beginning on
or after 1 January 2017". The regulation's applicability limb is taxable years
"beginning on or after January 1, 2017, **and ending on or after December 13,
2017**". The second condition is omitted. Practically irrelevant now — it only
bites on a short 2017 year — so this is a wording improvement, not a fix
blocking publication. If changed, change it in all eight for consistency.

**Pattern worth keeping.** Five of these posts explicitly mark a claim
unverified and send the reader to a local authority rather than filling the gap
(Argentina's CUIL-as-tax-key, Taiwan's Gold Card tax benefits, Turkey's tax-ID
mapping, Costa Rica's visa terms, Hungary's booklet scope). Every one of those
hedges was checked and none was contradicted elsewhere in its own post.

**Tooling lesson.** Do not audit Form 5472 line numbers from a summarised PDF
read. The form and instruction PDFs were downloaded and text-extracted locally,
which is what made a line-by-line check possible; the summarisation path is the
one that previously produced phantom "Management fees" lines.

---

## Addendum — Costa Rica / Mercury-Wise-Relay / coaches sub-audit, and fixes applied

The sub-audit for these three posts reported **no P0 findings**. It independently
recomputed both worked ledgers (bank-statements post: owner-in 15,000, owner-out 14,600
excluding the 180 never touching the bank, gross owner movements 29,300, bank net 43,370;
coaches post: 25,200 closing, 62,500 reportable) and confirmed every Form 5472 line
reference, address, fax number and price. It also confirmed the Costa Rica post kept its
promise: stay duration, renewal terms, income floor and insurance appear nowhere, not
even in the table or the seven FAQ answers.

Fixes applied to the working tree from all findings:

| Severity | File | Fix |
|---|---|---|
| **P0** | south-korea | F-1-D rewritten: maximum stay 3 years (was 2), income requirement tiered 1×–2× GNI by age and region (was a flat 2×), re-sourced to the Ministry of Justice release of 30 June 2026. Verified in the Korean original by the orchestrator. |
| P1 | south-korea | Resident definition now also cites Income Tax Act art. 1-2(1)(i), not only the Enforcement Decree. |
| P1 | taiwan | The 1–31 May filing period detached from the Ministry of Finance citation and attributed to the National Taxation Bureau of Taipei. |
| P1 | pay-yourself | The IRS "Paying yourself" page is now hyperlinked. |
| P1 | costa-rica | No longer attributes an "in force" framing to the IRS A-to-Z page, which does not use the phrase; points to Table 3 and Treasury's own list instead. |
| P1 | coaches | Teachable cited by its current article name (Teachable Pay) with a URL; Kajabi's article linked. |
| P1 | mercury-wise-relay | The unsourced Mercury export capability removed. support.mercury.com returns 403 to automated access even with a browser user-agent, so the post now says plainly that the page could not be read and does not restate the capability second-hand. |
| P2 | croatia | Records that the treaty-plus-protocol package reached the Senate on 14 September 2026 as Treaty Doc. 119-2; conclusion unchanged, since transmission is not ratification. |
| P2 | 22 places | § 1.6038A-1 now reads "beginning on or after 1 January 2017 and ending on or after 13 December 2017". |

Not applied, deliberately: the Turkey P1 asking for the consolidated Law 193 PDF as the
primary citation. The existing mevzuat.gov.tr link resolves 200 and the wording was
verified from the official consolidated text; no verified PDF URL was available to
substitute, and inventing one would be worse than the current citation.
