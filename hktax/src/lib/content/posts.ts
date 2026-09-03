export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

export type Post = {
  slug: string;
  kind: "tax-news" | "site-update" | "article";
  publishedISO: string;
  reviewedISO: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  bodyZh: PostBlock[];
  bodyEn: PostBlock[];
  sources?: { label: string; url: string }[];
  tags?: string[];
};

const posts: Post[] = [
  {
    slug: "2025-26-tax-reduction-hk3000-cap",
    kind: "tax-news",
    publishedISO: "2026-08-31",
    reviewedISO: "2026-08-31",
    titleZh: "2025/26 稅款寬減上限為 {reductionCap2025}",
    titleEn: "YA 2025/26 tax reduction cap is {reductionCap2025}",
    summaryZh:
      "2025/26 年度的一次性稅款寬減為稅款的 {reductionPercent}，每宗個案上限為 {reductionCap2025}，高於 2024/25 年度的 {reductionCap2024} 上限。它適用於薪俸稅、利得稅及個人入息課稅，但不適用於物業稅或暫繳稅。",
    summaryEn:
      "For YA 2025/26, the one-off tax reduction is {reductionPercent} of tax payable, capped at {reductionCap2025} per case, up from the YA 2024/25 cap of {reductionCap2024}. It applies to Salaries Tax, Profits Tax, and tax under Personal Assessment, but not Property Tax or provisional tax.",
    bodyZh: [
      {
        type: "paragraph",
        text:
          "2026 年 2 月《財政預算案》公布的 2025/26 年度一次性稅款寬減，已在本網站的 2025/26 參數中反映。寬減為稅款的 {reductionPercent}，但每宗個案最多只可扣減 {reductionCap2025}。"
      },
      {
        type: "paragraph",
        text:
          "相比 2024/25 年度，每宗個案上限由 {reductionCap2024} 提高至 {reductionCap2025}。這是一項按年度公布的一次性措施，不應假設每年相同。"
      },
      { type: "heading", text: "適用及不適用範圍" },
      {
        type: "list",
        items: [
          "適用於薪俸稅。",
          "適用於利得稅。",
          "適用於個人入息課稅下的稅款。",
          "不適用於物業稅。",
          "不適用於 2025/26 年度暫繳稅；寬減只會在 2025/26 年度的最終評稅中處理。"
        ]
      },
      {
        type: "callout",
        text:
          "如果你只有出租物業並按物業稅評稅，這項一次性稅款寬減並不適用於物業稅。是否選擇個人入息課稅，須視乎整體計算結果。"
      }
    ],
    bodyEn: [
      {
        type: "paragraph",
        text:
          "The one-off YA 2025/26 tax reduction announced in the February 2026 Budget is reflected in this site's YA 2025/26 parameters. The reduction is {reductionPercent} of tax payable, capped at {reductionCap2025} per case."
      },
      {
        type: "paragraph",
        text:
          "Compared with YA 2024/25, the per-case cap rises from {reductionCap2024} to {reductionCap2025}. This is an annual one-off Budget measure, so it should not be assumed to stay the same every year."
      },
      { type: "heading", text: "What it covers" },
      {
        type: "list",
        items: [
          "It applies to Salaries Tax.",
          "It applies to Profits Tax.",
          "It applies to tax under Personal Assessment.",
          "It does not apply to Property Tax.",
          "It does not apply to YA 2025/26 provisional tax; it is dealt with only in the final assessment for YA 2025/26."
        ]
      },
      {
        type: "callout",
        text:
          "If you only have rental income assessed under Property Tax, this one-off tax reduction is not applied to the Property Tax itself. Whether Personal Assessment helps depends on the full calculation."
      }
    ],
    sources: [
      {
        label: "IRD 2026-27 Budget - Tax Measures",
        url: "https://www.ird.gov.hk/eng/tax/budget.htm"
      },
      {
        label: "Government press release on the 2026-27 Budget",
        url: "https://www.info.gov.hk/gia/general/202602/25/P2026022500841.htm"
      }
    ],
    tags: ["2025/26", "tax reduction", "Budget"]
  },
  {
    slug: "2026-27-allowance-increases-do-not-apply-to-2025-26",
    kind: "tax-news",
    publishedISO: "2026-08-31",
    reviewedISO: "2026-08-31",
    titleZh: "2026/27 免稅額增加不適用於 2025/26 報稅",
    titleEn: "YA 2026/27 allowance increases do not apply to YA 2025/26",
    summaryZh:
      "2026 年 2 月《財政預算案》公布了多項免稅額及扣除額上調，但這些改動由 2026/27 課稅年度起才適用。填報 2025/26 報稅表時不應採用新年度的金額。",
    summaryEn:
      "The February 2026 Budget announced increases to several allowances and deductions, but those changes start from YA 2026/27. They should not be used for YA 2025/26 filing.",
    bodyZh: [
      {
        type: "callout",
        text:
          "重點：填報 2025/26 報稅表時，不要使用 2026/27 起才生效的免稅額或扣除額。這是十分容易出錯、而且代價可能不菲的年度混淆問題。"
      },
      {
        type: "paragraph",
        text:
          "2026 年 2 月《財政預算案》公布上調基本免稅額、已婚人士免稅額、子女免稅額、供養父母／祖父母或外祖父母免稅額，以及長者住宿照顧開支扣除等多個項目的金額。"
      },
      {
        type: "paragraph",
        text:
          "不過，經核對的稅務局 PAM 61(e) 表格將 2024/25 及 2025/26 列於同一欄，並將 2026/27 及其後年度另列一欄。換言之，這些上調並不影響 2025/26 年度的計算。"
      },
      { type: "heading", text: "對 2025/26 報稅人的實務影響" },
      {
        type: "list",
        items: [
          "填報或核對 2025/26 稅款時，應使用 2025/26 年度的參數。",
          "不要把 2026/27 起才生效的免稅額加到 2025/26 年度。",
          "如需查閱新年度的確切金額，請直接參閱稅務局 PAM 61(e) 官方表格。"
        ]
      }
    ],
    bodyEn: [
      {
        type: "callout",
        text:
          "Key point: do not use the allowance or deduction amounts that only take effect from YA 2026/27 when filing YA 2025/26. This is an easy and potentially expensive year-switching mistake."
      },
      {
        type: "paragraph",
        text:
          "The February 2026 Budget announced increases to the basic allowance, married person's allowance, child allowance, dependent parent or grandparent allowances, elderly residential care expenses, and other items."
      },
      {
        type: "paragraph",
        text:
          "However, the verified IRD PAM 61(e) table groups YA 2024/25 and YA 2025/26 in the same column, with YA 2026/27 and onwards shown separately. That means the increases do not change the YA 2025/26 computation."
      },
      { type: "heading", text: "What YA 2025/26 filers should do" },
      {
        type: "list",
        items: [
          "Use the YA 2025/26 parameters when filing or checking YA 2025/26 tax.",
          "Do not import YA 2026/27 allowance increases into YA 2025/26.",
          "If you want the exact new-year amounts, read IRD's official PAM 61(e) table directly."
        ]
      }
    ],
    sources: [
      {
        label: "IRD Allowances, Deductions and Tax Rate Table PAM 61(e)",
        url: "https://www.ird.gov.hk/eng/pdf/pam61e.pdf"
      }
    ],
    tags: ["2025/26", "2026/27", "allowances"]
  },
  {
    slug: "does-personal-assessment-save-you-money",
    kind: "article",
    publishedISO: "2026-08-31",
    reviewedISO: "2026-08-31",
    titleZh: "選擇個人入息課稅會否慳稅？",
    titleEn: "Does Personal Assessment save you money?",
    summaryZh:
      "個人入息課稅不一定較好。一般而言，只有在你有出租物業的按揭利息、業務虧損，或分開評稅令免稅額未能盡用時，才值得逐一比較。本網站的報稅精靈會自動比較各個合法選項。",
    summaryEn:
      "Personal Assessment is not always better. It is usually worth comparing where let-property mortgage interest, a business loss, or separate tax computations make your allowances less useful. This site's wizard compares the legal options automatically.",
    bodyZh: [
      {
        type: "paragraph",
        text:
          "個人入息課稅是一種選擇性的合併計稅方法。它並非要你多繳一種稅，而是把合資格的薪俸、物業及業務數字放在同一個計算方式下比較。"
      },
      { type: "heading", text: "通常會有幫助的情況" },
      {
        type: "list",
        items: [
          "你有出租物業，並就借款用以產生租金收入而支付利息；在物業稅下該利息不可扣除，但在個人入息課稅下則可獲扣除。",
          "你有業務虧損，希望在同一年度抵銷其他入息，而不是只留待日後同一業務有利潤時才使用。",
          "分開評稅令物業或業務入息按單一稅率或兩級制稅率課稅，但你的整體情況在合併計算後，可能受惠於免稅額及累進稅率。"
        ]
      },
      { type: "heading", text: "通常不會有幫助的情況" },
      {
        type: "paragraph",
        text:
          "如果你的稅款本身已主要按標準稅率或兩級制稅率計算，而你又沒有出租物業的按揭利息、業務虧損，或其他只在個人入息課稅下才發揮作用的因素，選擇個人入息課稅通常不會帶來好處。"
      },
      {
        type: "callout",
        text:
          "切勿單憑猜測。最穩妥的做法，是在報稅精靈輸入資料一次，讓系統自動比較所有合法選項，包括是否選擇個人入息課稅。"
      },
      {
        type: "paragraph",
        text:
          "本網站的計算結果頁會比較每個合法的評稅選擇，並以文字解釋為何該方案的稅款最低。你毋須自行逐個情境手動計算。"
      }
    ],
    bodyEn: [
      {
        type: "paragraph",
        text:
          "Personal Assessment is an elective way to aggregate your tax figures. It is not an extra tax; it is a different computation framework for eligible salary, property, and business figures."
      },
      { type: "heading", text: "When it often helps" },
      {
        type: "list",
        items: [
          "You have a let property with interest on money borrowed to produce the rental income; that interest is not deductible under Property Tax, but is deductible under Personal Assessment.",
          "You have a business loss and want it to offset other income in the same year, rather than only carrying it forward against future profits of the same business.",
          "Separate assessments leave property or business income taxed at a flat or two-tiered rate, while your combined position may benefit from allowances and the progressive rate."
        ]
      },
      { type: "heading", text: "When it usually does not help" },
      {
        type: "paragraph",
        text:
          "If you are already mainly paying at the standard or two-tiered rate, and you have no let-property mortgage interest, business loss, or other Personal-Assessment-specific advantage, electing Personal Assessment usually will not help."
      },
      {
        type: "callout",
        text:
          "Do not guess. The safer route is to enter your information once in the tax wizard and let it compare every legal option, including whether Personal Assessment should be elected."
      },
      {
        type: "paragraph",
        text:
          "This site's results page compares each legal assessment choice and explains in plain language why the lowest-tax option wins. You do not need to run the scenarios by hand."
      }
    ],
    sources: [
      {
        label: "GovHK Can Personal Assessment Reduce Your Tax Liability",
        url: "https://www.gov.hk/en/residents/taxes/salaries/personal/personalreduction/personalassessment.htm"
      }
    ],
    tags: ["Personal Assessment", "wizard", "tax planning"]
  },
  {
    slug: "whats-new-on-this-site",
    kind: "site-update",
    publishedISO: "2026-08-31",
    reviewedISO: "2026-08-31",
    titleZh: "本站新增功能：BIR60 草稿、慳稅檢查及手機版更新",
    titleEn: "What's new: BIR60 draft view, tax-saving checks, and mobile updates",
    summaryZh:
      "本站最近集中改善報稅流程本身：加入 BIR60 填報草稿視圖、在報稅精靈內加入慳稅檢查，並重新調整手機版介面。",
    summaryEn:
      "Recent site work focuses on the filing workflow itself: a BIR60 draft view, tax-saving checks inside the wizard, and a mobile-responsive interface refresh.",
    bodyZh: [
      {
        type: "paragraph",
        text:
          "今次網站更新集中在使用流程，而不是新增稅務規則。目標是讓你由輸入資料、比較結果，到整理報稅草稿的整個過程更為順暢。"
      },
      { type: "heading", text: "BIR60 填報草稿視圖" },
      {
        type: "paragraph",
        text:
          "完成報稅精靈後，結果頁可整理成 BIR60 相關欄位的草稿視圖，方便你對照自己的正式報稅表。"
      },
      { type: "heading", text: "報稅精靈內的慳稅檢查" },
      {
        type: "list",
        items: [
          "集中列出可能影響結果的扣除項目及免稅額。",
          "提示常見的資料遺漏位置。",
          "把不同評稅選擇的比較放在同一個結果流程內。"
        ]
      },
      { type: "heading", text: "手機版重新調整" },
      {
        type: "paragraph",
        text:
          "表單、結果卡及指南頁已重新調整間距與排列，讓手機畫面更容易閱讀及操作。"
      },
      {
        type: "callout",
        text:
          "本站仍然只是教育及計算輔助工具，不會代你向稅務局提交報稅表。"
      }
    ],
    bodyEn: [
      {
        type: "paragraph",
        text:
          "This update focuses on the product workflow, not on adding new tax rules. The aim is to make the path from data entry, to comparison, to filing draft easier to use."
      },
      { type: "heading", text: "BIR60 draft view" },
      {
        type: "paragraph",
        text:
          "After completing the tax wizard, the results can be organized into a BIR60-oriented draft view so you can cross-check against your official return."
      },
      { type: "heading", text: "Tax-saving checks inside the wizard" },
      {
        type: "list",
        items: [
          "Deduction and allowance checks are grouped where they affect the result.",
          "The flow highlights common places where information is missed.",
          "Assessment-choice comparisons stay inside the same results workflow."
        ]
      },
      { type: "heading", text: "Mobile-responsive refresh" },
      {
        type: "paragraph",
        text:
          "Forms, result cards, and guide pages have been adjusted for spacing and layout so they are easier to read and use on a phone."
      },
      {
        type: "callout",
        text:
          "This site remains an educational and calculation aid. It does not submit your tax return to the IRD for you."
      }
    ],
    tags: ["site update", "BIR60", "wizard", "mobile"]
  }
];

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => b.publishedISO.localeCompare(a.publishedISO));
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}
