export type Bir60BoxKind = "amount" | "text" | "tick" | "date" | "note";
export type Bir60BoxSource = "computed" | "entered" | "particulars" | "manual";

export interface Bir60BoxTemplate {
  id: string;
  boxNo?: string;
  labelZh: string;
  labelEn: string;
  kind: Bir60BoxKind;
  source: Bir60BoxSource;
  noteZh?: string;
  noteEn?: string;
  repeatFor?: "propertyColumns" | "businessColumns" | "childDependants" | "parentDependants" | "vhisRelatives";
}

export interface Bir60Section {
  id: string;
  titleZh: string;
  titleEn: string;
  boxes: Bir60BoxTemplate[];
}

export interface Bir60Part {
  id: string;
  partNo: string;
  titleZh: string;
  titleEn: string;
  sections: Bir60Section[];
}

const manualNote = {
  noteZh: "由納稅人自行填寫（如適用）。",
  noteEn: "Complete yourself if applicable.",
};

const notComputedNote = {
  noteZh: "本工具未涵蓋此項，請按報稅表及填表指南自行核對。",
  noteEn: "Not covered by this calculator; review the return and guide yourself.",
};

const leaveBlankNote = {
  noteZh: "此欄由稅務局填寫，你毋須填寫。",
  noteEn: "For IRD official use only; leave blank.",
};

export const BIR60_STRUCTURE: Bir60Part[] = [
  {
    id: "part1",
    partNo: "1",
    titleZh: "個人資料",
    titleEn: "Personal Particulars",
    sections: [
      {
        id: "part1.personalParticulars",
        titleZh: "本人及配偶資料",
        titleEn: "Self and spouse particulars",
        boxes: [
          { id: "part1.selfName", labelZh: "本人 中文姓名／英文姓名", labelEn: "SELF - Name in Chinese / Name in English", kind: "text", source: "particulars" },
          { id: "part1.spouseName", labelZh: "配偶 中文姓名／英文姓名", labelEn: "SPOUSE - Name in Chinese / Name in English", kind: "text", source: "particulars" },
          { id: "part1.selfHkid", boxNo: "1", labelZh: "本人香港身份證號碼", labelEn: "SELF - Hong Kong Identity Card No.", kind: "text", source: "particulars" },
          { id: "part1.spouseHkid", boxNo: "2", labelZh: "配偶香港身份證號碼", labelEn: "SPOUSE - Hong Kong Identity Card No.", kind: "text", source: "particulars" },
          { id: "part1.passport", labelZh: "如沒有香港身份證，國籍及護照號碼", labelEn: "If not a HKID holder, nationality and passport number", kind: "text", source: "manual", ...manualNote },
          { id: "part1.mobile", boxNo: "3", labelZh: "手提電話（日間聯絡電話）", labelEn: "Mobile phone no. (Day-time contact tel. no.)", kind: "text", source: "manual", ...manualNote },
          { id: "part1.address", labelZh: "新通訊地址／新住址", labelEn: "New Postal Address / New Residential Address", kind: "text", source: "manual", ...manualNote },
          { id: "part1.maritalStatusChange", boxNo: "2", labelZh: "更改婚姻狀況 生效日期", labelEn: "Change of Marital Status - effective date and code", kind: "date", source: "manual", ...manualNote },
        ],
      },
      {
        id: "officialUseOnly",
        titleZh: "只供稅務局人員填寫",
        titleEn: "For Official Use Only",
        boxes: Array.from({ length: 19 }, (_, index) => {
          const boxNo = String(index + 11);
          return {
            id: `officialUse.box${boxNo}`,
            boxNo,
            labelZh: `方格 ${boxNo} - 只供稅務局人員填寫`,
            labelEn: `Box ${boxNo} - For Official Use Only`,
            kind: "note",
            source: "manual",
            ...leaveBlankNote,
          };
        }),
      },
    ],
  },
  {
    id: "part2",
    partNo: "2",
    titleZh: "通知",
    titleEn: "Notification",
    sections: [
      {
        id: "part2.notification",
        titleZh: "須自行核對的通知事項",
        titleEn: "Notification items for manual review",
        boxes: [
          { id: "part2.authorizedRepresentative", boxNo: "4", labelZh: "本人已委任獲授權代表", labelEn: "I have appointed an authorized representative", kind: "note", source: "manual", ...manualNote },
          { id: "part2.advanceRuling", boxNo: "5", labelZh: "本人曾經取得有關本課稅年度的事先裁定", labelEn: "I have obtained an advance ruling relating to this year of assessment", kind: "note", source: "manual", ...manualNote },
          { id: "part2.dtaRelief", boxNo: "6", labelZh: "本人擬根據雙重課稅安排申請有關的寬免", labelEn: "I wish to claim relief under Double Taxation Arrangement(s)", kind: "note", source: "manual", ...manualNote },
          { id: "part2.futureLanguage", boxNo: "7", labelZh: "本人要求日後收取英文版本的個別人士報稅表 (BIR60)", labelEn: "I wish to receive CHINESE version of tax return (BIR60) in future", kind: "note", source: "manual", ...manualNote },
        ],
      },
    ],
  },
  {
    id: "part3",
    partNo: "3",
    titleZh: "物業稅",
    titleEn: "Property Tax",
    sections: [
      {
        id: "part3.properties",
        titleZh: "獨資出租物業詳情",
        titleEn: "Solely-owned let property details",
        boxes: [
          { id: "part3.hasSoleProperties", labelZh: "是否有獨資出租物業", labelEn: "Did you have solely-owned properties let during the year?", kind: "tick", source: "computed", noteZh: "聯名或共同擁有的物業不在本部申報。", noteEn: "Jointly-owned properties are excluded from this part." },
          { id: "part3.property.location", labelZh: "物業地點", labelEn: "Location of property", kind: "text", source: "particulars", repeatFor: "propertyColumns" },
          { id: "part3.property.period", labelZh: "出租期間", labelEn: "Period of letting", kind: "date", source: "manual", repeatFor: "propertyColumns", ...manualNote },
          { id: "part3.property.grossRentalIncome", labelZh: "總出租收入", labelEn: "Gross rental income", kind: "amount", source: "entered", repeatFor: "propertyColumns" },
          { id: "part3.property.ratesAndIrrecoverableRent", labelZh: "扣除額 - 本人繳交的差餉及不能追回的租金", labelEn: "Deductions - rates paid by me and irrecoverable rent", kind: "amount", source: "entered", repeatFor: "propertyColumns" },
          { id: "part3.property.netBeforeAllowance", labelZh: "總出租收入減扣除額", labelEn: "Gross rental income less deductions", kind: "amount", source: "computed", repeatFor: "propertyColumns", noteZh: "20%修葺及支出的標準免稅額由稅務局另行扣減。", noteEn: "The 20% repairs and outgoings allowance is applied separately by the IRD." },
        ],
      },
      {
        id: "part3.totals",
        titleZh: "總額",
        titleEn: "Totals",
        boxes: [
          { id: "part3.totalPropertiesLet", boxNo: "8", labelZh: "出租物業總數", labelEn: "Total number of properties LET", kind: "amount", source: "computed" },
          { id: "part3.totalRatesAndIrrecoverableRent", boxNo: "9", labelZh: "所有出租物業由本人繳交的差餉及不能追回的租金之總額", labelEn: "Total rates paid by me and irrecoverable rent for all properties let", kind: "amount", source: "computed" },
          { id: "part3.totalNetBeforeAllowance", boxNo: "10", labelZh: "所有出租物業的總出租收入減扣除額", labelEn: "Total gross rental income less deductions of all properties let", kind: "amount", source: "computed", noteZh: "方格10為扣除20%修葺及支出的標準免稅額前的金額。", noteEn: "Box 10 is before the 20% repairs and outgoings allowance." },
          { id: "part3.jointOwnershipExclusion", labelZh: "共同擁有物業提示", labelEn: "Joint ownership exclusion note", kind: "note", source: "manual", noteZh: "共同擁有的物業由稅務局另發物業稅報稅表處理，不在第3部填寫。", noteEn: "Jointly-owned properties are handled on separate IRD Property Tax returns and are not entered in Part 3." },
        ],
      },
    ],
  },
  {
    id: "part4",
    partNo: "4",
    titleZh: "薪俸稅",
    titleEn: "Salaries Tax",
    sections: [
      {
        id: "part4.income",
        titleZh: "4.1 本人於本年度內所獲得的入息",
        titleEn: "4.1 Income accrued to me during the year",
        boxes: [
          { id: "part4.hasSalariesIncome", labelZh: "是否有應課薪俸稅入息", labelEn: "Did you have income chargeable to Salaries Tax?", kind: "tick", source: "computed" },
          { id: "part4.employerName", labelZh: "僱主名稱", labelEn: "Name of employer", kind: "text", source: "particulars" },
          { id: "part4.employerFileNo", labelZh: "僱主檔案號碼", labelEn: "Employer file number", kind: "text", source: "particulars" },
          { id: "part4.grandTotalIncome", boxNo: "30", labelZh: "累計總入息（已包括以下方格31、32及33的數項入息）", labelEn: "Grand total (including income items in boxes 31, 32 and 33)", kind: "amount", source: "entered" },
          { id: "part4.shareOptionGain", boxNo: "31", labelZh: "來自股份認購權的收益", labelEn: "Share option gain", kind: "amount", source: "entered" },
          { id: "part4.lumpSumPayments", boxNo: "32", labelZh: "整筆款項", labelEn: "Lump sum payments", kind: "amount", source: "entered" },
          { id: "part4.commissionIncome", boxNo: "33", labelZh: "佣金入息", labelEn: "Commission income", kind: "amount", source: "entered" },
          { id: "part4.excludedAmount", boxNo: "34", labelZh: "申請從累計總入息扣除的款額", labelEn: "Amount excluded from grand total", kind: "amount", source: "computed" },
          { id: "part4.nonHongKongCompanyIncome", boxNo: "35", labelZh: "本人有就香港的僱傭工作或提供服務從非香港公司獲取入息", labelEn: "I received income from a non-Hong Kong company for employment/services rendered in HK", kind: "note", source: "manual", ...manualNote },
          { id: "part4.employerPaidTax", boxNo: "36", labelZh: "本人的僱主為本人繳付薪俸稅", labelEn: "My employer(s) paid Salaries Tax for me", kind: "note", source: "manual", ...manualNote },
        ],
      },
      {
        id: "part4.accommodation",
        titleZh: "4.2 僱主提供居所",
        titleEn: "4.2 Place of Residence Provided",
        boxes: [
          { id: "part4.placeOfResidenceValue", boxNo: "37", labelZh: "所有獲提供居所的總租值", labelEn: "Total value of all places of residence provided", kind: "amount", source: "computed" },
        ],
      },
      {
        id: "part4.deductions",
        titleZh: "4.3 扣除",
        titleEn: "4.3 Deductions",
        boxes: [
          { id: "part4.outgoingsAndExpenses", boxNo: "38", labelZh: "支出及開支（詳細資料）", labelEn: "Outgoings and expenses - particulars and amount", kind: "amount", source: "entered", noteZh: "詳細說明需自行填寫。", noteEn: "Enter supporting particulars manually." },
          { id: "part4.selfEducation", boxNo: "39", labelZh: "個人進修開支", labelEn: "Expenses of self-education", kind: "amount", source: "entered" },
          { id: "part4.charitableDonations", boxNo: "40", labelZh: "認可慈善捐款", labelEn: "Approved charitable donations", kind: "amount", source: "entered" },
          { id: "part4.mpfMandatory", boxNo: "41", labelZh: "以僱員身分付給認可退休計劃的強制性供款", labelEn: "Mandatory contributions to recognized retirement schemes as an employee", kind: "amount", source: "entered" },
        ],
      },
      {
        id: "part4.jointAssessment",
        titleZh: "4.4 選擇合併評稅",
        titleEn: "4.4 Election for Joint Assessment",
        boxes: [
          { id: "part4.jointAssessmentElection", boxNo: "42", labelZh: "本人及配偶願意選擇以合併評稅方式評定薪俸稅", labelEn: "I and my spouse wish to elect for joint assessment under Salaries Tax", kind: "tick", source: "computed" },
        ],
      },
    ],
  },
  {
    id: "part5",
    partNo: "5",
    titleZh: "利得稅",
    titleEn: "Profits Tax",
    sections: [
      {
        id: "part5.businesses",
        titleZh: "獨資業務",
        titleEn: "Sole proprietorship businesses",
        boxes: [
          { id: "part5.hasBusinesses", labelZh: "是否有獨資業務", labelEn: "Did you have sole proprietorship businesses?", kind: "tick", source: "computed" },
          { id: "part5.business1.name", labelZh: "業務名稱", labelEn: "Name of business", kind: "text", source: "particulars" },
          { id: "part5.business1.brNumber", boxNo: "43", labelZh: "商業登記號碼", labelEn: "Business Registration Number", kind: "text", source: "particulars" },
          { id: "part5.business1.grossIncome", boxNo: "44", labelZh: "總入息（包括營業額及其他入息）", labelEn: "Gross income (including turnover and other income)", kind: "amount", source: "entered" },
          { id: "part5.business1.turnover", boxNo: "45", labelZh: "營業額", labelEn: "Turnover", kind: "amount", source: "entered" },
          { id: "part5.business1.grossProfit", boxNo: "46", labelZh: "毛利／（虧損）", labelEn: "Gross profit/(loss)", kind: "amount", source: "computed" },
          { id: "part5.business1.netProfitPerAccounts", boxNo: "47", labelZh: "帳目所示的純利／（虧損）", labelEn: "Net profit/(loss) per accounts", kind: "amount", source: "computed" },
          { id: "part5.business1.assessableProfits", boxNo: "48", labelZh: "應評稅利潤／（經調整虧損）[未扣減慈善捐款的數額]", labelEn: "Assessable profits/(Adjusted losses) before charitable donations", kind: "amount", source: "computed" },
          { id: "part5.business1.charitableDonations", boxNo: "49", labelZh: "認可慈善捐款", labelEn: "Approved charitable donations", kind: "amount", source: "manual", ...manualNote },
          { id: "part5.business1.mpfSelfEmployed", boxNo: "50", labelZh: "以自僱人士身分付給強制性公積金計劃的強制性供款", labelEn: "Mandatory MPF contributions as self-employed person", kind: "amount", source: "manual", ...manualNote },
          { id: "part5.business1.twoTierRatesElection", boxNo: "51", labelZh: "此業務應按兩級稅率課稅", labelEn: "This business is chargeable at two-tiered profits tax rates", kind: "tick", source: "computed" },
          { id: "part5.business1.nonResidentTransactions", boxNo: "52", labelZh: "曾代／與非居住於香港的人士進行交易", labelEn: "Had transactions for/with non-resident persons", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.business1.specialDeductions", boxNo: "53", labelZh: "曾申索扣除研究和開發開支／環保設施開支／知識產權開支", labelEn: "Had deduction claims for R&D/environmental protection facilities/IP expenditure", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.business1.ipConcession", boxNo: "54", labelZh: "擬從具資格知識產權收入所賺取的利潤申索利得稅寬減", labelEn: "Claim profits tax concessions for eligible IP income", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.business2.name", labelZh: "業務名稱", labelEn: "Name of business", kind: "text", source: "particulars" },
          { id: "part5.business2.brNumber", boxNo: "55", labelZh: "商業登記號碼", labelEn: "Business Registration Number", kind: "text", source: "particulars" },
          { id: "part5.business2.grossIncome", boxNo: "56", labelZh: "總入息（包括營業額及其他入息）", labelEn: "Gross income (including turnover and other income)", kind: "amount", source: "entered" },
          { id: "part5.business2.turnover", boxNo: "57", labelZh: "營業額", labelEn: "Turnover", kind: "amount", source: "entered" },
          { id: "part5.business2.grossProfit", boxNo: "58", labelZh: "毛利／（虧損）", labelEn: "Gross profit/(loss)", kind: "amount", source: "computed" },
          { id: "part5.business2.netProfitPerAccounts", boxNo: "59", labelZh: "帳目所示的純利／（虧損）", labelEn: "Net profit/(loss) per accounts", kind: "amount", source: "computed" },
          { id: "part5.business2.assessableProfits", boxNo: "60", labelZh: "應評稅利潤／（經調整虧損）[未扣減慈善捐款的數額]", labelEn: "Assessable profits/(Adjusted losses) before charitable donations", kind: "amount", source: "computed" },
          { id: "part5.business2.charitableDonations", boxNo: "61", labelZh: "認可慈善捐款", labelEn: "Approved charitable donations", kind: "amount", source: "manual", ...manualNote },
          { id: "part5.business2.mpfSelfEmployed", boxNo: "62", labelZh: "以自僱人士身分付給強制性公積金計劃的強制性供款", labelEn: "Mandatory MPF contributions as self-employed person", kind: "amount", source: "manual", ...manualNote },
          { id: "part5.business2.twoTierRatesElection", boxNo: "63", labelZh: "此業務應按兩級稅率課稅", labelEn: "This business is chargeable at two-tiered profits tax rates", kind: "tick", source: "computed" },
          { id: "part5.business2.nonResidentTransactions", boxNo: "64", labelZh: "曾代／與非居住於香港的人士進行交易", labelEn: "Had transactions for/with non-resident persons", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.business2.specialDeductions", boxNo: "65", labelZh: "曾申索扣除研究和開發開支／環保設施開支／知識產權開支", labelEn: "Had deduction claims for R&D/environmental protection facilities/IP expenditure", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.business2.ipConcession", boxNo: "66", labelZh: "擬從具資格知識產權收入所賺取的利潤申索利得稅寬減", labelEn: "Claim profits tax concessions for eligible IP income", kind: "note", source: "manual", ...notComputedNote },
          { id: "part5.moreBusinesses", labelZh: "多於兩項業務", labelEn: "More than two businesses", kind: "note", source: "manual", noteZh: "如多於兩項業務，請另用附頁填寫。", noteEn: "Use a separate sheet for more than two businesses." },
        ],
      },
    ],
  },
  {
    id: "part6",
    partNo: "6",
    titleZh: "推定應評稅利潤",
    titleEn: "Deemed Assessable Profits",
    sections: [
      { id: "part6.deemedProfits", titleZh: "推定應評稅利潤", titleEn: "Deemed assessable profits", boxes: [
        { id: "part6.deemedAssessableProfits", boxNo: "67", labelZh: "本人有推定應評稅利潤", labelEn: "During the year, I had deemed assessable profits", kind: "note", source: "manual", ...notComputedNote },
      ] },
    ],
  },
  {
    id: "part7",
    partNo: "7",
    titleZh: "個人入息課稅",
    titleEn: "Personal Assessment",
    sections: [
      { id: "part7.paElection", titleZh: "選擇個人入息課稅", titleEn: "Election for Personal Assessment", boxes: [
        { id: "part7.paSeparateElection", boxNo: "68", labelZh: "願意選擇自行／與配偶分開以個人入息課稅方式評稅", labelEn: "I wish to elect for Personal Assessment myself/separately from my spouse", kind: "tick", source: "computed" },
        { id: "part7.paJointElection", boxNo: "69", labelZh: "願意共同選擇以個人入息課稅方式評稅", labelEn: "We wish to elect for Personal Assessment jointly", kind: "tick", source: "computed" },
        { id: "part7.paAdditionalDonations", boxNo: "70", labelZh: "在第4部及第5部未有申請扣除的認可慈善捐款", labelEn: "Approved charitable donations not claimed under Parts 4 and 5", kind: "amount", source: "manual", ...manualNote },
      ] },
    ],
  },
  {
    id: "part8",
    partNo: "8",
    titleZh: "利息扣除／住宅租金扣除",
    titleEn: "Deduction for Interest Payments / Domestic Rents",
    sections: [
      { id: "part8.property1", titleZh: "物業1", titleEn: "Property 1", boxes: [
        { id: "part8.property1.location", labelZh: "物業地點", labelEn: "Location of property", kind: "text", source: "particulars" },
        { id: "part8.property1.securedByMortgage", labelZh: "貸款以按揭／押記作抵押", labelEn: "Loan obtained, secured by mortgage/charge", kind: "note", source: "manual", ...manualNote },
        { id: "part8.property1.remortgagedLoan", boxNo: "71", labelZh: "涉及再按揭貸款", labelEn: "A re-mortgaged loan is involved", kind: "note", source: "manual", ...notComputedNote },
        { id: "part8.property1.ownershipShare", boxNo: "72", labelZh: "本人所佔業權百分比", labelEn: "My share of ownership (%)", kind: "amount", source: "entered" },
        { id: "part8.property1.rentalInterest", boxNo: "73", labelZh: "為獲取物業出租收入而支付的利息", labelEn: "My share of interest payments to produce rental income", kind: "amount", source: "entered" },
        { id: "part8.property1.homeLoanInterest", boxNo: "74", labelZh: "本人所佔居所貸款利息", labelEn: "My share of home loan interest payments", kind: "amount", source: "entered" },
        { id: "part8.property1.spouseNominated", boxNo: "75", labelZh: "獲配偶提名申索扣除", labelEn: "Nominated by spouse to claim deduction", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property1.spouseOwnershipShare", boxNo: "76", labelZh: "配偶所佔業權百分比", labelEn: "My spouse's share of ownership (%)", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property1.spouseHomeLoanInterest", boxNo: "77", labelZh: "配偶所佔居所貸款利息", labelEn: "My spouse's share of home loan interest payments", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property1.fullYearResidence", boxNo: "78", labelZh: "該物業全年用作本人居所", labelEn: "Property occupied as my residence for full year", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property1.tenancyStart", boxNo: "79", labelZh: "租約開始日期", labelEn: "Tenancy starts from", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property1.tenancyEnd", boxNo: "80", labelZh: "租約終止日期", labelEn: "Tenancy ends on", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property1.numberOfTenants", boxNo: "81", labelZh: "租約內租客人數", labelEn: "Number of tenants entered into the tenancy", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property1.iAmTenant", boxNo: "82", labelZh: "本人是租客／共同租客", labelEn: "I am the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property1.spouseIsTenant", boxNo: "83", labelZh: "配偶是租客／共同租客", labelEn: "My spouse is the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property1.domesticRent", boxNo: "84", labelZh: "申索住宅租金款額", labelEn: "Amount of domestic rents claimed", kind: "amount", source: "entered" },
      ] },
      { id: "part8.property2", titleZh: "物業2", titleEn: "Property 2", boxes: [
        { id: "part8.property2.location", labelZh: "物業地點", labelEn: "Location of property", kind: "text", source: "particulars" },
        { id: "part8.property2.securedByMortgage", labelZh: "貸款以按揭／押記作抵押", labelEn: "Loan obtained, secured by mortgage/charge", kind: "note", source: "manual", ...manualNote },
        { id: "part8.property2.remortgagedLoan", boxNo: "85", labelZh: "涉及再按揭貸款", labelEn: "A re-mortgaged loan is involved", kind: "note", source: "manual", ...notComputedNote },
        { id: "part8.property2.ownershipShare", boxNo: "86", labelZh: "本人所佔業權百分比", labelEn: "My share of ownership (%)", kind: "amount", source: "entered" },
        { id: "part8.property2.rentalInterest", boxNo: "87", labelZh: "為獲取物業出租收入而支付的利息", labelEn: "My share of interest payments to produce rental income", kind: "amount", source: "entered" },
        { id: "part8.property2.homeLoanInterest", boxNo: "88", labelZh: "本人所佔居所貸款利息", labelEn: "My share of home loan interest payments", kind: "amount", source: "manual" },
        { id: "part8.property2.spouseNominated", boxNo: "89", labelZh: "獲配偶提名申索扣除", labelEn: "Nominated by spouse to claim deduction", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property2.spouseOwnershipShare", boxNo: "90", labelZh: "配偶所佔業權百分比", labelEn: "My spouse's share of ownership (%)", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property2.spouseHomeLoanInterest", boxNo: "91", labelZh: "配偶所佔居所貸款利息", labelEn: "My spouse's share of home loan interest payments", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property2.fullYearResidence", boxNo: "92", labelZh: "該物業全年用作本人居所", labelEn: "Property occupied as my residence for full year", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property2.tenancyStart", boxNo: "93", labelZh: "租約開始日期", labelEn: "Tenancy starts from", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property2.tenancyEnd", boxNo: "94", labelZh: "租約終止日期", labelEn: "Tenancy ends on", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property2.numberOfTenants", boxNo: "95", labelZh: "租約內租客人數", labelEn: "Number of tenants entered into the tenancy", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property2.iAmTenant", boxNo: "96", labelZh: "本人是租客／共同租客", labelEn: "I am the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property2.spouseIsTenant", boxNo: "97", labelZh: "配偶是租客／共同租客", labelEn: "My spouse is the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property2.domesticRent", boxNo: "98", labelZh: "申索住宅租金款額", labelEn: "Amount of domestic rents claimed", kind: "amount", source: "manual" },
      ] },
      { id: "part8.property3", titleZh: "物業3", titleEn: "Property 3", boxes: [
        { id: "part8.property3.location", labelZh: "物業地點", labelEn: "Location of property", kind: "text", source: "particulars" },
        { id: "part8.property3.securedByMortgage", labelZh: "貸款以按揭／押記作抵押", labelEn: "Loan obtained, secured by mortgage/charge", kind: "note", source: "manual", ...manualNote },
        { id: "part8.property3.remortgagedLoan", boxNo: "99", labelZh: "涉及再按揭貸款", labelEn: "A re-mortgaged loan is involved", kind: "note", source: "manual", ...notComputedNote },
        { id: "part8.property3.ownershipShare", boxNo: "100", labelZh: "本人所佔業權百分比", labelEn: "My share of ownership (%)", kind: "amount", source: "entered" },
        { id: "part8.property3.rentalInterest", boxNo: "101", labelZh: "為獲取物業出租收入而支付的利息", labelEn: "My share of interest payments to produce rental income", kind: "amount", source: "entered" },
        { id: "part8.property3.homeLoanInterest", boxNo: "102", labelZh: "本人所佔居所貸款利息", labelEn: "My share of home loan interest payments", kind: "amount", source: "manual" },
        { id: "part8.property3.spouseNominated", boxNo: "103", labelZh: "獲配偶提名申索扣除", labelEn: "Nominated by spouse to claim deduction", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property3.spouseOwnershipShare", boxNo: "104", labelZh: "配偶所佔業權百分比", labelEn: "My spouse's share of ownership (%)", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property3.spouseHomeLoanInterest", boxNo: "105", labelZh: "配偶所佔居所貸款利息", labelEn: "My spouse's share of home loan interest payments", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property3.fullYearResidence", boxNo: "106", labelZh: "該物業全年用作本人居所", labelEn: "Property occupied as my residence for full year", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property3.tenancyStart", boxNo: "107", labelZh: "租約開始日期", labelEn: "Tenancy starts from", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property3.tenancyEnd", boxNo: "108", labelZh: "租約終止日期", labelEn: "Tenancy ends on", kind: "date", source: "manual", ...manualNote },
        { id: "part8.property3.numberOfTenants", boxNo: "109", labelZh: "租約內租客人數", labelEn: "Number of tenants entered into the tenancy", kind: "amount", source: "manual", ...manualNote },
        { id: "part8.property3.iAmTenant", boxNo: "110", labelZh: "本人是租客／共同租客", labelEn: "I am the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property3.spouseIsTenant", boxNo: "111", labelZh: "配偶是租客／共同租客", labelEn: "My spouse is the tenant/a co-tenant", kind: "tick", source: "manual", ...manualNote },
        { id: "part8.property3.domesticRent", boxNo: "112", labelZh: "申索住宅租金款額", labelEn: "Amount of domestic rents claimed", kind: "amount", source: "manual" },
      ] },
      { id: "part8.additionalCeiling", titleZh: "8.6 額外扣除上限選擇", titleEn: "8.6 Additional deduction ceiling election", boxes: [
        { id: "part8.additionalCeiling.selfElection", boxNo: "113", labelZh: "本人選擇使用額外扣除上限", labelEn: "I elect for using the additional deduction ceiling amount", kind: "note", source: "manual", ...manualNote },
        { id: "part8.additionalCeiling.spouseElection", boxNo: "114", labelZh: "配偶選擇使用額外扣除上限", labelEn: "My spouse elects for using the additional deduction ceiling amount", kind: "note", source: "manual", ...manualNote },
        { id: "part8.additionalCeiling.childDob", boxNo: "115", labelZh: "該子女出生日期", labelEn: "Particulars of the Child - Date of birth", kind: "date", source: "manual", ...manualNote },
      ] },
    ],
  },
  {
    id: "part9",
    partNo: "9",
    titleZh: "根據自願醫保計劃保單繳付的合資格保費",
    titleEn: "Qualifying Premiums Paid under VHIS Policy",
    sections: [
      { id: "part9.vhis", titleZh: "保費", titleEn: "Premiums", boxes: [
        { id: "part9.selfPremium", boxNo: "116", labelZh: "為本人繳付的合資格保費", labelEn: "Qualifying premiums paid for self", kind: "amount", source: "entered" },
        ...[1, 2, 3].flatMap((relative) => {
          const boxNos = relative === 1 ? ["117", "118", "119", "120", "121", "122", "123"] : relative === 2 ? ["124", "125", "126", "127", "128", "129", "130"] : ["131", "132", "133", "134", "135", "136", "137"];
          const prefix = `part9.relative${relative}`;
          return [
            { id: `${prefix}.name`, labelZh: `親屬${relative}姓名`, labelEn: `Relative ${relative} - Name`, kind: "text", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.hkid`, boxNo: boxNos[0], labelZh: `親屬${relative}香港身份證號碼`, labelEn: `Relative ${relative} - HKID Card Number`, kind: "text", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.dob`, boxNo: boxNos[1], labelZh: `親屬${relative}出生日期`, labelEn: `Relative ${relative} - Date of birth`, kind: "date", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.relationshipCode`, boxNo: boxNos[2], labelZh: `親屬${relative}關係代號`, labelEn: `Relative ${relative} - Relationship code`, kind: "text", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.ageBandCode`, boxNo: boxNos[3], labelZh: `親屬${relative}年齡代號`, labelEn: `Relative ${relative} - Age band code`, kind: "text", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.parentHkid`, boxNo: boxNos[4], labelZh: `親屬${relative}父/母香港身份證號碼`, labelEn: `Relative ${relative} - Parent's HKID`, kind: "text", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.disabilityAllowanceEligible`, boxNo: boxNos[5], labelZh: `親屬${relative}是否合資格申索傷殘津貼`, labelEn: `Relative ${relative} - eligible for Disability Allowance Scheme`, kind: "tick", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
            { id: `${prefix}.premiumClaimed`, boxNo: boxNos[6], labelZh: `親屬${relative}申索保費`, labelEn: `Relative ${relative} - Amount of premiums claimed`, kind: "amount", source: "manual", repeatFor: "vhisRelatives", ...manualNote },
          ] satisfies Bir60BoxTemplate[];
        }),
      ] },
    ],
  },
  {
    id: "part10",
    partNo: "10",
    titleZh: "輔助生育服務開支扣除",
    titleEn: "Deduction for Assisted Reproductive Service Expenses",
    sections: [
      { id: "part10.assistedReproduction", titleZh: "輔助生育服務開支", titleEn: "Assisted reproductive service expenses", boxes: [
        { id: "part10.assistedReproduction", boxNo: "138", labelZh: "申請的合資格輔助生育服務開支款額", labelEn: "Amount of qualifying AR service expenses claimed", kind: "amount", source: "entered" },
      ] },
    ],
  },
  {
    id: "part11",
    partNo: "11",
    titleZh: "合資格年金保費及可扣稅強積金自願性供款",
    titleEn: "Qualifying Annuity Premiums and Tax Deductible MPF Voluntary Contributions",
    sections: [
      { id: "part11.annuityTvc", titleZh: "年金及可扣稅自願性供款", titleEn: "Annuity and TVC", boxes: [
        { id: "part11.tvcAccountHolder", boxNo: "139", labelZh: "本人是可扣稅自願性供款帳戶的持有人", labelEn: "I am the holder of a TVC account", kind: "note", source: "manual", ...manualNote },
        { id: "part11.tvcContribution", boxNo: "140", labelZh: "可扣稅強積金自願性供款", labelEn: "Tax deductible MPF voluntary contributions", kind: "amount", source: "entered" },
        { id: "part11.annuitySelf", boxNo: "141", labelZh: "以本人作為年金領取人繳付的合資格年金保費", labelEn: "Qualifying annuity premiums paid for self as annuitant", kind: "amount", source: "entered" },
        { id: "part11.annuitySpouse", boxNo: "142", labelZh: "以配偶作為年金領取人繳付的合資格年金保費", labelEn: "Qualifying annuity premiums paid for spouse as annuitant", kind: "amount", source: "manual", ...manualNote },
      ] },
    ],
  },
  {
    id: "part12",
    partNo: "12",
    titleZh: "免稅額及長者住宿照顧開支",
    titleEn: "Allowances and Elderly Residential Care Expenses",
    sections: [
      { id: "part12.marriedDisability", titleZh: "12.1 已婚人士免稅額及傷殘人士免稅額", titleEn: "12.1 Married Person's Allowance and Personal Disability Allowance", boxes: [
        { id: "part12.spouseHadIncome", boxNo: "143", labelZh: "配偶在本年度內有收取應課薪俸稅的入息", labelEn: "My spouse had income chargeable to Salaries Tax during the year", kind: "tick", source: "computed" },
        { id: "part12.livingApartMaintenance", boxNo: "144", labelZh: "與沒有應課薪俸稅入息的配偶分開居住並支付其生活費", labelEn: "Living apart from spouse with no chargeable income; maintenance paid", kind: "amount", source: "manual", ...manualNote },
        { id: "part12.spouseDisabledDependant", boxNo: "145", labelZh: "就配偶申請傷殘受養人免稅額", labelEn: "Claim disabled dependant allowance in respect of spouse", kind: "tick", source: "manual", ...manualNote },
        { id: "part12.personalDisability", boxNo: "146", labelZh: "申請傷殘人士免稅額", labelEn: "Claim personal disability allowance", kind: "tick", source: "computed" },
      ] },
      { id: "part12.childrenSiblings", titleZh: "12.2 子女免稅額及供養兄弟姊妹免稅額", titleEn: "12.2 Child Allowance and Dependent Brother/Sister Allowance", boxes: [
        ...[1, 2, 3].flatMap((dependant) => {
          const boxNos = dependant === 1 ? ["147", "148", "149", "150"] : dependant === 2 ? ["151", "152", "153", "154"] : ["155", "156", "157", "158"];
          const prefix = `part12.child${dependant}`;
          return [
            { id: `${prefix}.name`, labelZh: `受養人${dependant}姓名`, labelEn: `Dependant ${dependant} - Name`, kind: "text", source: "particulars", repeatFor: "childDependants" },
            { id: `${prefix}.relationshipCode`, boxNo: boxNos[0], labelZh: `受養人${dependant}關係`, labelEn: `Dependant ${dependant} - Relationship`, kind: "text", source: "computed", repeatFor: "childDependants" },
            { id: `${prefix}.dob`, boxNo: boxNos[1], labelZh: `受養人${dependant}出生日期`, labelEn: `Dependant ${dependant} - Date of birth`, kind: "date", source: "entered", repeatFor: "childDependants" },
            { id: `${prefix}.ageBandCode`, boxNo: boxNos[2], labelZh: `受養人${dependant}年齡代號`, labelEn: `Dependant ${dependant} - Age band code`, kind: "note", source: "manual", repeatFor: "childDependants", ...manualNote },
            { id: `${prefix}.disabledDependantAllowance`, boxNo: boxNos[3], labelZh: `受養人${dependant}傷殘受養人免稅額`, labelEn: `Dependant ${dependant} - disabled dependant allowance`, kind: "tick", source: "manual", repeatFor: "childDependants", ...manualNote },
          ] satisfies Bir60BoxTemplate[];
        }),
        { id: "part12.siblingFatherHkid", boxNo: "159", labelZh: "供養兄弟姊妹父親香港身份證號碼", labelEn: "Father's HKID for dependent brother/sister", kind: "text", source: "manual", ...manualNote },
        { id: "part12.siblingMotherHkid", boxNo: "160", labelZh: "供養兄弟姊妹母親香港身份證號碼", labelEn: "Mother's HKID for dependent brother/sister", kind: "text", source: "manual", ...manualNote },
        { id: "part12.childOverflow", labelZh: "額外受養子女／兄弟姊妹", labelEn: "Additional child/brother/sister dependants", kind: "note", source: "manual", noteZh: "如受養人多於三名，請另用附頁填寫。", noteEn: "Use a separate sheet for more than three dependants." },
      ] },
      { id: "part12.singleParent", titleZh: "12.3 單親免稅額", titleEn: "12.3 Single Parent Allowance", boxes: [
        { id: "part12.singleParent", boxNo: "161", labelZh: "獨力或主力撫養子女", labelEn: "Sole/predominant care of child/children", kind: "text", source: "computed" },
      ] },
      { id: "part12.parents", titleZh: "12.4 供養父母及供養祖父母或外祖父母免稅額及長者住宿照顧開支", titleEn: "12.4 Dependent Parent/Grandparent Allowance and Elderly Residential Care Expenses", boxes: [
        ...[1, 2, 3].flatMap((dependant) => {
          const boxNos = dependant === 1 ? ["162", "163", "164", "165", "166", "167", "168", "169"] : dependant === 2 ? ["170", "171", "172", "173", "174", "175", "176", "177"] : ["178", "179", "180", "181", "182", "183", "184", "185"];
          const prefix = `part12.parent${dependant}`;
          return [
            { id: `${prefix}.name`, labelZh: `父母／祖父母受養人${dependant}姓名`, labelEn: `Parent/grandparent dependant ${dependant} - Name`, kind: "text", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.hkid`, boxNo: boxNos[0], labelZh: `受養人${dependant}香港身份證號碼`, labelEn: `Dependant ${dependant} - HKID`, kind: "text", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.dobMonthYear`, boxNo: boxNos[1], labelZh: `受養人${dependant}出生月份及年份`, labelEn: `Dependant ${dependant} - Date of birth (month and year)`, kind: "date", source: "entered", repeatFor: "parentDependants" },
            { id: `${prefix}.relationshipCode`, boxNo: boxNos[2], labelZh: `受養人${dependant}關係`, labelEn: `Dependant ${dependant} - Relationship`, kind: "note", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.ordinarilyResidentHk`, boxNo: boxNos[3], labelZh: `受養人${dependant}通常在香港居住`, labelEn: `Dependant ${dependant} ordinarily resident in Hong Kong`, kind: "note", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.residedWithMeCode`, boxNo: boxNos[4], labelZh: `受養人${dependant}與本人同住代號`, labelEn: `Dependant ${dependant} resided with me code`, kind: "text", source: "computed", repeatFor: "parentDependants" },
            { id: `${prefix}.contributed12000`, boxNo: boxNos[5], labelZh: `受養人${dependant}供養費不少於12,000元`, labelEn: `Dependant ${dependant} support contribution at least $12,000`, kind: "tick", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.careHomeName`, labelZh: `受養人${dependant}安老院名稱`, labelEn: `Dependant ${dependant} - Name of residential care home`, kind: "text", source: "manual", repeatFor: "parentDependants", ...manualNote },
            { id: `${prefix}.elderlyResidentialCareExpenses`, boxNo: boxNos[6], labelZh: `受養人${dependant}長者住宿照顧開支`, labelEn: `Dependant ${dependant} elderly residential care expenses`, kind: "amount", source: "entered", repeatFor: "parentDependants" },
            { id: `${prefix}.disabledDependantAllowance`, boxNo: boxNos[7], labelZh: `受養人${dependant}傷殘受養人免稅額`, labelEn: `Dependant ${dependant} disabled dependant allowance`, kind: "tick", source: "manual", repeatFor: "parentDependants", ...manualNote },
          ] satisfies Bir60BoxTemplate[];
        }),
        { id: "part12.parentOverflow", labelZh: "額外供養父母／祖父母", labelEn: "Additional parent/grandparent dependants", kind: "note", source: "manual", noteZh: "如受養人多於三名，請另用附頁填寫。", noteEn: "Use a separate sheet for more than three dependants." },
      ] },
    ],
  },
  {
    id: "part13",
    partNo: "13",
    titleZh: "聲明書",
    titleEn: "Declaration",
    sections: [
      { id: "part13.declaration", titleZh: "簽署", titleEn: "Signature", boxes: [
        { id: "part13.signature", labelZh: "納稅人簽署及日期；如共同選擇或配偶提名，配偶亦須簽署", labelEn: "Taxpayer signature and date; spouse signature may also be required for joint elections or nomination", kind: "note", source: "manual", noteZh: "聲明及簽署必須由納稅人自行完成。", noteEn: "The declaration and signature must be completed manually by the taxpayer." },
      ] },
    ],
  },
];
