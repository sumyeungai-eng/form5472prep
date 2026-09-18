// Message body posted to a filing's thread when a customer uses the
// "This doesn't match my situation" escape hatch on the tax-years step.
// The fixed sentence is unchanged from the original one-click version so
// old and new messages read alike in the thread; the optional note the
// customer can now attach is appended after it.

export const FLAG_NOTE_MAX = 500;

/** Body posted to the filing thread when a customer flags a determination. */
export function buildFlagMessage(shownSentence: string, note?: string | null): string {
  const prefix =
    "Customer flagged from the tax-years step: the late/timely determination shown does not match their situation. Shown: " +
    shownSentence;

  if (!note) return prefix;
  const trimmed = note.trim();
  if (!trimmed) return prefix;

  // Collapse 3+ newlines to 2 before truncating, so a long run of blank
  // lines can't eat most of the character budget.
  const collapsed = trimmed.replace(/\n{3,}/g, "\n\n");
  const truncated = collapsed.slice(0, FLAG_NOTE_MAX);

  return `${prefix}\nThey added: ${truncated}`;
}
