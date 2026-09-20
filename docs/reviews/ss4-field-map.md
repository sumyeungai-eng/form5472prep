# IRS Form SS-4 — AcroForm Field Map

**Source template:** `public/forms/fss4.pdf` (copied from `~/Downloads/fss4.pdf`)
**Form revision printed on the form:** `Form SS-4 (Rev. December 2025)` — footer of page 1 reads `Form SS-4 (Rev. 12-2025) Created 10/17/25`, `Cat. No. 16055N`.
**Pages:** 2 total. **Page 1 (index 0) contains the entire fillable application (all 89 fields).** Page 2 (index 1) is the non-fillable "Do I Need an EIN?" instructional page — it has zero AcroForm fields, confirmed both by the field dump (every widget reports `page=0`) and by visual inspection of the rendered page.

## How this map was built

1. Dumped all 89 AcroForm fields (name, type, page, widget rect, checkbox on-values) with pdf-lib — script + raw output kept in the scratchpad (`dump_fields.js` / `field_dump.txt`), not in this repo.
2. Built a **calibration PDF**: every text field was filled with its own short field name as the value (e.g. field `...f1_12[0]` → text `f1_12`) and every checkbox was checked, via `field.setText()` / `field.check()` + `form.updateFieldAppearances()`.
3. Rendered the calibration PDF to PNG with headless Chrome (`--headless=new --force-device-scale-factor=2 --virtual-time-budget=8000`) and visually read every label against every field token.
4. Cross-checked every visual read against the field's widget rect (x, y) to resolve left/right-column and top/bottom-row ordering unambiguously — every single field placement below was confirmed both visually and by coordinate order, so confidence is **high** unless a note says otherwise.

Rects are in PDF points, page coordinate origin **bottom-left** (`x`, `y` = lower-left corner of the widget; `w`/`h` = width/height). All field names below are short names; prepend `topmostSubform[0].Page1[0].` for the full AcroForm name (two fields also nest one extra container level — noted below).

## Field-to-line map (all 89 fields)

| SS-4 line | Field (short) | Full field name | Type | Page | Rect (x, y, w, h) | Confidence / notes |
|---|---|---|---|---|---|---|
| EIN box (header, top-right — IRS fills in, not the applicant) | `f1_1[0]` | `topmostSubform[0].Page1[0].PgHeader[0].f1_1[0]` | Text | 0 | 440.2, 708.0, 135.8, 26.1 | High. Nested one level deeper, under a `PgHeader[0]` container (page-header grouping, not a value group). |
| 1 — Legal name of entity (or individual) | `f1_2[0]` | `topmostSubform[0].Page1[0].f1_2[0]` | Text | 0 | 51.4, 684.0, 524.6, 14.0 | High |
| 2 — Trade name of business (if different from line 1) | `f1_3[0]` | `topmostSubform[0].Page1[0].f1_3[0]` | Text | 0 | 51.4, 660.0, 243.0, 14.0 | High |
| 3 — Executor, administrator, trustee, "care of" name | `f1_4[0]` | `topmostSubform[0].Page1[0].f1_4[0]` | Text | 0 | 296.2, 660.0, 279.8, 14.0 | High |
| 4a — Mailing address (room/apt./suite, street, or PO box) | `f1_5[0]` | `topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_5[0]` | Text | 0 | 51.4, 636.0, 243.0, 14.0 | High. Nested under `Line4ReadOrder[0]` — a tab/reading-order container shared with `f1_6[0]`, not a value group. |
| 5a — Street address (if different; don't enter a PO box) | `f1_7[0]` | `topmostSubform[0].Page1[0].f1_7[0]` | Text | 0 | 296.2, 636.0, 279.8, 14.0 | High |
| 4b — City, state, ZIP (if foreign, see instructions) | `f1_6[0]` | `topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_6[0]` | Text | 0 | 51.4, 612.0, 243.0, 14.0 | High. Same `Line4ReadOrder[0]` container as `f1_5[0]`. |
| 5b — City, state, ZIP (if foreign, see instructions), for line 5a | `f1_8[0]` | `topmostSubform[0].Page1[0].f1_8[0]` | Text | 0 | 296.2, 612.0, 279.8, 14.0 | High |
| 6 — County and state where principal business is located | `f1_9[0]` | `topmostSubform[0].Page1[0].f1_9[0]` | Text | 0 | 51.4, 588.0, 524.6, 14.0 | High |
| 7a — Name of responsible party | `f1_10[0]` | `topmostSubform[0].Page1[0].f1_10[0]` | Text | 0 | 51.4, 564.0, 279.1, 14.0 | High |
| 7b — SSN, ITIN, or EIN (of responsible party) | `f1_11[0]` | `topmostSubform[0].Page1[0].f1_11[0]` | Text | 0 | 332.2, 564.0, 243.8, 14.0 | High |
| 8a — Is this an LLC (or foreign equivalent)? — **Yes** | `c1_1[0]` | `topmostSubform[0].Page1[0].c1_1[0]` | Checkbox (on=`1`) | 0 | 255.2, 542.5, 8.0, 8.0 | High |
| 8a — **No** | `c1_1[1]` | `topmostSubform[0].Page1[0].c1_1[1]` | Checkbox (on=`2`) | 0 | 298.4, 542.5, 8.0, 8.0 | High |
| 8b — If 8a is "Yes," number of LLC members | `f1_12[0]` | `topmostSubform[0].Page1[0].f1_12[0]` | Text | 0 | 496.8, 540.0, 79.2, 12.0 | High |
| 8c — If 8a is "Yes," was the LLC organized in the US? — **Yes** | `c1_2[0]` | `topmostSubform[0].Page1[0].c1_2[0]` | Checkbox (on=`1`) | 0 | 492.8, 530.0, 8.0, 8.0 | High |
| 8c — **No** | `c1_2[1]` | `topmostSubform[0].Page1[0].c1_2[1]` | Checkbox (on=`2`) | 0 | 543.2, 530.0, 8.0, 8.0 | High |
| 9a — Type of entity: **Sole proprietor (SSN)** | `c1_3[0]` | `topmostSubform[0].Page1[0].c1_3[0]` | Checkbox (on=`1`) | 0 | 60.8, 506.0, 8.0, 8.0 | High |
| 9a — Sole proprietor SSN entry | `f1_13[0]` | `topmostSubform[0].Page1[0].f1_13[0]` | Text | 0 | 158.4, 504.0, 100.8, 12.0 | High |
| 9a — **Estate (SSN of decedent)** | `c1_3[1]` | `topmostSubform[0].Page1[0].c1_3[1]` | Checkbox (on=`8`) | 0 | 334.4, 506.0, 8.0, 8.0 | High |
| 9a — Estate SSN-of-decedent entry | `f1_14[0]` | `topmostSubform[0].Page1[0].f1_14[0]` | Text | 0 | 446.4, 504.0, 129.6, 12.0 | High |
| 9a — **Partnership** | `c1_3[2]` | `topmostSubform[0].Page1[0].c1_3[2]` | Checkbox (on=`2`) | 0 | 60.8, 494.0, 8.0, 8.0 | High |
| 9a — **Plan administrator (TIN)** | `c1_3[3]` | `topmostSubform[0].Page1[0].c1_3[3]` | Checkbox (on=`9`) | 0 | 334.4, 494.0, 8.0, 8.0 | High |
| 9a — Plan administrator TIN entry | `f1_15[0]` | `topmostSubform[0].Page1[0].f1_15[0]` | Text | 0 | 439.2, 492.0, 136.8, 12.0 | High |
| 9a — **Corporation (enter form number to be filed)** | `c1_3[4]` | `topmostSubform[0].Page1[0].c1_3[4]` | Checkbox (on=`3`) | 0 | 60.8, 482.0, 8.0, 8.0 | High |
| 9a — Corporation form-number entry | `f1_16[0]` | `topmostSubform[0].Page1[0].f1_16[0]` | Text | 0 | 237.6, 480.0, 86.4, 12.0 | High |
| 9a — **Trust (TIN of grantor)** | `c1_3[5]` | `topmostSubform[0].Page1[0].c1_3[5]` | Checkbox (on=`10`) | 0 | 334.4, 482.0, 8.0, 8.0 | High |
| 9a — Trust TIN-of-grantor entry | `f1_17[0]` | `topmostSubform[0].Page1[0].f1_17[0]` | Text | 0 | 432.0, 480.0, 144.0, 12.0 | High |
| 9a — **Personal service corporation** | `c1_3[6]` | `topmostSubform[0].Page1[0].c1_3[6]` | Checkbox (on=`4`) | 0 | 60.8, 470.0, 8.0, 8.0 | High |
| 9a — **Military/National Guard** | `c1_3[7]` | `topmostSubform[0].Page1[0].c1_3[7]` | Checkbox (on=`11`) | 0 | 334.4, 470.0, 8.0, 8.0 | High |
| 9a — **State/local government** | `c1_3[8]` | `topmostSubform[0].Page1[0].c1_3[8]` | Checkbox (on=`14`) | 0 | 442.4, 470.0, 8.0, 8.0 | High |
| 9a — **Church or church-controlled organization** | `c1_3[9]` | `topmostSubform[0].Page1[0].c1_3[9]` | Checkbox (on=`5`) | 0 | 60.8, 458.0, 8.0, 8.0 | High |
| 9a — **Farmers' cooperative** | `c1_3[10]` | `topmostSubform[0].Page1[0].c1_3[10]` | Checkbox (on=`12`) | 0 | 334.4, 458.0, 8.0, 8.0 | High |
| 9a — **Federal government** | `c1_3[11]` | `topmostSubform[0].Page1[0].c1_3[11]` | Checkbox (on=`15`) | 0 | 442.4, 458.0, 8.0, 8.0 | High |
| 9a — **Other nonprofit organization (specify)** | `c1_3[12]` | `topmostSubform[0].Page1[0].c1_3[12]` | Checkbox (on=`6`) | 0 | 60.8, 446.0, 8.0, 8.0 | High |
| 9a — Other nonprofit — specify text | `f1_18[0]` | `topmostSubform[0].Page1[0].f1_18[0]` | Text | 0 | 216.0, 444.0, 108.0, 12.0 | High |
| 9a — **REMIC** | `c1_3[13]` | `topmostSubform[0].Page1[0].c1_3[13]` | Checkbox (on=`13`) | 0 | 334.4, 446.0, 8.0, 8.0 | High |
| 9a — **Indian tribal governments/enterprises** | `c1_3[14]` | `topmostSubform[0].Page1[0].c1_3[14]` | Checkbox (on=`16`) | 0 | 442.4, 446.0, 8.0, 8.0 | High |
| 9a — **Other (specify)** | `c1_3[15]` | `topmostSubform[0].Page1[0].c1_3[15]` | Checkbox (on=`7`) | 0 | 60.8, 434.0, 8.0, 8.0 | High |
| 9a — Other — specify text | `f1_19[0]` | `topmostSubform[0].Page1[0].f1_19[0]` | Text | 0 | 144.0, 432.0, 180.0, 12.0 | High |
| 9a — Group Exemption Number (GEN) if any | `f1_20[0]` | `topmostSubform[0].Page1[0].f1_20[0]` | Text | 0 | 473.0, 432.0, 103.0, 12.0 | High |
| 9b — State (if a corporation, state of incorporation) | `f1_21[0]` | `topmostSubform[0].Page1[0].f1_21[0]` | Text | 0 | 274.6, 408.0, 127.8, 14.0 | High |
| 9b — Foreign country (if incorporated abroad) | `f1_22[0]` | `topmostSubform[0].Page1[0].f1_22[0]` | Text | 0 | 404.2, 408.0, 171.8, 14.0 | High |
| 10 — Reason for applying: **Started new business (specify type)** | `c1_4[0]` | `topmostSubform[0].Page1[0].c1_4[0]` | Checkbox (on=`1`) | 0 | 60.8, 386.0, 8.0, 8.0 | High |
| 10 — Started new business — specify (line 1) | `f1_25[0]` | `topmostSubform[0].Page1[0].f1_25[0]` | Text | 0 | 208.8, 384.0, 57.6, 12.0 | High |
| 10 — Started new business — specify (line 2 / wrap) | `f1_26[0]` | `topmostSubform[0].Page1[0].f1_26[0]` | Text | 0 | 57.6, 372.0, 208.8, 12.0 | **Medium-high.** No checkbox or printed label of its own — inferred to be a second/continuation line for the "Started new business (specify type)" answer purely from its position directly below `f1_25[0]` and left of the "Hired employees" row. Verify before relying on it. |
| 10 — **Banking purpose (specify purpose)** | `c1_4[8]` | `topmostSubform[0].Page1[0].c1_4[8]` | Checkbox (on=`5`) | 0 | 276.8, 397.0, 8.0, 8.0 | High |
| 10 — Banking purpose — specify text | `f1_24[0]` | `topmostSubform[0].Page1[0].f1_24[0]` | Text | 0 | 424.8, 396.0, 151.2, 12.0 | High |
| 10 — **Changed type of organization (specify new type)** | `c1_4[1]` | `topmostSubform[0].Page1[0].c1_4[1]` | Checkbox (on=`6`) | 0 | 276.8, 385.0, 8.0, 8.0 | High |
| 10 — Changed type — specify new type text | `f1_27[0]` | `topmostSubform[0].Page1[0].f1_27[0]` | Text | 0 | 468.0, 384.0, 108.0, 12.0 | High |
| 10 — **Purchased going business** (no specify field) | `c1_4[2]` | `topmostSubform[0].Page1[0].c1_4[2]` | Checkbox (on=`7`) | 0 | 276.8, 373.0, 8.0, 8.0 | High |
| 10 — **Hired employees (Check the box and see line 13.)** (no specify field) | `c1_4[3]` | `topmostSubform[0].Page1[0].c1_4[3]` | Checkbox (on=`2`) | 0 | 60.8, 361.0, 8.0, 8.0 | High |
| 10 — **Created a trust (specify type)** | `c1_4[4]` | `topmostSubform[0].Page1[0].c1_4[4]` | Checkbox (on=`8`) | 0 | 276.8, 361.0, 8.0, 8.0 | High |
| 10 — Created a trust — specify type text | `f1_28[0]` | `topmostSubform[0].Page1[0].f1_28[0]` | Text | 0 | 403.2, 360.0, 172.8, 12.0 | High |
| 10 — **Compliance with IRS withholding regulations** (no specify field) | `c1_4[5]` | `topmostSubform[0].Page1[0].c1_4[5]` | Checkbox (on=`3`) | 0 | 60.8, 349.0, 8.0, 8.0 | High |
| 10 — **Created a pension plan (specify type)** | `c1_4[6]` | `topmostSubform[0].Page1[0].c1_4[6]` | Checkbox (on=`9`) | 0 | 276.8, 349.0, 8.0, 8.0 | High |
| 10 — Created a pension plan — specify type text | `f1_29[0]` | `topmostSubform[0].Page1[0].f1_29[0]` | Text | 0 | 432.0, 348.0, 144.0, 12.0 | High |
| 10 — **Other (specify)** | `c1_4[7]` | `topmostSubform[0].Page1[0].c1_4[7]` | Checkbox (on=`4`) | 0 | 60.8, 338.0, 8.0, 8.0 | High |
| 10 — Other — specify text (full-width row) | `f1_30[0]` | `topmostSubform[0].Page1[0].f1_30[0]` | Text | 0 | 136.8, 336.0, 439.2, 12.0 | High |
| 11 — Date business started or acquired (mm/dd/yyyy) | `f1_31[0]` | `topmostSubform[0].Page1[0].f1_31[0]` | Text | 0 | 57.6, 312.0, 273.6, 14.0 | High |
| 12 — Closing month of accounting year | `f1_32[0]` | `topmostSubform[0].Page1[0].f1_32[0]` | Text | 0 | 353.6, 312.0, 222.4, 14.8 | High |
| 13 — Highest # of employees expected next 12 months — Agricultural | `f1_33[0]` | `topmostSubform[0].Page1[0].f1_33[0]` | Text | 0 | 57.6, 252.0, 86.4, 14.0 | High |
| 13 — Household | `f1_34[0]` | `topmostSubform[0].Page1[0].f1_34[0]` | Text | 0 | 144.0, 252.0, 86.4, 14.0 | High |
| 13 — Other | `f1_35[0]` | `topmostSubform[0].Page1[0].f1_35[0]` | Text | 0 | 230.4, 252.0, 100.8, 14.0 | High |
| 14 — Check here if you expect employment tax liability ≤ $1,000/yr and want to file Form 944 instead of 941 | `c1_5[0]` | `topmostSubform[0].Page1[0].c1_5[0]` | Checkbox (on=`1`) | 0 | 563.6, 254.0, 8.0, 8.0 | High. Single standalone checkbox — no paired "unchecked" field, just checked or left blank. |
| 15 — First date wages/annuities paid (mm/dd/yyyy) | `f1_36[0]` | `topmostSubform[0].Page1[0].f1_36[0]` | Text | 0 | 396.0, 228.0, 180.0, 12.0 | High |
| 16 — Principal activity: **Health care & social assistance** | `c1_6[0]` | `topmostSubform[0].Page1[0].c1_6[0]` | Checkbox (on=`7`) | 0 | 320.0, 218.0, 8.0, 8.0 | High |
| 16 — **Wholesale — agent/broker** | `c1_6[1]` | `topmostSubform[0].Page1[0].c1_6[1]` | Checkbox (on=`10`) | 0 | 449.6, 218.0, 8.0, 8.0 | High |
| 16 — **Construction** | `c1_6[2]` | `topmostSubform[0].Page1[0].c1_6[2]` | Checkbox (on=`1`) | 0 | 60.8, 206.0, 8.0, 8.0 | High |
| 16 — **Rental & leasing** | `c1_6[3]` | `topmostSubform[0].Page1[0].c1_6[3]` | Checkbox (on=`3`) | 0 | 125.6, 206.0, 8.0, 8.0 | High |
| 16 — **Transportation & warehousing** | `c1_6[4]` | `topmostSubform[0].Page1[0].c1_6[4]` | Checkbox (on=`5`) | 0 | 204.8, 206.0, 8.0, 8.0 | High |
| 16 — **Accommodation & food service** | `c1_6[5]` | `topmostSubform[0].Page1[0].c1_6[5]` | Checkbox (on=`8`) | 0 | 320.0, 206.0, 8.0, 8.0 | High |
| 16 — **Wholesale — other** | `c1_6[6]` | `topmostSubform[0].Page1[0].c1_6[6]` | Checkbox (on=`11`) | 0 | 449.6, 206.0, 8.0, 8.0 | High |
| 16 — **Retail** | `c1_6[7]` | `topmostSubform[0].Page1[0].c1_6[7]` | Checkbox (on=`12`) | 0 | 536.0, 206.0, 8.0, 8.0 | High |
| 16 — **Real estate** | `c1_6[8]` | `topmostSubform[0].Page1[0].c1_6[8]` | Checkbox (on=`2`) | 0 | 60.8, 194.0, 8.0, 8.0 | High |
| 16 — **Manufacturing** | `c1_6[9]` | `topmostSubform[0].Page1[0].c1_6[9]` | Checkbox (on=`4`) | 0 | 125.6, 194.0, 8.0, 8.0 | High |
| 16 — **Finance & insurance** | `c1_6[10]` | `topmostSubform[0].Page1[0].c1_6[10]` | Checkbox (on=`6`) | 0 | 204.8, 194.0, 8.0, 8.0 | High |
| 16 — **Other (specify)** | `c1_6[11]` | `topmostSubform[0].Page1[0].c1_6[11]` | Checkbox (on=`9`) | 0 | 320.0, 194.0, 8.0, 8.0 | High |
| 16 — Other — specify text | `f1_37[0]` | `topmostSubform[0].Page1[0].f1_37[0]` | Text | 0 | 396.0, 192.0, 180.0, 12.0 | High |
| 17 — Principal line of merchandise sold / construction work / products / services | `f1_38[0]` | `topmostSubform[0].Page1[0].f1_38[0]` | Text | 0 | 57.6, 168.0, 518.4, 14.0 | High |
| 18 — Has the applicant entity on line 1 ever applied for/received an EIN? — **Yes** | `c1_7[0]` | `topmostSubform[0].Page1[0].c1_7[0]` | Checkbox (on=`1`) | 0 | 356.0, 158.0, 8.0, 8.0 | High |
| 18 — **No** | `c1_7[1]` | `topmostSubform[0].Page1[0].c1_7[1]` | Checkbox (on=`2`) | 0 | 399.2, 158.0, 8.0, 8.0 | High |
| 18 — If "Yes," previous EIN | `f1_39[0]` | `topmostSubform[0].Page1[0].f1_39[0]` | Text | 0 | 177.1, 144.0, 103.7, 12.0 | High |
| Third party designee name | `f1_40[0]` | `topmostSubform[0].Page1[0].f1_40[0]` | Text | 0 | 87.4, 108.0, 343.9, 14.0 | High |
| Third party designee telephone number | `f1_41[0]` | `topmostSubform[0].Page1[0].f1_41[0]` | Text | 0 | 433.0, 108.0, 143.0, 14.0 | High |
| Third party designee address and ZIP code | `f1_42[0]` | `topmostSubform[0].Page1[0].f1_42[0]` | Text | 0 | 87.4, 84.0, 343.9, 14.0 | High |
| Third party designee fax number | `f1_43[0]` | `topmostSubform[0].Page1[0].f1_43[0]` | Text | 0 | 433.0, 84.0, 143.0, 14.0 | High |
| Applicant's name and title (type or print clearly) | `f1_44[0]` | `topmostSubform[0].Page1[0].f1_44[0]` | Text | 0 | 151.0, 60.0, 280.3, 12.0 | High |
| Applicant's telephone number | `f1_45[0]` | `topmostSubform[0].Page1[0].f1_45[0]` | Text | 0 | 433.0, 60.0, 143.0, 14.0 | High |
| Applicant's fax number | `f1_46[0]` | `topmostSubform[0].Page1[0].f1_46[0]` | Text | 0 | 433.0, 36.0, 143.0, 14.0 | High |

**Total: 89 fields accounted for (45 text fields + 44 checkboxes).**

## Not identified / not fillable

- **Applicant signature** and **Date** (the "Signature ___ Date ___" line directly below the "Under penalties of perjury..." declaration, above the "For Privacy Act..." footer): there is **no AcroForm field** for either the signature or the date. Confirmed by process of elimination — every one of the 89 fields is accounted for above, and none sits at that row's position. This line is meant for a physical/wet (or separately-applied) signature, not a fillable value.
- **EIN header box (`f1_1[0]`)**: technically identified (top-right box under "OMB No. 1545-0003"), but note it's the field the *IRS* fills in upon issuing the EIN — not something the applicant would normally populate when submitting the form.

Everything else was legible and unambiguous on the calibration render; no other fields are in doubt beyond the one noted "medium-high" confidence item (`f1_26[0]`).

## Checkbox "on" values (for pdf-lib `field.check()` / `field.select(onValue)`)

pdf-lib's `PDFCheckBox.check()` will auto-detect the on-value, but if you ever need to set it explicitly (e.g. via `acroField` widget appearance keys), here are the exact `/AP /N` on-state names read directly from each widget, grouped by visual button group:

| Group | Field | On value |
|---|---|---|
| Line 8a (Yes/No) | `c1_1[0]` / `c1_1[1]` | `1` / `2` |
| Line 8c (Yes/No) | `c1_2[0]` / `c1_2[1]` | `1` / `2` |
| Line 9a (entity type, 16 boxes) | `c1_3[0..15]` | `1,8,2,9,3,10,4,11,14,5,12,15,6,13,16,7` (index-order as listed in the field table above; i.e. `c1_3[0]`→`1`, `c1_3[1]`→`8`, `c1_3[2]`→`2`, ... `c1_3[15]`→`7`) |
| Line 10 (reason for applying, 9 boxes) | `c1_4[0..8]` | `c1_4[0]`→`1`, `c1_4[1]`→`6`, `c1_4[2]`→`7`, `c1_4[3]`→`2`, `c1_4[4]`→`8`, `c1_4[5]`→`3`, `c1_4[6]`→`9`, `c1_4[7]`→`4`, `c1_4[8]`→`5` |
| Line 14 (single box) | `c1_5[0]` | `1` |
| Line 16 (principal activity, 12 boxes) | `c1_6[0..11]` | `c1_6[0]`→`7`, `c1_6[1]`→`10`, `c1_6[2]`→`1`, `c1_6[3]`→`3`, `c1_6[4]`→`5`, `c1_6[5]`→`8`, `c1_6[6]`→`11`, `c1_6[7]`→`12`, `c1_6[8]`→`2`, `c1_6[9]`→`4`, `c1_6[10]`→`6`, `c1_6[11]`→`9` |
| Line 18 (Yes/No) | `c1_7[0]` / `c1_7[1]` | `1` / `2` |

**Important implementation note:** none of these "check only one box" groups (8a, 8c, 9a, 10, 16, 18) are implemented as a single PDF `/FT /Btn /Ff radio` field with shared kids — every checkbox is its **own independent field** with its own name, its own on-value, and (per the dump) its own single widget. pdf-lib therefore cannot enforce mutual exclusivity for these groups automatically; application code that fills the form must manually uncheck/clear the sibling boxes in a group before checking the selected one, or it will produce a PDF with multiple boxes checked in a "choose one" group.

## Multi-widget / read-order groups

No field in this form has more than one widget (`widgetCount` was `1` for all 89 fields) — there are no split/multi-widget fields to worry about.

Two fields are nested one level deeper than the rest inside a named non-terminal container node (a layout/reading-order grouping in the underlying XFA-derived AcroForm tree, not a value or radio group):

- `topmostSubform[0].Page1[0].PgHeader[0].f1_1[0]` — the EIN header box, nested under `PgHeader[0]`.
- `topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_5[0]` and `topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_6[0]` — Lines 4a and 4b, nested under `Line4ReadOrder[0]` (this groups the two stacked fields for tab/reading order since they visually stack in the same column, alongside the unrelated 5a/5b fields which are NOT in this container).

All other fields sit directly under `topmostSubform[0].Page1[0]`.

## Rendered evidence

- Page 1 (full application, all 89 field tokens visible + all checkboxes checked): see PNG delivered alongside this file.
- Page 2 (instructions only, no fields): see PNG delivered alongside this file.
