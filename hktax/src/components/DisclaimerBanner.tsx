"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { Container } from "./Container";

export function DisclaimerBanner() {
  const { t } = useI18n();

  return (
    <div className="border-b border-gold-700/20 bg-gold-100 text-xs font-semibold leading-snug text-navy-950 sm:text-sm">
      <Container className="py-2">
        <p className="m-0">{t("disclaimer.banner")}</p>
      </Container>
    </div>
  );
}
