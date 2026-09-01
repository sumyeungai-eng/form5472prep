import type { Language } from "@/lib/i18n/dictionary";

type LocalizedString = Record<Language, string>;

export type ContactKind = "contact" | "feedback";
export type ContactErrorCode =
  | "method"
  | "invalid"
  | "spam"
  | "rate_limited"
  | "send_failed";

export const contactDictionary = {
  nameLabel: {
    zh: "姓名（選填）",
    en: "Name (optional)"
  },
  namePlaceholder: {
    zh: "你的姓名",
    en: "Your name"
  },
  emailLabel: {
    zh: "電郵（選填，用於回覆）",
    en: "Email (optional, for a reply)"
  },
  emailPlaceholder: {
    zh: "you@example.com",
    en: "you@example.com"
  },
  contactSubjectLabel: {
    zh: "主題",
    en: "Subject"
  },
  feedbackSubjectLabel: {
    zh: "建議類別",
    en: "Feedback category"
  },
  messageLabel: {
    zh: "訊息",
    en: "Message"
  },
  messagePlaceholder: {
    zh: "請寫下你想查詢或建議的內容。",
    en: "Write your question or suggestion."
  },
  characterCounterLabel: {
    zh: "字數",
    en: "Characters"
  },
  submitLabel: {
    zh: "送出",
    en: "Send"
  },
  sendingLabel: {
    zh: "傳送中...",
    en: "Sending..."
  },
  successMessage: {
    zh: "已收到你的訊息，謝謝。",
    en: "Your message has been sent. Thank you."
  },
  errorMethod: {
    zh: "提交方式不正確，請重新整理頁面後再試。",
    en: "The submission method was not accepted. Please refresh and try again."
  },
  errorInvalid: {
    zh: "請檢查必填欄位和電郵格式後再試。",
    en: "Please check the required fields and email format, then try again."
  },
  errorSpam: {
    zh: "提交未能通過防濫用檢查，請稍後再試。",
    en: "The submission did not pass the anti-abuse checks. Please try again later."
  },
  errorRateLimited: {
    zh: "提交太頻密，請稍等片刻再試。",
    en: "You are submitting too quickly. Please wait a moment and try again."
  },
  errorSendFailed: {
    zh: "訊息暫時未能送出，請稍後再試。",
    en: "The message could not be sent right now. Please try again later."
  },
  errorGeneric: {
    zh: "未能完成提交。若你正在本機預覽靜態網站，PHP 端點可能尚未啟用。",
    en: "The submission could not be completed. If you are previewing the static site locally, the PHP endpoint may not be running."
  },
  contactSubjectGeneral: {
    zh: "一般查詢",
    en: "General enquiry"
  },
  contactSubjectTaxQuestion: {
    zh: "稅務問題",
    en: "Tax question"
  },
  contactSubjectTechnical: {
    zh: "技術問題",
    en: "Technical issue"
  },
  contactSubjectPrivacy: {
    zh: "私隱問題",
    en: "Privacy question"
  },
  contactSubjectOther: {
    zh: "其他",
    en: "Other"
  },
  feedbackCategoryBug: {
    zh: "錯誤回報",
    en: "Bug report"
  },
  feedbackCategoryCalculation: {
    zh: "計算結果有疑問",
    en: "Calculation query"
  },
  feedbackCategoryUi: {
    zh: "介面建議",
    en: "UI suggestion"
  },
  feedbackCategoryContent: {
    zh: "內容建議",
    en: "Content suggestion"
  },
  feedbackCategoryOther: {
    zh: "其他",
    en: "Other"
  },
  honeypotLabel: {
    zh: "網站",
    en: "Website"
  }
} as const satisfies Record<string, LocalizedString>;

export type ContactDictionaryKey = keyof typeof contactDictionary;

export type ContactSubjectValue =
  | "general"
  | "tax-question"
  | "technical"
  | "privacy"
  | "other";

export type FeedbackCategoryValue =
  | "bug"
  | "calculation"
  | "ui"
  | "content"
  | "other";

type ContactOption<Value extends string> = {
  value: Value;
  labelKey: ContactDictionaryKey;
};

export const contactSubjectOptions = [
  { value: "general", labelKey: "contactSubjectGeneral" },
  { value: "tax-question", labelKey: "contactSubjectTaxQuestion" },
  { value: "technical", labelKey: "contactSubjectTechnical" },
  { value: "privacy", labelKey: "contactSubjectPrivacy" },
  { value: "other", labelKey: "contactSubjectOther" }
] as const satisfies ReadonlyArray<ContactOption<ContactSubjectValue>>;

export const feedbackCategoryOptions = [
  { value: "bug", labelKey: "feedbackCategoryBug" },
  { value: "calculation", labelKey: "feedbackCategoryCalculation" },
  { value: "ui", labelKey: "feedbackCategoryUi" },
  { value: "content", labelKey: "feedbackCategoryContent" },
  { value: "other", labelKey: "feedbackCategoryOther" }
] as const satisfies ReadonlyArray<ContactOption<FeedbackCategoryValue>>;
