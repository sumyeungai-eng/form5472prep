export type Language = "zh" | "en";

type LocalizedString = Record<Language, string>;

export const dictionary = {
  "site.name.zh": {
    zh: "香港報稅助手",
    en: "香港報稅助手"
  },
  "site.name.en": {
    zh: "HK Tax Assistant",
    en: "HK Tax Assistant"
  },
  "site.name.full": {
    zh: "HK Tax Assistant 香港報稅助手",
    en: "HK Tax Assistant 香港報稅助手"
  },
  "site.logoMark": {
    zh: "HK",
    en: "HK"
  },
  "header.nav.ariaLabel": {
    zh: "主要導覽",
    en: "Primary navigation"
  },
  "header.nav.home": {
    zh: "首頁",
    en: "Home"
  },
  "header.nav.wizard": {
    zh: "報稅精靈",
    en: "Tax Wizard"
  },
  "header.nav.calculators": {
    zh: "快速計算機",
    en: "Calculators"
  },
  "header.nav.deductions": {
    zh: "扣稅檢查",
    en: "Deductions"
  },
  "header.nav.guides": {
    zh: "稅務指南",
    en: "Guides"
  },
  "header.language.ariaLabel": {
    zh: "切換語言",
    en: "Switch language"
  },
  "header.language.zhAriaLabel": {
    zh: "切換至中文",
    en: "Switch to Chinese"
  },
  // WCAG 2.5.3 Label in Name: the accessible name must contain the visible
  // label ("EN") so speech-input users can activate it by saying what they see.
  "header.language.enAriaLabel": {
    zh: "切換至英文 EN",
    en: "Switch to English (EN)"
  },
  "header.language.zh": {
    zh: "中",
    en: "中"
  },
  "header.language.en": {
    zh: "EN",
    en: "EN"
  },
  "header.year.ariaLabel": {
    zh: "選擇課稅年度",
    en: "Select year of assessment"
  },
  "header.year.2024_25": {
    zh: "2024/25 課稅年度 / YA 2024/25",
    en: "YA 2024/25 / 2024/25 課稅年度"
  },
  "header.year.2025_26": {
    zh: "2025/26 課稅年度 / YA 2025/26",
    en: "YA 2025/26 / 2025/26 課稅年度"
  },
  "footer.disclaimer": {
    zh: "本網站只提供香港個人稅務教育及估算用途，實際評稅以稅務局通知及專業意見為準。",
    en: "This website is for Hong Kong personal tax education and estimation only; actual assessments depend on IRD notices and professional advice."
  },
  "footer.affiliation": {
    zh: "並非稅務局網站 / not affiliated with IRD",
    en: "Not affiliated with IRD / 並非稅務局網站"
  },
  "footer.links.ariaLabel": {
    zh: "頁尾連結",
    en: "Footer links"
  },
  "footer.copyright": {
    zh: "保留所有權利。",
    en: "All rights reserved."
  },
  "footer.copyrightPrefix": {
    zh: "© 2026",
    en: "© 2026"
  },
  "disclaimer.banner": {
    zh: "本工具只作教育用途，並非稅務、法律或會計意見。",
    en: "This tool is educational only and is not tax, legal, or accounting advice."
  },
  "home.hero.eyebrow": {
    zh: "香港個人稅務規劃",
    en: "Hong Kong personal tax planning"
  },
  "home.hero.title": {
    zh: "輕鬆計算香港個人稅",
    en: "Calculate your Hong Kong taxes with confidence"
  },
  "home.hero.subtitle": {
    zh: "涵蓋薪俸稅、物業稅、利得稅及個人入息課稅，協助你用清晰步驟了解報稅影響。",
    en: "Cover Salaries Tax, Property Tax, Profits Tax, and Personal Assessment with a clear step-by-step filing view."
  },
  "home.hero.primaryCta": {
    zh: "開始報稅精靈",
    en: "Start Tax Wizard"
  },
  "home.hero.secondaryCta": {
    zh: "使用快速計算機",
    en: "Use Calculators"
  },
  "home.hero.imageAlt": {
    zh: "香港天際線背景",
    en: "Hong Kong skyline background"
  },
  "home.features.eyebrow": {
    zh: "稅務範圍",
    en: "Tax areas"
  },
  "home.features.title": {
    zh: "由收入來源到家庭情境，一次整理",
    en: "Organize income sources and family scenarios in one place"
  },
  "home.features.salaries.title": {
    zh: "薪俸稅",
    en: "Salaries Tax"
  },
  "home.features.salaries.description": {
    zh: "整理僱傭收入、扣除項目及免稅額，為完整報稅流程打好基礎。",
    en: "Structure employment income, deductions, and allowances before the full filing flow."
  },
  "home.features.salaries.alt": {
    zh: "薪俸稅功能卡圖片",
    en: "Salaries Tax feature card image"
  },
  "home.features.property.title": {
    zh: "物業稅",
    en: "Property Tax"
  },
  "home.features.property.description": {
    zh: "快速檢視租金收入、差餉及法定修葺免稅額如何影響應繳稅款。",
    en: "Preview how rental income, rates, and statutory repairs allowance affect tax payable."
  },
  "home.features.property.alt": {
    zh: "物業稅功能卡圖片",
    en: "Property Tax feature card image"
  },
  "home.features.profits.title": {
    zh: "利得稅",
    en: "Profits Tax"
  },
  "home.features.profits.description": {
    zh: "為獨資或合夥業務預留清晰入口，日後連接業務收入計算。",
    en: "Prepare a clear entry point for sole proprietorship and partnership income calculations."
  },
  "home.features.profits.alt": {
    zh: "利得稅功能卡圖片",
    en: "Profits Tax feature card image"
  },
  "home.features.family.title": {
    zh: "家庭及評稅比較",
    en: "Family and assessment comparison"
  },
  "home.features.family.description": {
    zh: "保留配偶、子女及供養親屬情境，支援日後比較個人入息課稅選項。",
    en: "Keep spouse, child, and dependant scenarios ready for future Personal Assessment comparisons."
  },
  "home.features.family.alt": {
    zh: "家庭及評稅比較功能卡圖片",
    en: "Family and assessment comparison feature card image"
  },
  "home.how.eyebrow": {
    zh: "流程",
    en: "How it works"
  },
  "home.how.title": {
    zh: "三步完成初步稅務整理",
    en: "Three steps to a cleaner tax picture"
  },
  "home.how.step1.title": {
    zh: "答問題",
    en: "Answer questions"
  },
  "home.how.step1.description": {
    zh: "按收入、家庭及扣除項目逐步輸入資料。",
    en: "Enter income, family, and deduction details in guided sections."
  },
  "home.how.step2.title": {
    zh: "即時計算",
    en: "Instant calculation"
  },
  "home.how.step2.description": {
    zh: "在瀏覽器內整理計算，讓你即時看到影響。",
    en: "Review estimates in the browser as the filing picture changes."
  },
  "home.how.step3.title": {
    zh: "慳稅建議",
    en: "Tax-saving suggestions"
  },
  "home.how.step3.description": {
    zh: "比較可用扣除及評稅方式，找出值得跟進的地方。",
    en: "Compare available deductions and assessment choices for follow-up."
  },
  "home.privacy.title": {
    zh: "私隱優先",
    en: "Privacy first"
  },
  "home.privacy.note": {
    zh: "100% 瀏覽器內計算，資料不會上傳。",
    en: "All computation stays in your browser; nothing is uploaded."
  },
  "placeholder.comingSoon": {
    zh: "建設中",
    en: "Coming soon"
  },
  "placeholder.description": {
    zh: "此頁面會在下一階段加入完整功能。",
    en: "This page will gain full functionality in a later step."
  },
  "placeholder.wizard.title": {
    zh: "報稅精靈",
    en: "Tax Wizard"
  },
  "placeholder.calculators.title": {
    zh: "快速計算機",
    en: "Calculators"
  },
  "placeholder.deductions.title": {
    zh: "扣稅檢查",
    en: "Deductions"
  },
  "placeholder.guides.title": {
    zh: "稅務指南",
    en: "Guides"
  }
} as const satisfies Record<string, LocalizedString>;

export type DictionaryKey = keyof typeof dictionary;
