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
    zh: "扣除項目",
    en: "Deductions"
  },
  "header.nav.guides": {
    zh: "稅務指南",
    en: "Guides"
  },
  "header.nav.contact": {
    zh: "聯絡我們",
    en: "Contact"
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
    zh: "本網站只作香港個人稅務教育及估算用途，實際評稅以稅務局的通知及專業意見為準。",
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
  "footer.links.feedback": {
    zh: "改進建議",
    en: "Feedback"
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
    zh: "輕鬆算清你的香港稅款",
    en: "Calculate your Hong Kong taxes with confidence"
  },
  "home.hero.subtitle": {
    zh: "涵蓋薪俸稅、物業稅、利得稅及個人入息課稅，逐步引導你看清報稅的整體情況。",
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
  "home.hero.trust.ird": {
    zh: "稅率及免稅額源自稅務局",
    en: "IRD-sourced parameters"
  },
  "home.hero.trust.browser": {
    zh: "100% 在你的瀏覽器內計算",
    en: "100% in-browser calculation"
  },
  "home.hero.trust.free": {
    zh: "免費，無需帳戶",
    en: "Free, no account required"
  },
  "home.features.eyebrow": {
    zh: "稅務範圍",
    en: "Tax areas"
  },
  "home.features.title": {
    zh: "由收入來源到家庭狀況，一次整理清楚",
    en: "Organize income sources and family circumstances in one place"
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
    zh: "快速檢視租金收入、差餉，以及修葺及支出的標準免稅額如何影響應繳稅款。",
    en: "Preview how rental income, rates, and the standard repairs and outgoings allowance affect tax payable."
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
    zh: "為獨資及合夥業務預留位置，日後可接上業務收入的計算。",
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
    zh: "預先記錄配偶、子女及受養親屬的資料，日後可比較個人入息課稅的選擇。",
    en: "Record spouse, child, and dependant details for later Personal Assessment comparisons."
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
    zh: "回答問題",
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
    zh: "在瀏覽器內即時計算，每次輸入都即時反映在稅款上。",
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
    zh: "100% 在你的瀏覽器內計算，資料不會上傳。",
    en: "All computation stays in your browser; nothing is uploaded."
  },
  "contact.eyebrow": {
    zh: "聯絡",
    en: "Contact"
  },
  "contact.title": {
    zh: "聯絡我們",
    en: "Contact us"
  },
  "contact.intro": {
    zh: "如你對這個香港個人稅務教育工具有一般查詢、私隱問題或技術問題，可以使用以下表格聯絡網站營運者。",
    en: "Use this form to contact the site owner about this Hong Kong personal tax education tool, including general questions, privacy questions, or technical issues."
  },
  "contact.safetyTitle": {
    zh: "請勿提交敏感稅務資料",
    en: "Do not send sensitive tax details"
  },
  "contact.notIrdNote": {
    zh: "本網站純屬教育工具，營運者並非稅務局，不能查閱任何人的稅務帳戶，也不能代任何人報稅或處理個案。請勿透過此表格提交香港身份證號碼、密碼或完整稅務資料。",
    en: "This site is an educational tool. The operators are not the Inland Revenue Department and cannot access anyone's tax account, file on anyone's behalf, or handle individual tax cases. Do not send HKID numbers, passwords, or full tax details through this form."
  },
  "contact.irdReferralNote": {
    zh: "如屬真正稅務帳戶查詢，請直接聯絡稅務局：",
    en: "For genuine tax-account enquiries, contact the IRD directly:"
  },
  "contact.irdLinkText": {
    zh: "稅務局網站",
    en: "IRD website"
  },
  "contact.privacyNote": {
    zh: "稅務計算機本身仍然 100% 在你的瀏覽器內運算；只有你在此表格輸入的內容會被傳送。",
    en: "The tax calculator itself still runs 100% in your browser; only the contents you type into this form are transmitted."
  },
  "feedback.eyebrow": {
    zh: "意見",
    en: "Feedback"
  },
  "feedback.title": {
    zh: "改進建議",
    en: "Suggest an improvement"
  },
  "feedback.intro": {
    zh: "如果你發現錯誤、對計算結果有疑問，或想建議改善介面和內容，可以在這裡告訴網站營運者。",
    en: "Tell the site owner if you spot an issue, have a question about a calculation, or want to suggest improvements to the interface or content."
  },
  "feedback.notesTitle": {
    zh: "私下閱覽",
    en: "Privately reviewed"
  },
  "feedback.notPublishedNote": {
    zh: "你的建議只會由網站擁有人私下閱讀，不會發布在網站任何位置；本網站沒有公開留言板。",
    en: "Suggestions are read privately by the site owner and are not published anywhere on the site; there is no public comment board."
  },
  "feedback.privacyNote": {
    zh: "稅務計算機本身仍然 100% 在你的瀏覽器內運算；只有你在此表格輸入的內容會被傳送。",
    en: "The tax calculator itself still runs 100% in your browser; only the contents you type into this form are transmitted."
  },
  "placeholder.comingSoon": {
    zh: "即將推出",
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
    zh: "扣除項目",
    en: "Deductions"
  },
  "placeholder.guides.title": {
    zh: "稅務指南",
    en: "Guides"
  }
} as const satisfies Record<string, LocalizedString>;

export type DictionaryKey = keyof typeof dictionary;
