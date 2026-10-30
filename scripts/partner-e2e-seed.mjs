// Partner white-label local E2E: seeds a test partner + an intake and a sign
// filing into a LOCAL Postgres only, and prints the portal invite links.
//   node scripts/partner-e2e-seed.mjs   (with .env.development.local pointing at it)
// See docs/sessions/2026-10-30-partner-white-label-p1.md for the full recipe.
import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const WT = process.cwd(); // run from the repo root
const URL_ = "postgresql://postgres:localpw@localhost:54329/f5472";
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== URL_) throw new Error("refusing: not the local test DB");
process.env.DATABASE_URL = URL_;

const require = createRequire(path.join(WT, "package.json"));
const { PrismaClient } = require("@prisma/client");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const prisma = new PrismaClient({ datasources: { db: { url: URL_ } } });

const token = () => crypto.randomBytes(32).toString("base64url");
const hash = (t) => crypto.createHash("sha256").update(t).digest("hex");
const in14d = new Date(Date.now() + 14 * 864e5);

const partner = await prisma.partner.upsert({
  where: { email: "desk@acme.test" },
  update: {},
  create: { email: "desk@acme.test", name: "Pat Partner", company: "Acme Formations LLC", brandName: "Acme Formations", active: true },
});
const client = await prisma.user.upsert({ where: { email: "client@example.test" }, update: {}, create: { email: "client@example.test" } });

const editTok = token();
const intake = await prisma.filing.create({
  data: {
    tier: "standard", status: "DRAFT", partnerId: partner.id, userId: client.id, funnelSource: "partner",
    llcName: "Rio Holdings LLC", ownerName: "Maria Silva",
    inviteTokenHash: hash(editTok), inviteScope: "edit", inviteEmail: client.email, inviteExpiresAt: in14d, inviteCreatedAt: new Date(),
  },
});

const signTok = token();
const sign = await prisma.filing.create({
  data: {
    tier: "standard", status: "PDF_GENERATED", partnerId: partner.id, userId: client.id, funnelSource: "partner",
    llcName: "Rio Holdings LLC", ownerName: "Maria Silva", amountPaid: 14900, reviewApprovedAt: new Date(),
    inviteTokenHash: hash(signTok), inviteScope: "sign", inviteEmail: client.email, inviteExpiresAt: in14d, inviteCreatedAt: new Date(),
  },
});
const doc = await PDFDocument.create({ updateMetadata: false });
doc.setTitle("Form 5472 – Rio Holdings LLC – 2025");
doc.setProducer("generator test");
doc.setCreator("generator test");
const page = doc.addPage([612, 792]);
page.drawText("Test package for Rio Holdings LLC (local E2E)", { x: 72, y: 700, size: 14, font: await doc.embedFont(StandardFonts.Helvetica) });
const key = `${sign.id}_unsigned.pdf`;
fs.mkdirSync(path.join(WT, "tmp-pdfs"), { recursive: true });
fs.writeFileSync(path.join(WT, "tmp-pdfs", key), await doc.save());
await prisma.filing.update({ where: { id: sign.id }, data: { generatedPdfKey: key } });

console.log(JSON.stringify({
  partnerId: partner.id, clientEmail: client.email, intakeId: intake.id, signId: sign.id,
  intakeInvite: `http://portal.localhost:3011/invite/${editTok}`,
  signInvite: `http://portal.localhost:3011/invite/${signTok}`,
  signInviteMainHost: `http://localhost:3011/invite/${signTok}`,
}, null, 2));
await prisma.$disconnect();
