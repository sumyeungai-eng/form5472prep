"use client";

import { useEffect } from "react";
import { rememberSrc, sanitizeSrc } from "@/lib/attribution";

export function AttributionSeed({ src }: { src: string }) {
  useEffect(() => {
    rememberSrc(sanitizeSrc(src)!);
  }, [src]);

  return null;
}
