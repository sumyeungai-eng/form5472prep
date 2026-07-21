import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public/ads/meta/source");
const outputDir = path.join(root, "public/ads/meta/final");

const concepts = [
  {
    slug: "qualification",
    source: "qualification.png",
    dark: false,
    title: ["Form 5472 filing", "for foreign-owned U.S.", "single-member LLCs"],
    subtitle: ["Prepared, reviewed and", "faxed to the IRS"],
    badge: "FROM $199",
    footer: "ACCOUNTANT-REVIEWED  •  IRS FAX INCLUDED",
  },
  {
    slug: "workflow",
    source: "workflow.png",
    dark: true,
    title: ["Every required form.", "One online workflow."],
    subtitle: ["Form 5472 + pro forma 1120", "with a timestamped fax receipt"],
    badge: "START FROM $199",
    footer: "PREPARE  •  SIGN  •  REVIEW  •  FAX",
  },
  {
    slug: "late-filing",
    source: "late-filing.png",
    dark: false,
    title: ["Missed the April 15", "filing deadline?"],
    subtitle: ["Late Form 5472 filing help for", "foreign-owned U.S. single-member", "LLCs"],
    badge: "START FILING",
    footer: "ACCOUNTANT-REVIEWED  •  NO SUBSCRIPTION",
  },
];

const formats = [
  { slug: "feed", width: 1080, height: 1350 },
  { slug: "square", width: 1080, height: 1080 },
  { slug: "story", width: 1080, height: 1920 },
];

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function svgOverlay(concept, format) {
  const { width, height, slug } = format;
  const isStory = slug === "story";
  const isSquare = slug === "square";
  const left = isStory ? 78 : 68;
  const top = isStory ? 250 : isSquare ? 180 : 150;
  const titleSize = isStory ? 76 : isSquare ? 60 : 64;
  const lineHeight = Math.round(titleSize * 1.06);
  const subtitleSize = isStory ? 36 : 30;
  const titleColor = concept.dark ? "#ffffff" : "#0f172a";
  const subtitleColor = concept.dark ? "#dbeafe" : "#334155";
  const footerColor = concept.dark ? "#bfdbfe" : "#1e3a8a";
  const logoPrimary = concept.dark ? "#ffffff" : "#0f172a";
  const logoAccent = concept.dark ? "#93c5fd" : "#1e3a8a";
  const titleLines = concept.title
    .map((line, index) => `<tspan x="${left}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  const titleBottom = top + lineHeight * (concept.title.length - 1);
  const subtitleTop = titleBottom + (isStory ? 88 : 70);
  const subtitleLines = concept.subtitle
    .map((line, index) => `<tspan x="${left}" dy="${index === 0 ? 0 : Math.round(subtitleSize * 1.35)}">${escapeXml(line)}</tspan>`)
    .join("");
  const badgeY = subtitleTop + subtitleSize * concept.subtitle.length + (isStory ? 72 : 58);
  const badgeWidth = isStory ? 330 : 286;
  const badgeHeight = isStory ? 76 : 66;
  const logoY = isStory ? 122 : 58;
  const footerY = height - (isStory ? 126 : 62);
  const gradient = concept.dark
    ? `<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#020617" stop-opacity="0.72"/><stop offset="0.62" stop-color="#020617" stop-opacity="0.08"/><stop offset="1" stop-color="#020617" stop-opacity="0"/></linearGradient>`
    : `<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.92"/><stop offset="0.64" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`;

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>${gradient}</defs>
      <rect width="${width}" height="${height}" fill="url(#shade)"/>
      <g transform="translate(${left} ${logoY})">
        <rect width="44" height="44" rx="7" fill="#1e3a8a"/>
        <text x="22" y="28" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="800" fill="#ffffff">5472</text>
        <text x="58" y="31" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="750" fill="${logoPrimary}">Form<tspan fill="${logoAccent}">5472</tspan><tspan dx="5" fill="${logoPrimary}">Prep</tspan></text>
      </g>
      <text x="${left}" y="${top}" font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="760" letter-spacing="-1.8" fill="${titleColor}">${titleLines}</text>
      <text x="${left}" y="${subtitleTop}" font-family="Arial,Helvetica,sans-serif" font-size="${subtitleSize}" font-weight="450" fill="${subtitleColor}">${subtitleLines}</text>
      <rect x="${left}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="#1e3a8a"/>
      <text x="${left + badgeWidth / 2}" y="${badgeY + badgeHeight * 0.66}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${isStory ? 27 : 24}" font-weight="750" letter-spacing="1" fill="#ffffff">${escapeXml(concept.badge)}</text>
      <text x="${left}" y="${footerY}" font-family="Arial,Helvetica,sans-serif" font-size="${isStory ? 24 : 19}" font-weight="700" letter-spacing="1.4" fill="${footerColor}">${escapeXml(concept.footer)}</text>
    </svg>
  `);
}

await fs.mkdir(outputDir, { recursive: true });

for (const concept of concepts) {
  const input = path.join(sourceDir, concept.source);
  for (const format of formats) {
    const output = path.join(outputDir, `${concept.slug}-${format.slug}.jpg`);
    await sharp(input)
      .resize(format.width, format.height, { fit: "cover", position: "center" })
      .composite([{ input: svgOverlay(concept, format), blend: "over" }])
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(output);
    console.log(path.relative(root, output));
  }
}
