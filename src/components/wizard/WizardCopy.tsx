"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useWizardText } from "./useWizardText";

// No extra DOM: static server pages keep their exact markup and route mode.
export function WizardCopy({ text }: { text: string }) {
  const w = useWizardText();
  return <>{w(text)}</>;
}
export function WizardLink(props: ComponentProps<typeof Link> & { "aria-label": string }) {
  const w = useWizardText();
  return <Link {...props} aria-label={w(props["aria-label"])} />;
}
