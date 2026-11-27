import { I18N_ENABLED } from "@/config/i18n-switch.mjs";

// Preserve browser defaults while translations are enabled.
export function browserFormattingLocale(): "en-US" | undefined {
  return I18N_ENABLED ? undefined : "en-US";
}
