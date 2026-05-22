// Verifies the Postgres trigger that blocks DELETE on Message:
//   (1) A bare deleteMany should fail with the check_violation error.
//   (2) A deleteMany inside a transaction that sets the override flag
//       should succeed.
// Cleans up after itself so the test is repeatable.
import { prisma } from "../src/lib/prisma";

async function main() {
  // Make a throwaway DRAFT filing + a message hanging off it.
  const filing = await prisma.filing.create({
    data: { status: "DRAFT", tier: "single_year", taxYears: [], amountPaid: 0 },
  });
  const message = await prisma.message.create({
    data: { filingId: filing.id, fromAdmin: true, body: "[trigger-test] should not be deletable" },
  });
  console.log(`[setup] filing=${filing.id} message=${message.id}`);

  // (1) Bare delete — expected to FAIL with check_violation.
  let blocked = false;
  try {
    await prisma.message.delete({ where: { id: message.id } });
    console.log("[unexpected] bare delete SUCCEEDED — trigger is not active!");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("blocked") || msg.includes("check_violation") || msg.includes("23514")) {
      blocked = true;
      console.log("[ok] bare delete was blocked by trigger");
    } else {
      console.log("[err] bare delete failed with unexpected error:", msg.slice(0, 200));
    }
  }

  // (2) Delete with the override flag inside a transaction — expected to SUCCEED.
  let overrideWorked = false;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL form5472.allow_message_delete = 'true'`);
      await tx.message.delete({ where: { id: message.id } });
    });
    overrideWorked = true;
    console.log("[ok] delete with override flag SUCCEEDED");
  } catch (err) {
    console.log("[err] override delete failed:", err instanceof Error ? err.message : String(err));
  }

  // Cleanup the throwaway filing (uses cascade through the DRAFT delete route's
  // session-flag pattern just in case the message wasn't deleted).
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL form5472.allow_message_delete = 'true'`);
      await tx.filing.delete({ where: { id: filing.id } });
    });
    console.log("[cleanup] throwaway filing deleted");
  } catch (err) {
    console.log("[cleanup err]", err instanceof Error ? err.message : String(err));
  }

  console.log("---");
  console.log(`bare delete blocked: ${blocked ? "✓" : "✗"}`);
  console.log(`override flag works: ${overrideWorked ? "✓" : "✗"}`);
  process.exit(blocked && overrideWorked ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
