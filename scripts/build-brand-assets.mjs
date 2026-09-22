import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
const navy = "#1e3a8a";
const white = "#ffffff";

async function writePng(name, input, options = {}) {
  await sharp(input, options).png().toFile(path.join(brandDir, name));
}

function documentMarkSvg({ x, y, width, fill, accent, textFill, label = "5472" }) {
  const scale = width / 64;
  const points = [
    `<path d="M10 6 H42 L58 22 V58 H10 Z" fill="${fill}"/>`,
    `<path d="M42 6 V22 H58" fill="none" stroke="${accent}" stroke-width="2" stroke-linejoin="round" opacity="0.55"/>`,
    `<text x="34" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="16" letter-spacing="0.5" fill="${textFill}">${label}</text>`,
  ];
  return `<g transform="translate(${x} ${y}) scale(${scale})">${points.join("")}</g>`;
}

function productSvg({ title, subtitle, markLabel = "5472" }) {
  const subtitleText = subtitle
    ? `<text x="600" y="884" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="500" fill="${white}" opacity="0.92">${subtitle}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="${navy}"/>
  ${documentMarkSvg({ x: 408, y: 190, width: 384, fill: white, accent: navy, textFill: navy, label: markLabel })}
  <text x="600" y="770" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="${white}">${title}</text>
  ${subtitleText}
</svg>`;
}

await mkdir(brandDir, { recursive: true });

const logoSvg = await readFile(path.join(root, "public", "logo.svg"));
await sharp(logoSvg, { density: 1200 })
  .resize({ width: 1200 })
  .png()
  .toFile(path.join(brandDir, "checkout-logo.png"));

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${navy}"/>
  ${documentMarkSvg({ x: 104, y: 80, width: 304, fill: white, accent: navy, textFill: navy })}
</svg>`;
await writePng("checkout-icon.png", Buffer.from(iconSvg));

await writePng(
  "product-5472.png",
  Buffer.from(
    productSvg({
      title: "Form 5472 + pro forma 1120",
      subtitle: "Prepared, reviewed and faxed to the IRS",
    }),
  ),
);

await writePng(
  "product-ein-itin.png",
  Buffer.from(
    productSvg({
      title: "EIN / ITIN application",
      // ITIN (Form W-7) needs the applicant's own signature or an acceptance agent, so this card
      // must not claim that we submit it; EIN and ITIN share one card.
      subtitle: "Prepared and reviewed for you",
      markLabel: "EIN",
    }),
  ),
);

console.log(`Wrote PNG brand assets to ${path.relative(root, brandDir)}`);
