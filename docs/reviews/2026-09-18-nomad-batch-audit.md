# Nomad batch — primary-source claim audit (2026-09-18)

Scope: nine high-risk claims in `content/blog/form-5472-*` nomad posts. Read-only audit; no post edited.
Totals: **P0 1 · P1 2 · P2 3**. All of the P0 and P1 findings are in item 3 (Vietnam). Items 1, 2, 4, 5, 6, 7, 8 and 9 VERIFIED with no P0 or P1 (items 1 and 7 carry a P2 each).

## Findings

### P0-1 — Vietnam: wrong law number
- File: `content/blog/form-5472-vietnam-residents-us-llc.md` line 85: "promulgated as [Law No. 63/2025/L-CTN](vietnamnews.vn…)".
- Problem: the law's number is **Law No. 109/2025/QH15** on Personal Income Tax, passed by the National Assembly on 10 December 2025. "L-CTN" is the suffix of a Presidential promulgation order (Lệnh của Chủ tịch nước), not a law number. Calling it "Law No. 63/2025/L-CTN" names the wrong instrument.
- Substance checked against the official text and correct: Article 2(2)(a) says 183 days or more in a calendar year, or in 12 consecutive months from the first day of presence. Article 2(2)(b) covers a habitual residence: a registered permanent residence or a house rented under a fixed-term lease. Article 2(1) taxes residents on income arising inside and outside Vietnam. Article 29(1) sets the effective date at 1 July 2026.
- Fix: "the Law on Personal Income Tax, [Law No. 109/2025/QH15](https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm), effective from 1 July 2026…"
- Source: Official Gazette (Công báo) https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm (signed PDF/DOCX linked from that page; DOCX text read directly). Also listed at https://vanban.chinhphu.vn/?pageid=27160&docid=216495&classid=1&typegroupid=3 and in the Government's policy-portal explainer https://xaydungchinhsach.chinhphu.vn/gioi-thieu-luat-thue-thu-nhap-ca-nhan-so-109-2025-qh15-119260123145437408.htm.

### P1-1 — Vietnam: state-media citation where an official one exists
- Same line 85. The citation goes to vietnamnews.vn. Replace it with the Công báo URL above, which is also the P0 fix.

### P1-2 — Vietnam: 12-digit personal ID as tax code stated for all readers, but it applies to Vietnamese citizens
- File: same post. Line 67: "Enter your Vietnamese tax code, which since 1 July 2025 is your 12-digit personal identification number". The same statement appears in the line 75 table row and the line 128 FAQ answer. The post's audience explicitly includes foreign "long-staying remote workers" (line 13).
- Problem: the date (1 July 2025), the Circular (86/2024/TT-BTC, 23 Dec 2024) and the 12-digit MPS number are all correct. However, the cited Government source describes the 12-digit number as "the personal identification number **of a Vietnamese citizen**". Foreign nationals without a national-population-database ID keep the 10-digit tax code issued by the tax authority. Line 77 hedges ("use whichever Vietnamese tax number is currently valid"), but lines 67, 75 and 128 contradict that hedge for a foreign reader.
- Fix: in lines 67, 75 and 128, say that Vietnamese citizens use the 12-digit personal ID and that foreign nationals use the 10-digit tax code issued to them by the tax authority.
- Source: https://en.baochinhphu.vn/id-numbers-to-be-used-as-personal-tax-code-from-july-2025-111241230102120542.htm (the "Vietnamese citizen" wording). The foreigner 10-digit rule is confirmed only by secondary sources, including EY Vietnam (https://www.ey.com/en_vn/technical/tax/tax-and-law-updates/tax-alert-february-2025-tax-registration-as-per-circular-86). I did not read the Circular 86 text itself.

### P2-1 — Vietnam: split effective date
Law 109/2025/QH15 Art. 29(2): the provisions on residents' business and salary income apply from the **2026 tax period** (i.e. all of 2026), while the rest takes effect 1 July 2026. Optional clause.

### P2-2 — Georgia: omitted qualifiers (claim itself verified)
Art. 90(3) limits small-business taxable income to **Georgian-source** income. Arts. 88–90 also set a GEL 700,000 limit for wine- and agro-tourism operators. The post makes no contrary claim, but adding "on Georgian-source income" would stop readers from assuming the 1% covers foreign-client income.

### P2-3 — Indonesia: paraphrase of "Penduduk"
Line 47 says "registered as an Indonesian resident in the civil registry". PMK 112/PMK.03/2022 Art. 1(2) defines Penduduk as "Warga Negara Indonesia dan orang asing yang bertempat tinggal di Indonesia" (Indonesian citizens and foreigners residing in Indonesia). "In the civil registry" is an interpretation, not the text. Suggest: "an individual who is a resident (penduduk) — an Indonesian citizen or a foreigner residing in Indonesia — uses their NIK".

## Verified items

1. **Georgia (highest priority): VERIFIED.** https://matsne.gov.ge/en/document/view/1043717 is the Tax Code of Georgia. The latest consolidated publication (#245) is dated 25/06/2026, matching the post. The HTML page loads the text by JavaScript, so I read the official PDF: https://matsne.gov.ge/en/document/download/1043717/245/en/pdf.
   - Art. 88(1): small business status may be granted to an "entrepreneur natural person".
   - Art. 88(2): the Government may prohibit activities from the status.
   - Art. 89(1): the tax authority grants the status.
   - Art. 89(2)(a): the status is revoked when gross income "according to 2 calendar years has exceeded GEL 500 000 in each calendar year".
   - Art. 90(1): 1%. Art. 90(2): 3% from the month the GEL 500,000 limit is exceeded, to the end of the calendar year.
   - Art. 66(6): non-citizens get a 9-digit identification number. Art. 66(7): the number is permanent.
   - Every figure and article number in the post matches.
2. **Malaysia: VERIFIED.**
   - The LHDN page https://www.hasil.gov.my/en/individu/taraf-mastautin/ quotes ITA 1967 s.7(1)(a) as "one hundred and eighty-two days or more", and (b)–(d) as described, including the 90-day rule in (c).
   - The Ministry of Digital page (7 Jun 2024) confirms: MDEC under the Ministry of Digital; founders and CEOs added; USD 60,000/yr or USD 5,000/month for non-IT/non-digital applicants; a "two-year" period. It gives no separate IT threshold, which the post correctly marks as unverified.
3. **Vietnam:** see P0-1, P1-1, P1-2 and P2-1. The 183-day rule and the 1 July 2026 date are correct against the official text. The Circular 86 date and the 1 July 2025 change are correct per baochinhphu.
4. **Thailand: VERIFIED.**
   - The RD Legal Affairs Division Q&A (Thai PDF, https://www.rd.go.th/fileadmin/download/news/question_p161_162.pdf) sets two conditions: (1) foreign income arising from 1 Jan 2567 (2024), in a tax year with 180+ days in Thailand; (2) the income is brought in that year or later. It is then taxed in the year of remittance. Income arising before 1 Jan 2024 is not taxed. Returned invested capital is not taxed.
   - The MFA DTV sheet (https://image.mfa.go.th/mfa/0/P5NCnBapvr/typeofvisa/Visa_Destination_Thailand_%28DTV%29_Multiple_EN_FR_Dutch.pdf) says: "valid for 5 years", "maximum of 180 days, extendable once in the country through immigration", workcation (digital nomad/remote worker/foreign talent/freelancer).
5. **Portugal: VERIFIED.**
   - EBF art. 58-A (https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/bf_rep/Pages/EBF58A.aspx) gives: 20% on net category A and B income; 10 consecutive years; not resident in any of the 5 prior years; listed activities; excludes current or former NHR; "só pode ser utilizado uma vez".
   - The 15 January deadline is not in the article text. It is in the AT IFICI FAQ (https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/pages/faqs-01018.aspx): "até 15 de janeiro do ano seguinte". Both pages are already cited, so the claim is supported.
6. **Philippines: VERIFIED.** The post does not describe a visa as available. The Bureau of Immigration page https://immigration.gov.ph/visas/ (read 2026-09-18) lists no digital nomad category, confirming the post's statement. The EO 86 s.2025 text is on lawphil.net (not a government site; one-year stay, renewable, DFA-issued). officialgazette.gov.ph and pco.gov.ph returned HTTP 403, so I could not read the text on a government server. The post's "unverified" framing is appropriate.
7. **Indonesia: VERIFIED** (P2-3 wording only).
   - The imigrasi.go.id E33G page confirms: "Visa Rumah Kedua Pekerja Jarak Jauh"; one-year stay; extendable; employment with a company established outside Indonesia; US$60,000 per year.
   - PMK 112/PMK.03/2022 via https://www.pajak.go.id/en/node/84798 confirms: resident individuals use the NIK; non-residents, entities and government agencies use a 16-digit NPWP.
8. **Estonia: VERIFIED verbatim.** The EMTA page reads "In the meaning of Estonian tax law, an e-resident is a non-resident." and "Estonian digital ID does not grant tax residency…". The page also says non-residents, "including e-residents", are taxed only on Estonian income.
9. **Digital nomad / substantial presence test: VERIFIED.** The IRS page gives 31 days in the current year and 183 days over the 3-year period, counting all current-year days, 1/3 of the first prior year and 1/6 of the second.

## Pages I could not read
- matsne.gov.ge HTML body (JavaScript-rendered). I used the official PDF from the same site instead.
- vbpl.vn (JavaScript-rendered). I used congbao.chinhphu.vn instead.
- pco.gov.ph and officialgazette.gov.ph (HTTP 403).
- The text of Circular 86/2024/TT-BTC itself (not attempted; relied on baochinhphu plus secondary sources).
