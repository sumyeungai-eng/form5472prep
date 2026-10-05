// Renders one hero illustration per /services/* page.
//
//   node scripts/render-service-artwork.mjs [slug ...]
//
// Output: public/services/services_<slug>_<descriptor>.webp, 1280x720. The
// file name carries the page's keyword words on purpose (image SEO), and each
// page gets its own composition so no two pages share an image.
//
// Same editorial palette as scripts/render-blog-artwork.mjs (cream ground,
// navy paper furniture, one accent per page). Deliberately free of claims:
// the only text on any image is a generic form label ("5472" / "1120"); no
// IRS logo or seal is drawn.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1280;
const H = 720;
const OUT = path.join(process.cwd(), "public", "services");

const C = {
  cream: "#EFE7DA",
  creamDeep: "#E4D9C7",
  navy: "#1E2A44",
  navySoft: "#2C3E63",
  paper: "#FCFAF6",
  rule: "#C9CEDA",
  ruleDark: "#9AA3B6",
  green: "#3F5D4C",
  amber: "#B4762F",
  clay: "#9C5240",
  teal: "#2F5E63",
};

// ---- primitives ----------------------------------------------------------

const shadow = (id, dy = 18, blur = 22, op = 0.16) => `
  <filter id="${id}" x="-30%" y="-30%" width="160%" height="180%">
    <feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="#1E2A44" flood-opacity="${op}"/>
  </filter>`;

/** Grey text ruling inside a w x h box (no outer shape). */
function ruling(w, h, { lines = 8, pad = w * 0.1, top = 0 } = {}) {
  const step = (h - top - pad) / (lines + 1);
  let rows = "";
  for (let i = 0; i < lines; i++) {
    const lw = (w - pad * 2) * (i % 3 === 2 ? 0.55 : 0.9);
    rows += `<rect x="${pad}" y="${top + step * (i + 1)}" width="${lw}" height="9" rx="4.5" fill="${C.rule}"/>`;
  }
  return rows;
}

/** A paper sheet. */
function sheet({ x, y, w, h, rotate = 0, lines = 8, filter = "url(#soft)", top = 40 }) {
  return `
  <g transform="translate(${x} ${y}) rotate(${rotate})" filter="${filter}">
    <rect width="${w}" height="${h}" rx="10" fill="${C.paper}"/>
    ${ruling(w, h, { lines, top })}
  </g>`;
}

/** A form card: coloured header band with a generic form label, field boxes, rules. */
function formCard({ x, y, w, h, label, accent, rotate = 0, filter = "url(#deep)", boxes = true }) {
  const bar = 76;
  const pad = w * 0.09;
  const boxRow = boxes
    ? `<g transform="translate(${pad} ${bar + 26})">
         <rect width="${(w - pad * 2) * 0.46}" height="40" rx="6" fill="none" stroke="${C.ruleDark}" stroke-width="3"/>
         <rect x="${(w - pad * 2) * 0.54}" width="${(w - pad * 2) * 0.46}" height="40" rx="6" fill="none" stroke="${C.ruleDark}" stroke-width="3"/>
       </g>`
    : "";
  return `
  <g transform="translate(${x} ${y}) rotate(${rotate})" filter="${filter}">
    <rect width="${w}" height="${h}" rx="12" fill="${C.paper}"/>
    <path d="M0 12a12 12 0 0 1 12-12H${w - 12}a12 12 0 0 1 12 12V${bar}H0z" fill="${accent}"/>
    <text x="${pad}" y="${bar - 22}" fill="#fff" font-family="Arial, sans-serif" font-size="40" font-weight="700" letter-spacing="2">${label}</text>
    <rect x="${w - pad - 70}" y="26" width="70" height="26" rx="13" fill="#fff" opacity="0.25"/>
    ${boxRow}
    ${ruling(w, h, { lines: Math.max(4, Math.floor((h - bar - 110) / 46)), top: bar + (boxes ? 84 : 20) })}
  </g>`;
}

function badgeCheck({ cx, cy, r = 62, fill = C.green }) {
  return `<g transform="translate(${cx} ${cy})" filter="url(#soft)">
    <circle r="${r}" fill="${fill}"/>
    <circle r="${r - 9}" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>
    <path d="M${-r * 0.36} ${r * 0.02}l${r * 0.24} ${r * 0.28} ${r * 0.5} ${-r * 0.56}" stroke="#fff" stroke-width="${r * 0.16}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

/** Closed folder with a tab, front flap and a label strip. */
function folder({ x, y, w, h, fill, flap, rotate = 0, filter = "url(#soft)", label = true }) {
  const tabW = w * 0.34;
  return `
  <g transform="translate(${x} ${y}) rotate(${rotate})" filter="${filter}">
    <path d="M0 14a14 14 0 0 1 14-14H${tabW - 14}l22 24H${w - 14}a14 14 0 0 1 14 14V${h - 14}a14 14 0 0 1-14 14H14a14 14 0 0 1-14-14z" fill="${fill}"/>
    <rect y="${h * 0.22}" width="${w}" height="${h * 0.78}" rx="14" fill="${flap}"/>
    ${label ? `<rect x="${w * 0.08}" y="${h * 0.36}" width="${w * 0.3}" height="14" rx="7" fill="#fff" opacity="0.7"/>
    <rect x="${w * 0.08}" y="${h * 0.36 + 28}" width="${w * 0.2}" height="10" rx="5" fill="#fff" opacity="0.4"/>` : ""}
  </g>`;
}

/** Overlapping clasp-rings: a "linked" mark for partner pairs. */
function link({ cx, cy, r = 44, stroke = C.navy, sw = 14 }) {
  return `<g transform="translate(${cx} ${cy})" filter="url(#soft)">
    <circle cx="${-r * 0.55}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
    <circle cx="${r * 0.55}" r="${r}" fill="none" stroke="${C.amber}" stroke-width="${sw}"/>
  </g>`;
}

function globe({ cx, cy, r, stroke = C.navy, fill = "#DDE5EE" }) {
  const sw = 6;
  const lat = [-0.55, -0.2, 0.2, 0.55]
    .map((k) => {
      const dy = r * k;
      const half = Math.sqrt(r * r - dy * dy);
      return `<path d="M${-half} ${dy}H${half}" stroke="${stroke}" stroke-width="${sw - 2}" opacity="0.7"/>`;
    })
    .join("");
  return `<g transform="translate(${cx} ${cy})" filter="url(#deep)">
    <circle r="${r}" fill="${fill}"/>
    <g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" clip-path="url(#gclip)">
      <ellipse rx="${r * 0.42}" ry="${r}"/>
      <ellipse rx="${r * 0.78}" ry="${r}"/>
      <path d="M0 ${-r}V${r}"/>
      ${lat}
    </g>
    <circle r="${r}" fill="none" stroke="${stroke}" stroke-width="${sw + 2}"/>
    <path d="M${-r * 0.5} ${-r * 0.35}q${r * 0.2} ${-r * 0.2} ${r * 0.45} ${-r * 0.05}t${r * 0.2} ${r * 0.3}q${-r * 0.3} ${r * 0.1} ${-r * 0.4} ${r * 0.28}q${-r * 0.3} ${-r * 0.1} ${-r * 0.25} ${-r * 0.53}z" fill="${C.green}" opacity="0.55"/>
  </g>`;
}

// ---- scenes (each returns SVG body drawn on the shared ground) ------------

const SCENES = {
  // Main service: a clean form with a confirmation badge.
  "form-and-checkmark": (a) => `
    ${sheet({ x: 560, y: 150, w: 400, h: 470, rotate: 5, lines: 9 })}
    ${formCard({ x: 330, y: 96, w: 460, h: 540, label: "5472", accent: a, rotate: -3 })}
    ${badgeCheck({ cx: 836, cy: 524, r: 78 })}
    <rect x="880" y="176" width="190" height="16" rx="8" fill="${a}" opacity="0.5"/>
    <rect x="880" y="212" width="130" height="12" rx="6" fill="${C.ruleDark}" opacity="0.6"/>`,

  // Pro forma 1120: the two forms filed together.
  "form-pair": (a) => `
    ${formCard({ x: 230, y: 130, w: 400, h: 500, label: "1120", accent: C.navy, rotate: -5 })}
    ${formCard({ x: 600, y: 96, w: 400, h: 500, label: "5472", accent: a, rotate: 4 })}
    <g transform="translate(600 120) rotate(4)" filter="url(#soft)">
      <path d="M-30 80v-70a22 22 0 0 1 44 0v90a14 14 0 0 1-28 0V30" fill="none" stroke="${C.ruleDark}" stroke-width="8" stroke-linecap="round" transform="translate(-6 -30)"/>
    </g>
    <rect x="440" y="650" width="400" height="14" rx="7" fill="${C.navy}" opacity="0.12"/>`,

  // Late filing: stacked year folders, each offset, with a clock.
  "past-year-returns": (a) => `
    ${folder({ x: 260, y: 150, w: 560, h: 300, fill: C.ruleDark, flap: "#B7BFD0", rotate: -2, filter: "url(#soft)", label: false })}
    ${folder({ x: 300, y: 214, w: 560, h: 300, fill: C.navySoft, flap: C.navy, rotate: 0, label: false })}
    ${folder({ x: 340, y: 282, w: 560, h: 300, fill: a, flap: "#C58A43", rotate: 1.5, filter: "url(#deep)" })}
    <g transform="translate(990 232)" filter="url(#deep)">
      <circle r="100" fill="${C.paper}"/>
      <circle r="100" fill="none" stroke="${C.navy}" stroke-width="12"/>
      ${[0, 90, 180, 270].map((d) => `<rect x="-4" y="-88" width="8" height="18" rx="4" fill="${C.ruleDark}" transform="rotate(${d})"/>`).join("")}
      <path d="M0 0V-58M0 0L40 24" stroke="${C.navy}" stroke-width="10" stroke-linecap="round"/>
      <circle r="9" fill="${a}"/>
    </g>`,

  // Foreign-owned LLC: a globe beside a form.
  "globe-and-form": (a) => `
    <clipPath id="gclip"><circle r="150"/></clipPath>
    ${globe({ cx: 420, cy: 372, r: 150 })}
    <path d="M410 372C520 260 600 250 700 300" stroke="${a}" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round" fill="none"/>
    <circle cx="700" cy="300" r="11" fill="${a}"/>
    ${formCard({ x: 700, y: 120, w: 400, h: 500, label: "5472", accent: a, rotate: 3 })}
    <rect x="130" y="580" width="260" height="14" rx="7" fill="${C.navy}" opacity="0.1"/>`,

  // Fax: machine with a page feeding through, plus a confirmation receipt.
  "fax-machine-receipt": (a) => `
    ${sheet({ x: 380, y: 78, w: 300, h: 250, rotate: -3, lines: 6, top: 30 })}
    <g filter="url(#deep)">
      <rect x="250" y="270" width="620" height="290" rx="26" fill="${C.navy}"/>
      <rect x="250" y="270" width="620" height="60" rx="26" fill="${C.navySoft}"/>
      <rect x="250" y="304" width="620" height="26" fill="${C.navySoft}"/>
      <rect x="296" y="360" width="190" height="76" rx="10" fill="#CFE3D8"/>
      <rect x="316" y="384" width="120" height="12" rx="6" fill="${C.green}" opacity="0.7"/>
      <rect x="316" y="408" width="80" height="10" rx="5" fill="${C.green}" opacity="0.45"/>
      ${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => `<rect x="${540 + c * 62}" y="${358 + r * 34}" width="46" height="24" rx="7" fill="${C.navySoft}" stroke="#4B5D86" stroke-width="2"/>`)).join("")}
      <rect x="296" y="462" width="528" height="12" rx="6" fill="#0F1A30"/>
      <circle cx="${796}" cy="${312}" r="9" fill="${a}"/>
    </g>
    <g transform="translate(940 180) rotate(5)" filter="url(#soft)">
      <path d="M0 0H210V340l-17.5 -14-17.5 14-17.5-14-17.5 14-17.5-14-17.5 14-17.5-14-17.5 14-17.5-14-17.5 14-17.5-14L0 340z" fill="${C.paper}"/>
      <rect x="30" y="34" width="110" height="14" rx="7" fill="${C.ruleDark}"/>
      <rect x="30" y="72" width="150" height="9" rx="4.5" fill="${C.rule}"/>
      <rect x="30" y="98" width="120" height="9" rx="4.5" fill="${C.rule}"/>
      <rect x="30" y="124" width="150" height="9" rx="4.5" fill="${C.rule}"/>
      <path d="M30 168h150" stroke="${C.rule}" stroke-width="3" stroke-dasharray="8 8"/>
      <circle cx="105" cy="236" r="44" fill="${C.green}"/>
      <path d="M85 236l14 16 28-32" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,

  // White label: two partner documents joined by a link mark.
  "partner-handoff": (a) => `
    ${formCard({ x: 190, y: 130, w: 360, h: 460, label: "5472", accent: C.navy, rotate: -4, boxes: false })}
    ${formCard({ x: 730, y: 130, w: 360, h: 460, label: "5472", accent: a, rotate: 4, boxes: false })}
    <path d="M520 360C580 330 700 330 760 360" stroke="${C.navy}" stroke-width="6" stroke-dasharray="3 14" stroke-linecap="round" fill="none" opacity="0.55"/>
    ${link({ cx: 640, cy: 372, r: 54 })}
    ${[0, 1].map((i) => `<g transform="translate(${i ? 1020 : 260} 590)" filter="url(#soft)"><circle r="40" fill="${i ? a : C.navy}"/><circle cy="-8" r="12" fill="#fff"/><path d="M-22 22a22 18 0 0 1 44 0z" fill="#fff"/></g>`).join("")}`,

  // Dormant LLC: an empty ledger under a crescent moon.
  "empty-ledger": (a) => `
    <g filter="url(#deep)">
      <path d="M180 190H620V570H180z" fill="${C.paper}"/>
      <path d="M660 190H1100V570H660z" fill="${C.paper}"/>
      <path d="M620 190H660V570H620z" fill="${C.creamDeep}"/>
      <rect x="160" y="170" width="480" height="30" rx="10" fill="${C.navy}"/>
      <rect x="640" y="170" width="480" height="30" rx="10" fill="${C.navy}"/>
    </g>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M210 ${250 + i * 40}H590M690 ${250 + i * 40}H1070" stroke="${C.rule}" stroke-width="3"/>`).join("")}
    <path d="M440 210V550M860 210V550M960 210V550" stroke="${C.rule}" stroke-width="3"/>
    <rect x="210" y="220" width="170" height="14" rx="7" fill="${C.ruleDark}"/>
    <rect x="690" y="220" width="130" height="14" rx="7" fill="${C.ruleDark}"/>
    <g transform="translate(1030 26)" filter="url(#soft)">
      <path d="M0 0A62 62 0 1 0 62 78A50 50 0 1 1 0 0z" fill="${a}"/>
    </g>
    <circle cx="1160" cy="30" r="5" fill="${a}" opacity="0.6"/>
    <circle cx="1170" cy="96" r="4" fill="${a}" opacity="0.4"/>
    <rect x="290" y="600" width="700" height="14" rx="7" fill="${C.navy}" opacity="0.1"/>`,

  // Dissolved LLC: a closed folder with a rubber stamp resting on it.
  "closed-folder-stamp": (a) => `
    ${folder({ x: 250, y: 250, w: 640, h: 360, fill: C.navySoft, flap: C.navy, rotate: 0, filter: "url(#deep)", label: false })}
    <rect x="300" y="470" width="260" height="16" rx="8" fill="#fff" opacity="0.7"/>
    <rect x="300" y="504" width="170" height="12" rx="6" fill="#fff" opacity="0.4"/>
    <g transform="translate(700 372) rotate(-12)" filter="url(#soft)">
      <rect width="250" height="120" rx="14" fill="none" stroke="${a}" stroke-width="10"/>
      <rect x="26" y="26" width="68" height="68" rx="10" fill="none" stroke="${a}" stroke-width="9"/>
      <path d="M44 62l16 18 30-34" stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="120" y="40" width="102" height="14" rx="7" fill="${a}"/>
      <rect x="120" y="68" width="68" height="14" rx="7" fill="${a}" opacity="0.7"/>
    </g>
    <g transform="translate(980 90)" filter="url(#deep)">
      <rect x="0" y="130" width="170" height="40" rx="10" fill="${C.navy}"/>
      <rect x="20" y="170" width="130" height="26" rx="6" fill="${a}"/>
      <path d="M45 130V70a40 40 0 0 1 80 0v60" fill="${C.navySoft}"/>
      <rect x="28" y="20" width="114" height="22" rx="11" fill="${C.navySoft}"/>
    </g>`,
};

// slug -> descriptor (file name part), scene, accent
export const SERVICES = {
  "form-5472-filing-service": { descriptor: "form-and-checkmark", accent: C.green },
  "pro-forma-1120-filing-service": { descriptor: "form-pair", accent: C.teal },
  "late-form-5472-filing-service": { descriptor: "past-year-returns", accent: C.amber },
  "foreign-owned-llc-tax-filing-service": { descriptor: "globe-and-form", accent: C.teal },
  "form-5472-fax-filing-service": { descriptor: "fax-machine-receipt", accent: C.amber },
  "white-label-form-5472-filing": { descriptor: "partner-handoff", accent: C.amber },
  "form-5472-filing-for-dormant-llc": { descriptor: "empty-ledger", accent: C.clay },
  "final-form-5472-for-dissolved-llc": { descriptor: "closed-folder-stamp", accent: C.clay },
};

export const fileName = (slug) => `services_${slug}_${SERVICES[slug].descriptor}.webp`;

function svg(slug) {
  const { descriptor, accent } = SERVICES[slug];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      ${shadow("soft")}
      ${shadow("deep", 26, 30, 0.2)}
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.cream}"/>
        <stop offset="1" stop-color="${C.creamDeep}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#ground)"/>
    <rect width="${W}" height="14" fill="${C.navy}"/>
    <rect y="14" width="${W}" height="6" fill="${accent}"/>
    <circle cx="1210" cy="660" r="170" fill="${accent}" opacity="0.07"/>
    <circle cx="70" cy="90" r="110" fill="${C.navy}" opacity="0.04"/>
    ${SCENES[descriptor](accent)}
  </svg>`;
}

async function main() {
  const wanted = process.argv.slice(2);
  const slugs = wanted.length ? wanted : Object.keys(SERVICES);
  await fs.mkdir(OUT, { recursive: true });
  for (const slug of slugs) {
    if (!SERVICES[slug]) throw new Error(`unknown slug: ${slug}`);
    const file = path.join(OUT, fileName(slug));
    await sharp(Buffer.from(svg(slug))).webp({ quality: 86 }).toFile(file);
    const { size } = await fs.stat(file);
    console.log(`${fileName(slug)}  ${(size / 1024).toFixed(1)} KB`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
