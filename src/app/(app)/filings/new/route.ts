import { NextResponse } from "next/server";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { env } from "@/lib/env";
import { findOrCreateDraftFiling } from "@/lib/findOrCreateDraft";

export const runtime = "nodejs";

// Route handler (not a Page) because Server Components can't set cookies.
// Creates or reuses a DRAFT filing for this session/user and redirects to
// the wizard. Anonymous customers can start with no auth. Reuse logic lives
// in `findOrCreateDraftFiling` and is shared with `POST /api/filings` and
// `POST /api/auth/google` so refresh, back-button, and multiple entry points
// all collapse onto the same draft instead of creating duplicates.
export async function GET() {
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();
  const { filing } = await findOrCreateDraftFiling({
    sessionId,
    userId: user?.id ?? null,
  });
  return NextResponse.redirect(`${env.appUrl}/filings/${filing.id}/edit`);
}
