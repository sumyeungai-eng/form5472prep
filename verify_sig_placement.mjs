import { PDFDocument, rgb } from "pdf-lib";
import fs from "node:fs/promises";

const SIG_PLACEMENT = {
  f1120_2024: { x: 144, y: 73, width: 200, height: 18 },
  f1120_2025: { x: 144, y: 88, width: 200, height: 18 },
};

async function annotate(srcPath, dstPath, rect) {
  const bytes = await fs.readFile(srcPath);
  const pdf = await PDFDocument.load(bytes);
  const page = pdf.getPage(0);
  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    color: rgb(1, 0.5, 0.5),
    opacity: 0.45,
    borderColor: rgb(0.7, 0, 0),
    borderWidth: 1.5,
    borderOpacity: 1,
  });
  await fs.writeFile(dstPath, await pdf.save());
  console.log(`Wrote ${dstPath}  (rect: x=${rect.x} y=${rect.y} w=${rect.width} h=${rect.height})`);
}

const outDir = "/Users/sumyeung/Library/Mobile Documents/com~apple~CloudDocs/Claude";
await annotate("public/forms/f1120--2024.pdf", `${outDir}/f1120_2024_sigtest.pdf`, SIG_PLACEMENT.f1120_2024);
await annotate("public/forms/f1120--2025.pdf", `${outDir}/f1120_2025_sigtest.pdf`, SIG_PLACEMENT.f1120_2025);
