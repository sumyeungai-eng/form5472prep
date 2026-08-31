"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { Container } from "./Container";

export function DisclaimerBanner() {
  const { t } = useI18n();

  return (
    <div className="bg-gold text-sm font-medium text-navy-900">
      <Container className="py-2">
        <p>{t("disclaimer.banner")}</p>
      </Container>
    </div>
  );
}
