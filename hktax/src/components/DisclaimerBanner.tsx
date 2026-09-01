"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { Container } from "./Container";

export function DisclaimerBanner() {
  const { t } = useI18n();

  return (
    <div className="bg-gold text-xs font-medium leading-snug text-navy-900 sm:text-sm">
      <Container className="py-1.5 sm:py-2">
        <p className="m-0">{t("disclaimer.banner")}</p>
      </Container>
    </div>
  );
}
