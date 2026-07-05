"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSignedIn } from "@/components/useSignedIn";

// Client island for the marketing header's auth cluster. Renders the signed-out
// state (Sign in + Start filing) as the default so the static, edge-cached page
// paints instantly, then swaps to "My filings" for a confirmed logged-in visitor
// once /api/me resolves. Keeping this out of the server layout is what lets the
// whole marketing shell be statically generated.
export function HeaderAuthButtons() {
  const signedIn = useSignedIn();

  if (signedIn) {
    return (
      <Link href="/dashboard">
        <Button size="sm">My filings</Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/sign-in" className="hidden sm:inline-flex">
        <Button variant="ghost" size="sm">Sign in</Button>
      </Link>
      <Link href="/start">
        <Button size="sm">Start filing</Button>
      </Link>
    </>
  );
}
