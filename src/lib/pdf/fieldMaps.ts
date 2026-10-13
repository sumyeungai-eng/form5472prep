// Field maps verified against the IRS PDFs referenced in the spec.
// If a map doesn't match a PDF revision, fillForm logs the unknown field
// and continues — see fillForm.ts for the resilience behavior.

export const form5472FieldMap = {
  taxYearBeginMonthDay: "topmostSubform[0].Page1[0].Pg1Header[0].f1_1[0]",
  taxYearBeginYear: "topmostSubform[0].Page1[0].Pg1Header[0].f1_2[0]",
  taxYearEndMonthDay: "topmostSubform[0].Page1[0].Pg1Header[0].f1_3[0]",
  taxYearEndYear: "topmostSubform[0].Page1[0].Pg1Header[0].f1_4[0]",

  "1a_name": "topmostSubform[0].Page1[0].Line1a[0].f1_5[0]",
  "1b_ein": "topmostSubform[0].Page1[0].f1_8[0]",
  "1_street": "topmostSubform[0].Page1[0].Line1a[0].f1_6[0]",
  "1c_totalAssets": "topmostSubform[0].Page1[0].f1_9[0]",
  "1_cityStateZip": "topmostSubform[0].Page1[0].Line1a[0].f1_7[0]",
  "1d_businessActivity": "topmostSubform[0].Page1[0].f1_10[0]",
  "1e_businessCode": "topmostSubform[0].Page1[0].f1_11[0]",
  "1f_totalPaymentsThisForm": "topmostSubform[0].Page1[0].Line1f_ReadOrder[0].f1_12[0]",
  "1g_numberOfForms": "topmostSubform[0].Page1[0].f1_13[0]",
  "1h_totalPaymentsAllForms": "topmostSubform[0].Page1[0].f1_14[0]",
  "1k_partsVIII": "topmostSubform[0].Page1[0].f1_15[0]",
  "1l_countryIncorp": "topmostSubform[0].Page1[0].f1_16[0]",
  "1m_dateIncorp": "topmostSubform[0].Page1[0].f1_17[0]",
  "1n_countriesTaxResident": "topmostSubform[0].Page1[0].f1_18[0]",
  "1o_countriesBusinessConducted": "topmostSubform[0].Page1[0].f1_19[0]",

  // Checkboxes use value '/1' to check
  // 1i = consolidated-filing flag (leave UNchecked — we never file consolidated).
  // 1j = initial-year flag (CHECK this on the first-ever Form 5472 for the EIN —
  //       the IRS uses it to reconcile "no prior 5472 on file" against this
  //       filing, so an unchecked 1j on a new entity triggers correspondence).
  "1j_initialYear": "topmostSubform[0].Page1[0].Line1j_ReadOrder[0].c1_2[0]",
  box2_foreign50pct: "topmostSubform[0].Page1[0].c1_3[0]",
  box3_foreignOwnedUsDE: "topmostSubform[0].Page1[0].c1_4[0]",

  // Part II — direct 25% foreign shareholder
  "4a_nameAddress": "topmostSubform[0].Page1[0].f1_20[0]",
  "4b1_usId": "topmostSubform[0].Page1[0].f1_21[0]",
  "4b2_referenceId": "topmostSubform[0].Page1[0].f1_22[0]",
  "4b3_ftin": "topmostSubform[0].Page1[0].f1_23[0]",
  "4c_principalCountry": "topmostSubform[0].Page1[0].f1_24[0]",
  "4d_citizenship": "topmostSubform[0].Page1[0].f1_25[0]",
  "4e_taxResidence": "topmostSubform[0].Page1[0].f1_26[0]",

  // Part III
  partIII_foreignPersonBox: "topmostSubform[0].Page2[0].c2_1[0]",
  "8a_nameAddress": "topmostSubform[0].Page2[0].f2_1[0]",
  "8b1_usId": "topmostSubform[0].Page2[0].f2_2[0]",
  "8b2_referenceId": "topmostSubform[0].Page2[0].f2_3[0]",
  "8b3_ftin": "topmostSubform[0].Page2[0].f2_4[0]",
  "8c_businessActivity": "topmostSubform[0].Page2[0].f2_5[0]",
  // 8d = related party's Principal Business Activity CODE (NAICS). Was
  // previously omitted — leaving 8d blank while 8c is populated is the kind of
  // inconsistency that flags an automated IRS consistency check. For our
  // sole-member-DE customer profile, the related party is the same individual
  // who controls the reporting corp, so 8d mirrors Part I 1e.
  "8d_businessCode": "topmostSubform[0].Page2[0].f2_6[0]",
  "8e_25pctShareholder": "topmostSubform[0].Page2[0].c2_4[0]",
  "8f_principalCountry": "topmostSubform[0].Page2[0].f2_7[0]",
  "8g_taxResidence": "topmostSubform[0].Page2[0].f2_8[0]",

  // Part IV totals — zero for typical foreign-owned DE
  line22_totalReceived: "topmostSubform[0].Page2[0].f2_24[0]",
  line36_totalPaid: "topmostSubform[0].Page2[0].f2_40[0]",

  // Part V attached statement checkbox
  partV_attachedStatementBox: "topmostSubform[0].Page2[0].PartV[0].c2_6[0]",
  partVI_attachedStatementBox: "topmostSubform[0].Page2[0].PartVI[0].c2_7[0]",

  // Part VII negatives
  q37_imports_yes: "topmostSubform[0].Page3[0].c3_1[0]",
  q37_imports_no: "topmostSubform[0].Page3[0].c3_1[1]",
  q38a_customsValue_yes: "topmostSubform[0].Page3[0].c3_2[0]",
  q38a_customsValue_no: "topmostSubform[0].Page3[0].c3_2[1]",
  q38c_importDocumentation_yes: "topmostSubform[0].Page3[0].c3_3[0]",
  q38c_importDocumentation_no: "topmostSubform[0].Page3[0].c3_3[1]",
  q39_csa_yes: "topmostSubform[0].Page3[0].c3_4[0]",
  q39_csa_no: "topmostSubform[0].Page3[0].c3_4[1]",
  q40a_267A_yes: "topmostSubform[0].Page3[0].c3_5[0]",
  q40a_267A_no: "topmostSubform[0].Page3[0].c3_5[1]",
  q41a_fdii_yes: "topmostSubform[0].Page3[0].c3_6[0]",
  q41a_fdii_no: "topmostSubform[0].Page3[0].c3_6[1]",
  q42a_safeHavenInRange_yes: "topmostSubform[0].Page3[0].c3_7[0]",
  q42a_safeHavenInRange_no: "topmostSubform[0].Page3[0].c3_7[1]",
  q42b_safeHavenOutsideRange_yes: "topmostSubform[0].Page3[0].c3_8[0]",
  q42b_safeHavenOutsideRange_no: "topmostSubform[0].Page3[0].c3_8[1]",
  q43a_coveredDebt_yes: "topmostSubform[0].Page3[0].c3_9[0]",
  q43a_coveredDebt_no: "topmostSubform[0].Page3[0].c3_9[1]",
} as const;

export const form1120_2018FieldMap = {
  taxYearBeginning: "topmostSubform[0].Page1[0].Headpage1[0].f1_1[0]",
  taxYearEnding: "topmostSubform[0].Page1[0].Headpage1[0].f1_2[0]",
  taxYearEndingYear2: "topmostSubform[0].Page1[0].Headpage1[0].f1_3[0]",
  "1a_name": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_4[0]",
  "1_streetSuite": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_5[0]",
  "1_cityStateCountryZip": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_6[0]",
  B_ein: "topmostSubform[0].Page1[0].f1_8[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_9[0]",
  D_totalAssets: "topmostSubform[0].Page1[0].f1_10[0]",
  D_totalAssetsCents: "topmostSubform[0].Page1[0].f1_11[0]",
  E_initialReturn: "topmostSubform[0].Page1[0].c1_6[0]",
  E_finalReturn: "topmostSubform[0].Page1[0].c1_7[0]",
  E_nameChange: "topmostSubform[0].Page1[0].c1_8[0]",
  E_addressChange: "topmostSubform[0].Page1[0].c1_9[0]",
} as const;

export const form1120_2019FieldMap = {
  taxYearBeginning: "topmostSubform[0].Page1[0].Headpage1[0].f1_1[0]",
  taxYearEnding: "topmostSubform[0].Page1[0].Headpage1[0].f1_2[0]",
  taxYearEndingYear2: "topmostSubform[0].Page1[0].Headpage1[0].f1_3[0]",
  "1a_name": "topmostSubform[0].Page1[0].Headpage1[0].TypeOrPrintBox[0].f1_4[0]",
  "1_streetSuite": "topmostSubform[0].Page1[0].Headpage1[0].TypeOrPrintBox[0].f1_5[0]",
  "1_cityStateCountryZip": "topmostSubform[0].Page1[0].Headpage1[0].TypeOrPrintBox[0].f1_6[0]",
  B_ein: "topmostSubform[0].Page1[0].f1_7[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_8[0]",
  D_totalAssets: "topmostSubform[0].Page1[0].f1_9[0]",
  E_initialReturn: "topmostSubform[0].Page1[0].c1_6[0]",
  E_finalReturn: "topmostSubform[0].Page1[0].c1_7[0]",
  E_nameChange: "topmostSubform[0].Page1[0].c1_8[0]",
  E_addressChange: "topmostSubform[0].Page1[0].c1_9[0]",
} as const;

export const form1120_2020FieldMap = {
  taxYearBeginning: "topmostSubform[0].Page1[0].PgHeader[0].f1_1[0]",
  taxYearEnding: "topmostSubform[0].Page1[0].PgHeader[0].f1_2[0]",
  taxYearEndingYear2: "topmostSubform[0].Page1[0].PgHeader[0].f1_3[0]",
  "1a_name": "topmostSubform[0].Page1[0].PgHeader[0].TypeOrPrintBox[0].f1_4[0]",
  "1_streetSuite": "topmostSubform[0].Page1[0].PgHeader[0].TypeOrPrintBox[0].f1_5[0]",
  "1_cityStateCountryZip": "topmostSubform[0].Page1[0].PgHeader[0].TypeOrPrintBox[0].f1_6[0]",
  B_ein: "topmostSubform[0].Page1[0].f1_7[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_8[0]",
  D_totalAssets: "topmostSubform[0].Page1[0].f1_9[0]",
  E_initialReturn: "topmostSubform[0].Page1[0].c1_6[0]",
  E_finalReturn: "topmostSubform[0].Page1[0].c1_7[0]",
  E_nameChange: "topmostSubform[0].Page1[0].c1_8[0]",
  E_addressChange: "topmostSubform[0].Page1[0].c1_9[0]",
} as const;

export const form1120_2021FieldMap = form1120_2020FieldMap;

export const form1120_2022FieldMap = {
  taxYearBeginning: "topmostSubform[0].Page1[0].PgHeader[0].f1_1[0]",
  taxYearEnding: "topmostSubform[0].Page1[0].PgHeader[0].f1_2[0]",
  taxYearEndingYear2: "topmostSubform[0].Page1[0].PgHeader[0].f1_3[0]",
  "1a_name": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_4[0]",
  "1_streetSuite": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_5[0]",
  "1_cityStateCountryZip": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_6[0]",
  B_ein: "topmostSubform[0].Page1[0].f1_7[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_8[0]",
  D_totalAssets: "topmostSubform[0].Page1[0].f1_9[0]",
  // Item E checkboxes. Probed the blank public/forms/f1120--2024.pdf with
  // pdf-lib field enumeration: Page1 carries a clean sequential run c1_6[0]..
  // c1_9[0] directly under Page1[0] (item A's five boxes are the earlier
  // A[0].c1_1..c1_5), all on one row at y≈637.5 with x = 187.2 / 280.8 / 374.4 /
  // 468.0 — i.e. left→right Initial / Final / Name change / Address change,
  // structurally IDENTICAL to the 2025 revision (same names, same coordinates).
  // So the Final-return box is unambiguously c1_7[0], the second of the four.
  E_initialReturn: "topmostSubform[0].Page1[0].c1_6[0]",
  E_finalReturn:   "topmostSubform[0].Page1[0].c1_7[0]",
  E_nameChange:    "topmostSubform[0].Page1[0].c1_8[0]",
  E_addressChange: "topmostSubform[0].Page1[0].c1_9[0]",
} as const;

export const form1120_2023FieldMap = form1120_2022FieldMap;
export const form1120_2024FieldMap = form1120_2022FieldMap;

// Form 1120 page 1 "Paid Preparer Use Only" block and the "May the IRS
// discuss this return with the preparer shown below?" Yes/No boxes, per
// revision (generator 2.3.0). Confirmed 2026-10-13 by widget geometry against
// the printed labels (PyMuPDF word positions) AND by rendering filled forms of
// every revision 2018-2025 and looking at where each value lands; render.test.ts
// ("V-02 DoD") re-checks the 2024 and 2025 text and boxes on the rendered PDF
// at 300 DPI. Each Yes/No pair is two separate fields: [0] sits left of
// the printed "Yes", [1] left of "No". The preparer signature and date have no
// fields; the self-employed box is mapped only so tests can prove it stays
// blank.
export type Form1120PaidPreparerFieldMap = {
  readonly discussYes: string;
  readonly discussNo: string;
  readonly preparerName: string;
  readonly selfEmployed: string;
  readonly ptin: string;
  readonly firmName: string;
  readonly firmEin: string;
  readonly firmAddress: string;
  readonly phone: string;
};

const PAID_PREPARER_2019_2024: Form1120PaidPreparerFieldMap = {
  discussYes: "topmostSubform[0].Page1[0].c1_11[0]",
  discussNo: "topmostSubform[0].Page1[0].c1_11[1]",
  preparerName: "topmostSubform[0].Page1[0].f1_53[0]",
  selfEmployed: "topmostSubform[0].Page1[0].c1_12[0]",
  ptin: "topmostSubform[0].Page1[0].f1_54[0]",
  firmName: "topmostSubform[0].Page1[0].f1_55[0]",
  firmAddress: "topmostSubform[0].Page1[0].f1_56[0]",
  firmEin: "topmostSubform[0].Page1[0].f1_57[0]",
  phone: "topmostSubform[0].Page1[0].f1_58[0]",
};

export const form1120PaidPreparerFieldMaps: Record<
  2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025,
  Form1120PaidPreparerFieldMap
> = {
  2018: {
    discussYes: "topmostSubform[0].Page1[0].c1_11[0]",
    discussNo: "topmostSubform[0].Page1[0].c1_11[1]",
    preparerName: "topmostSubform[0].Page1[0].f1_97[0]",
    selfEmployed: "topmostSubform[0].Page1[0].c1_12[0]",
    ptin: "topmostSubform[0].Page1[0].f1_98[0]",
    firmName: "topmostSubform[0].Page1[0].f1_99[0]",
    firmAddress: "topmostSubform[0].Page1[0].f1_100[0]",
    firmEin: "topmostSubform[0].Page1[0].f1_101[0]",
    phone: "topmostSubform[0].Page1[0].f1_102[0]",
  },
  2019: PAID_PREPARER_2019_2024,
  2020: PAID_PREPARER_2019_2024,
  2021: PAID_PREPARER_2019_2024,
  2022: PAID_PREPARER_2019_2024,
  2023: PAID_PREPARER_2019_2024,
  2024: PAID_PREPARER_2019_2024,
  // 2025 moved the block down ~18pt and swapped the firm rows' field order:
  // f1_61 firm name, f1_62 firm EIN, f1_63 firm address, f1_64 phone.
  2025: {
    discussYes: "topmostSubform[0].Page1[0].c1_12[0]",
    discussNo: "topmostSubform[0].Page1[0].c1_12[1]",
    preparerName: "topmostSubform[0].Page1[0].f1_59[0]",
    selfEmployed: "topmostSubform[0].Page1[0].c1_13[0]",
    ptin: "topmostSubform[0].Page1[0].f1_60[0]",
    firmName: "topmostSubform[0].Page1[0].f1_61[0]",
    firmEin: "topmostSubform[0].Page1[0].f1_62[0]",
    firmAddress: "topmostSubform[0].Page1[0].f1_63[0]",
    phone: "topmostSubform[0].Page1[0].f1_64[0]",
  },
};

// 2025 Form 1120 restructured the header: the name/address block is split
// into 7 separate fields (was 3), and item B (EIN), C (date), D (total assets)
// shift downward in the numbering accordingly.
export const form1120_2025FieldMap = {
  taxYearBeginning: "topmostSubform[0].Page1[0].PgHeader[0].f1_1[0]",
  taxYearEnding: "topmostSubform[0].Page1[0].PgHeader[0].f1_2[0]",
  taxYearEndingYear2: "topmostSubform[0].Page1[0].PgHeader[0].f1_3[0]",
  "1a_name":      "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_4[0]",
  "1_street":     "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_5[0]",
  "1_roomSuite":  "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_6[0]",
  "1_city":       "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_7[0]",
  "1_state":      "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_8[0]",
  "1_country":    "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_9[0]",
  "1_zip":        "topmostSubform[0].Page1[0].NameFieldsReadOrder[0].f1_10[0]",
  B_ein:          "topmostSubform[0].Page1[0].f1_11[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_12[0]",
  D_totalAssets:  "topmostSubform[0].Page1[0].f1_13[0]",
  // Item E checkboxes
  E_initialReturn: "topmostSubform[0].Page1[0].c1_6[0]",
  E_finalReturn:   "topmostSubform[0].Page1[0].c1_7[0]",
  E_nameChange:    "topmostSubform[0].Page1[0].c1_8[0]",
  E_addressChange: "topmostSubform[0].Page1[0].c1_9[0]",
} as const;
