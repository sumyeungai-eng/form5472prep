"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useSignedIn } from "@/components/useSignedIn";
import { startHref } from "@/lib/attribution";

// Client island for the marketing header's auth cluster. Renders the signed-out
// state (Sign in + Start filing) as the default so the static, edge-cached page
// paints instantly, then swaps to "My filings" for a confirmed logged-in visitor
// once /api/me resolves. Keeping this out of the server layout is what lets the
// whole marketing shell be statically generated.
//
// The three <Button> elements are rendered by the SERVER layout and passed in
// as props. Importing <Button> here would pull its `cn()` helper (clsx +
// tailwind-merge, ~9 KB gzipped) into the JavaScript every marketing page runs
// before first paint — this island is the only client consumer of it on those
// pages. Same component, same props, so the markup is unchanged.
export function HeaderAuthButtons({
  signInButton,
  startButton,
  dashboardButton,
}: {
  /** `<Button variant="ghost" size="sm">Sign in</Button>` */
  signInButton: ReactNode;
  /** `<Button size="sm">Start filing</Button>` */
  startButton: ReactNode;
  /** `<Button size="sm">My filings</Button>` */
  dashboardButton: ReactNode;
}) {
  const signedIn = useSignedIn();
  const [startLinkHref, setStartLinkHref] = useState("/start");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStartLinkHref(startHref());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (signedIn) {
    return <Link href="/dashboard">{dashboardButton}</Link>;
  }

  return (
    <>
      <Link href="/sign-in" className="hidden sm:inline-flex">
        {signInButton}
      </Link>
      <Link href={startLinkHref}>{startButton}</Link>
    </>
  );
}
