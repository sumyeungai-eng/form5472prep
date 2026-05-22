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
  "8e_25pctShareholder": "topmostSubform[0].Page2[0].c2_4[0]",
  "8f_principalCountry": "topmostSubform[0].Page2[0].f2_7[0]",
  "8g_taxResidence": "topmostSubform[0].Page2[0].f2_8[0]",

  // Part IV totals — zero for typical foreign-owned DE
  line22_totalReceived: "topmostSubform[0].Page2[0].f2_24[0]",
  line36_totalPaid: "topmostSubform[0].Page2[0].f2_40[0]",

  // Part V attached statement checkbox
  partV_attachedStatementBox: "topmostSubform[0].Page2[0].PartV[0].c2_6[0]",

  // Part VII negatives
  q37_imports_no: "topmostSubform[0].Page3[0].c3_1[1]",
  q39_csa_no: "topmostSubform[0].Page3[0].c3_4[1]",
  q40a_267A_no: "topmostSubform[0].Page3[0].c3_5[1]",
  q41a_fdii_no: "topmostSubform[0].Page3[0].c3_6[1]",
  q42a_safeHavenInRange_no: "topmostSubform[0].Page3[0].c3_7[1]",
  q42b_safeHavenOutsideRange_no: "topmostSubform[0].Page3[0].c3_8[1]",
  q43a_coveredDebt_no: "topmostSubform[0].Page3[0].c3_9[1]",
} as const;

export const form1120_2024FieldMap = {
  "1a_name": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_4[0]",
  "1_streetSuite": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_5[0]",
  "1_cityStateCountryZip": "topmostSubform[0].Page1[0].TypeOrPrintBox[0].f1_6[0]",
  B_ein: "topmostSubform[0].Page1[0].f1_7[0]",
  C_dateIncorporated: "topmostSubform[0].Page1[0].f1_8[0]",
  D_totalAssets: "topmostSubform[0].Page1[0].f1_9[0]",
} as const;

// 2025 Form 1120 restructured the header: the name/address block is split
// into 7 separate fields (was 3), and item B (EIN), C (date), D (total assets)
// shift downward in the numbering accordingly.
export const form1120_2025FieldMap = {
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
