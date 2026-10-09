// Renders editorial artwork for blog posts that have no photographic asset.
//
//   node scripts/render-blog-artwork.mjs [slug ...]
//
// The palette and composition deliberately echo the existing /public/blog
// renders — cream ground, navy paper furniture, one accent object per post —
// so a generated card and a rendered one sit together on /blog without the
// generated one reading as a placeholder. Output is 1280x720 webp, the size
// the blog card and the BlogPosting `image` field expect.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const W = 1280;
const H = 720;
const OUT = path.join(process.cwd(), "public", "blog");

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

/** A sheet of paper with grey text ruling — the recurring subject of the set. */
function sheet({ x, y, w, h, rotate = 0, lines = 9, filter = "url(#soft)" }) {
  const pad = w * 0.11;
  const step = (h - pad * 2) / (lines + 1);
  let rows = "";
  for (let i = 0; i < lines; i++) {
    const long = i % 3 !== 2;
    const lw = (w - pad * 2) * (long ? 0.86 : 0.52) * (i === 0 ? 0.45 : 1);
    const fill = i === 0 ? C.ruleDark : C.rule;
    const lh = i === 0 ? 13 : 9;
    rows += `<rect x="${pad}" y="${pad + step * (i + 0.6)}" width="${lw}" height="${lh}" rx="${lh / 2}" fill="${fill}"/>`;
  }
  return `
  <g transform="translate(${x} ${y}) rotate(${rotate})" filter="${filter}">
    <rect width="${w}" height="${h}" rx="10" fill="${C.paper}"/>
    ${rows}
  </g>`;
}

/** Flat navy disc carrying a simple white glyph — the icon row along the base. */
function chip({ cx, cy, r = 46, fill = C.navy, glyph = "doc" }) {
  const g = {
    doc: `<rect x="${-r * 0.3}" y="${-r * 0.38}" width="${r * 0.6}" height="${r * 0.76}" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
          <path d="M${-r * 0.16} ${-r * 0.14}H${r * 0.16}M${-r * 0.16} ${0}H${r * 0.16}M${-r * 0.16} ${r * 0.14}H${r * 0.05}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    clock: `<circle r="${r * 0.44}" fill="none" stroke="#fff" stroke-width="4"/>
            <path d="M0 ${-r * 0.26}V0h${r * 0.2}" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    check: `<path d="M${-r * 0.28} 0l${r * 0.2} ${r * 0.22} ${r * 0.36} ${-r * 0.44}" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    person: `<circle cy="${-r * 0.16}" r="${r * 0.19}" fill="#fff"/>
             <path d="M${-r * 0.34} ${r * 0.34}a${r * 0.34} ${r * 0.3} 0 0 1 ${r * 0.68} 0z" fill="#fff"/>`,
    warn: `<path d="M0 ${-r * 0.36}L${r * 0.36} ${r * 0.3}H${-r * 0.36}z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
           <path d="M0 ${-r * 0.1}v${r * 0.18}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
           <circle cy="${r * 0.19}" r="2.6" fill="#fff"/>`,
    calendar: `<rect x="${-r * 0.34}" y="${-r * 0.3}" width="${r * 0.68}" height="${r * 0.6}" rx="4" fill="none" stroke="#fff" stroke-width="4"/>
               <path d="M${-r * 0.34} ${-r * 0.1}h${r * 0.68}M${-r * 0.16} ${-r * 0.42}v${r * 0.16}M${r * 0.16} ${-r * 0.42}v${r * 0.16}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    hash: `<path d="M${-r * 0.3} ${-r * 0.12}h${r * 0.6}M${-r * 0.3} ${r * 0.12}h${r * 0.6}M${-r * 0.12} ${-r * 0.32}l${-r * 0.06} ${r * 0.64}M${r * 0.12} ${-r * 0.32}l${-r * 0.06} ${r * 0.64}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    two: `<circle cx="${-r * 0.17}" cy="0" r="${r * 0.17}" fill="none" stroke="#fff" stroke-width="4"/>
          <circle cx="${r * 0.17}" cy="0" r="${r * 0.17}" fill="none" stroke="#fff" stroke-width="4"/>`,
    globe: `<circle r="${r * 0.36}" fill="none" stroke="#fff" stroke-width="4"/>
            <ellipse rx="${r * 0.16}" ry="${r * 0.36}" fill="none" stroke="#fff" stroke-width="4"/>
            <path d="M${-r * 0.36} 0h${r * 0.72}" stroke="#fff" stroke-width="4"/>`,
    pen: `<path d="M${-r * 0.28} ${r * 0.28}l${r * 0.1} ${-r * 0.3} ${r * 0.44} ${-r * 0.44} ${r * 0.2} ${r * 0.2} ${-r * 0.44} ${r * 0.44}z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`,
  }[glyph];
  return `<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="${fill}"/>${g}</g>`;
}

/** The accent object that distinguishes one post's card from the next. */
function motif(kind, accent) {
  switch (kind) {
    case "car":
    case "car-route":
    case "car-electric":
    case "car-vat":
      return `
      <g transform="translate(788 188)" filter="url(#soft)">
        <rect x="4" y="270" width="408" height="12" rx="6" fill="${accent}" opacity="0.35"/>
        <path d="M24 168l46-82q10-18 34-18h164q20 0 34 18l58 82q30 5 30 36v34H8v-35q0-26 16-35z" fill="${C.navy}"/>
        <path d="M90 98h90v66H52zM196 98h66q12 0 19 10l38 56H196z" fill="${C.paper}" opacity="0.9"/>
        <rect x="184" y="181" width="27" height="6" rx="3" fill="${accent}"/>
        <rect x="338" y="190" width="39" height="15" rx="7" fill="${accent}"/>
        <circle cx="89" cy="236" r="36" fill="${C.navySoft}" stroke="${C.paper}" stroke-width="8"/>
        <circle cx="309" cy="236" r="36" fill="${C.navySoft}" stroke="${C.paper}" stroke-width="8"/>
        ${kind === "car-electric" ? `<rect x="320" y="-32" width="60" height="90" rx="12" fill="${accent}"/><path d="M353-16l-15 31h16l-10 28" fill="none" stroke="${C.paper}" stroke-width="6" stroke-linejoin="round"/><path d="M380 0q32 0 32 36v114h-25" fill="none" stroke="${accent}" stroke-width="6"/>` : ""}
        ${kind === "car-route" ? `<path d="M18 12h114q25 0 25 20t25 20h114" fill="none" stroke="${accent}" stroke-width="7" stroke-dasharray="12 9"/><circle cx="18" cy="12" r="12" fill="${accent}"/><circle cx="296" cy="52" r="12" fill="${accent}"/>` : ""}
        ${kind === "car-vat" ? `<rect x="285" y="-32" width="100" height="112" rx="10" fill="${C.paper}"/><text x="304" y="9" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${accent}">VAT</text><path d="M303 29h60M303 49h42" stroke="${C.ruleDark}" stroke-width="7" stroke-linecap="round"/>` : ""}
      </g>`;
    case "notice": // a stamped notice sheet, corner folded
      return `
      <g transform="translate(830 120) rotate(6)" filter="url(#soft)">
        <rect width="300" height="380" rx="10" fill="${C.paper}"/>
        <rect x="34" y="44" width="150" height="16" rx="8" fill="${accent}"/>
        <rect x="34" y="90" width="232" height="9" rx="4.5" fill="${C.rule}"/>
        <rect x="34" y="116" width="200" height="9" rx="4.5" fill="${C.rule}"/>
        <rect x="34" y="160" width="232" height="72" rx="8" fill="${accent}" opacity="0.13"/>
        <rect x="52" y="186" width="120" height="20" rx="10" fill="${accent}"/>
        <rect x="34" y="266" width="232" height="9" rx="4.5" fill="${C.rule}"/>
        <rect x="34" y="292" width="176" height="9" rx="4.5" fill="${C.rule}"/>
      </g>`;
    case "checklist":
      return `
      <g transform="translate(852 148)" filter="url(#soft)">
        <rect width="272" height="330" rx="12" fill="${C.paper}"/>
        ${[0, 1, 2, 3, 4]
          .map((i) => {
            const y = 44 + i * 54;
            const done = i < 3;
            return `<rect x="34" y="${y}" width="26" height="26" rx="7" fill="${done ? accent : "none"}" stroke="${done ? accent : C.ruleDark}" stroke-width="3"/>
                    ${done ? `<path d="M${40} ${y + 13}l6 7 12 -13" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
                    <rect x="76" y="${y + 8}" width="${i % 2 ? 120 : 158}" height="10" rx="5" fill="${C.rule}"/>`;
          })
          .join("")}
      </g>`;
    case "calendar":
      return `
      <g transform="translate(838 138)" filter="url(#soft)">
        <rect width="296" height="316" rx="14" fill="${C.paper}"/>
        <rect width="296" height="62" rx="14" fill="${C.navy}"/>
        <rect y="48" width="296" height="14" fill="${C.navy}"/>
        ${[0, 1, 2, 3]
          .map((r) =>
            [0, 1, 2, 3, 4]
              .map((c) => {
                const x = 30 + c * 48;
                const y = 92 + r * 52;
                const hit = r === 2 && c === 3;
                return hit
                  ? `<circle cx="${x + 15}" cy="${y + 15}" r="20" fill="${accent}"/>`
                  : `<rect x="${x}" y="${y}" width="30" height="30" rx="7" fill="${C.creamDeep}"/>`;
              })
              .join(""),
          )
          .join("")}
      </g>`;
    case "stack": // two offset paper stacks — comparison / multiple returns
      return `
      ${sheet({ x: 812, y: 168, w: 246, h: 302, rotate: -5 })}
      ${sheet({ x: 890, y: 128, w: 246, h: 302, rotate: 5 })}
      <circle cx="1092" cy="470" r="34" fill="${accent}"/>`;
    case "card": // an ID / number card
      return `
      <g transform="translate(836 214) rotate(-4)" filter="url(#soft)">
        <rect width="316" height="196" rx="16" fill="${C.paper}"/>
        <rect x="30" y="34" width="72" height="56" rx="8" fill="${accent}" opacity="0.22"/>
        <circle cx="66" cy="56" r="13" fill="${accent}"/>
        <path d="M48 84a18 16 0 0 1 36 0z" fill="${accent}"/>
        <rect x="122" y="38" width="156" height="12" rx="6" fill="${C.ruleDark}"/>
        <rect x="122" y="62" width="112" height="10" rx="5" fill="${C.rule}"/>
        <rect x="30" y="118" width="248" height="14" rx="7" fill="${C.rule}"/>
        <rect x="30" y="146" width="180" height="14" rx="7" fill="${C.rule}"/>
      </g>`;
    case "split": // two parallel folders — one-or-the-other
      return `
      <g filter="url(#soft)">
        <rect x="806" y="176" width="164" height="288" rx="12" fill="${C.navySoft}"/>
        <rect x="826" y="152" width="164" height="288" rx="12" fill="${C.paper}"/>
        <rect x="856" y="196" width="104" height="11" rx="5.5" fill="${C.rule}"/>
        <rect x="856" y="224" width="76" height="11" rx="5.5" fill="${C.rule}"/>
        <rect x="1010" y="176" width="164" height="288" rx="12" fill="${accent}" opacity="0.28"/>
        <rect x="1030" y="152" width="164" height="288" rx="12" fill="${C.paper}"/>
        <rect x="1060" y="196" width="104" height="11" rx="5.5" fill="${C.rule}"/>
        <rect x="1060" y="224" width="76" height="11" rx="5.5" fill="${C.rule}"/>
      </g>`;
    case "globe":
      return `
      <g transform="translate(986 300)" filter="url(#soft)">
        <circle r="146" fill="${C.navy}"/>
        <circle r="146" fill="none" stroke="${accent}" stroke-width="6" opacity="0.85"/>
        <ellipse rx="66" ry="146" fill="none" stroke="${C.creamDeep}" stroke-width="4" opacity="0.6"/>
        <ellipse rx="126" ry="146" fill="none" stroke="${C.creamDeep}" stroke-width="4" opacity="0.35"/>
        <path d="M-146 0h292M-134 -74h268M-134 74h268" stroke="${C.creamDeep}" stroke-width="4" opacity="0.5"/>
        <circle cx="52" cy="-58" r="15" fill="${accent}"/>
      </g>`;
    case "correct": // a sheet with a struck line and a corrected line beneath
      return `
      <g transform="translate(846 152) rotate(3)" filter="url(#soft)">
        <rect width="286" height="342" rx="12" fill="${C.paper}"/>
        <rect x="34" y="48" width="150" height="13" rx="6.5" fill="${C.ruleDark}"/>
        <rect x="34" y="102" width="218" height="10" rx="5" fill="${C.rule}"/>
        <rect x="34" y="140" width="184" height="10" rx="5" fill="${C.clay}" opacity="0.55"/>
        <path d="M28 145h196" stroke="${C.clay}" stroke-width="4" stroke-linecap="round"/>
        <rect x="34" y="184" width="184" height="10" rx="5" fill="${accent}"/>
        <path d="M236 184l10 11 18 -21" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="34" y="240" width="218" height="10" rx="5" fill="${C.rule}"/>
        <rect x="34" y="272" width="152" height="10" rx="5" fill="${C.rule}"/>
      </g>`;
    default:
      return "";
  }
}

// ---- composition ---------------------------------------------------------

function svg({ accent, motif: kind, glyphs, location }) {
  const chips = glyphs
    .map((g, i) =>
      chip({
        cx: 214 + i * 108,
        cy: 604,
        glyph: g,
        fill: i === glyphs.length - 1 ? accent : C.navy,
      }),
    )
    .join("");

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
    <rect width="${W}" height="118" fill="${C.navy}"/>
    ${location ? `<text x="76" y="78" fill="${C.paper}" font-family="Arial, sans-serif" font-size="44" font-weight="700" letter-spacing="4">${location.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</text>` : ""}
    <rect x="0" y="118" width="${W}" height="8" fill="${accent}"/>
    <rect x="0" y="126" width="${W}" height="26" fill="#000" opacity="0.05"/>
    <circle cx="1136" cy="59" r="30" fill="${accent}" opacity="0.55"/>
    <circle cx="1210" cy="59" r="30" fill="${accent}" opacity="0.28"/>

    ${sheet({ x: 150, y: 172, w: 470, h: 372, rotate: -2, lines: 10, filter: "url(#deep)" })}
    <rect x="126" y="196" width="34" height="330" rx="10" fill="${C.navy}"/>
    <rect x="140" y="240" width="12" height="52" rx="6" fill="${C.navySoft}"/>
    <rect x="140" y="418" width="12" height="52" rx="6" fill="${C.navySoft}"/>

    ${motif(kind, accent)}
    ${chips}
  </svg>`;
}

const POSTS = {
  "company-car-deductions-foreign-owned-us-llc": { location: "COMPANY CAR", accent: C.teal, motif: "car", glyphs: ["person", "doc", "hash", "check"] },
  "business-car-mileage-vs-actual-expenses-2026": { location: "MILEAGE OR ACTUAL COSTS", accent: C.amber, motif: "car-route", glyphs: ["calendar", "pen", "hash", "check"] },
  "electric-company-car-us-llc-tax-credits-2026": { location: "ELECTRIC COMPANY CAR", accent: C.green, motif: "car-electric", glyphs: ["calendar", "doc", "warn", "check"] },
  "uk-company-car-vat-buy-lease-electric": { location: "UK CAR VAT", accent: C.navySoft, motif: "car-vat", glyphs: ["doc", "hash", "two", "check"] },
  "form-5472-affiliate-marketers-content-sites": { accent: C.teal, motif: "stack", glyphs: ["doc", "hash", "person", "check"] },
  "form-5472-app-developers-app-store-google-play": { accent: C.navySoft, motif: "split", glyphs: ["doc", "hash", "person", "check"] },
  "form-5472-kdp-authors-royalties": { accent: C.amber, motif: "stack", glyphs: ["doc", "pen", "hash", "check"] },
  "form-5472-irs-notice-numbers-decoder": { accent: C.clay, motif: "notice", glyphs: ["doc", "hash", "calendar", "check"] },
  "foreign-owned-llc-hiring-us-employees-contractors": { accent: C.green, motif: "checklist", glyphs: ["person", "doc", "hash", "check"] },
  "form-5472-newsletter-membership-creators": { accent: C.teal, motif: "card", glyphs: ["person", "calendar", "doc", "check"] },
  "form-5472-vs-fbar-vs-form-8938": { accent: C.navy, motif: "split", glyphs: ["doc", "globe", "hash", "check"] },
  "single-member-to-multi-member-llc-what-changes": { accent: C.amber, motif: "correct", glyphs: ["person", "person", "doc", "check"] },
  "reinstate-dissolved-llc-catch-up-form-5472": { accent: C.clay, motif: "notice", glyphs: ["doc", "calendar", "hash", "check"] },
  "foreign-owned-llc-irs-records-request-6038a-3": { accent: C.green, motif: "checklist", glyphs: ["doc", "hash", "calendar", "check"] },
  "lisbon-digital-nomad-us-llc-accountant-handoff": { location: "LISBON", accent: C.teal, motif: "split", glyphs: ["globe", "calendar", "two", "doc"] },
  "bangkok-digital-nomad-llc-transfer-remittance-records": { location: "BANGKOK", accent: C.amber, motif: "stack", glyphs: ["doc", "person", "globe", "check"] },
  "mexico-city-digital-nomad-us-llc-work-location-log": { location: "MEXICO CITY", accent: C.green, motif: "globe", glyphs: ["calendar", "pen", "globe", "doc"] },
  "tbilisi-digital-nomad-georgian-ie-us-llc-records": { location: "TBILISI", accent: C.clay, motif: "split", glyphs: ["person", "two", "doc", "check"] },
  "chiang-mai-digital-nomad-llc-coworking-owner-paid-costs": { location: "CHIANG MAI", accent: C.green, motif: "checklist", glyphs: ["person", "doc", "hash", "check"] },
  "buenos-aires-digital-nomad-llc-usd-ars-reconciliation": { location: "BUENOS AIRES", accent: C.amber, motif: "correct", glyphs: ["hash", "two", "doc", "check"] },
  "dubai-digital-nomad-us-llc-corporate-tax-review-pack": { location: "DUBAI", accent: C.teal, motif: "stack", glyphs: ["person", "globe", "two", "doc"] },
  "kuala-lumpur-digital-nomad-cross-year-tax-records": { location: "KUALA LUMPUR", accent: C.green, motif: "calendar", glyphs: ["calendar", "clock", "globe", "doc"] },
  "medellin-digital-nomad-rolling-365-day-tax-log": { location: "MEDELLÍN", accent: C.clay, motif: "calendar", glyphs: ["globe", "calendar", "pen", "check"] },
  "barcelona-digital-nomad-visa-us-llc-tax-election": { location: "BARCELONA", accent: C.navySoft, motif: "card", glyphs: ["person", "doc", "two", "check"] },
  "foreign-owned-us-llc-fbar": { accent: C.teal, motif: "globe", glyphs: ["globe", "two", "hash", "doc"] },
  "us-llc-paying-foreign-contractors-tax-forms": { accent: C.green, motif: "split", glyphs: ["person", "globe", "doc", "two"] },
  "itin-nonresident-spouse-joint-return-w7": { accent: C.clay, motif: "stack", glyphs: ["two", "person", "hash", "doc"] },
  "form-5472-owner-becomes-us-tax-resident": { accent: C.amber, motif: "calendar", glyphs: ["globe", "person", "calendar", "doc"] },
  "form-5472-penalty-notice-what-to-do": { accent: C.clay, motif: "notice", glyphs: ["warn", "doc", "clock", "check"] },
  "foreign-owned-llc-filing-requirements-checklist": { accent: C.green, motif: "checklist", glyphs: ["doc", "check", "calendar", "check"] },
  "does-foreign-owned-llc-pay-us-tax": { accent: C.teal, motif: "globe", glyphs: ["person", "doc", "hash", "check"] },
  "how-to-fill-out-form-5472": { accent: C.navySoft, motif: "checklist", glyphs: ["pen", "doc", "hash", "check"] },
  "form-5472-deadline-2026": { accent: C.amber, motif: "calendar", glyphs: ["calendar", "clock", "doc", "check"] },
  "wyoming-llc-foreign-owner-tax-filing": { accent: C.green, motif: "split", glyphs: ["doc", "calendar", "person", "check"] },
  "ein-for-foreign-owned-llc-without-ssn": { accent: C.teal, motif: "card", glyphs: ["hash", "person", "doc", "check"] },
  "multi-member-llc-form-5472-or-1065": { accent: C.amber, motif: "split", glyphs: ["two", "person", "doc", "check"] },
  "form-5472-uae-dubai-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "amended-form-5472-correcting-errors": { accent: C.clay, motif: "correct", glyphs: ["pen", "doc", "warn", "check"] },
  "form-5472-us-real-estate-foreign-investor": { accent: C.teal, motif: "split", glyphs: ["doc", "person", "hash", "check"] },
  "form-5472-vs-form-5471": { accent: C.amber, motif: "split", glyphs: ["two", "doc", "globe", "check"] },
  "form-5472-statute-of-limitations": { accent: C.clay, motif: "calendar", glyphs: ["clock", "calendar", "warn", "check"] },
  "new-mexico-llc-foreign-owner-tax-filing": { accent: C.amber, motif: "checklist", glyphs: ["doc", "calendar", "person", "check"] },
  "nevada-llc-foreign-owner-tax-filing": { accent: C.navySoft, motif: "checklist", glyphs: ["doc", "calendar", "hash", "check"] },
  "form-5472-hong-kong-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-pakistan-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "person", "hash", "check"] },
  "form-5472-mexico-residents-us-llc": { accent: C.amber, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-part-v-statement-example": { accent: C.teal, motif: "notice", glyphs: ["pen", "doc", "hash", "check"] },
  "form-5472-shopify-dropshipping-foreign-owner": { accent: C.green, motif: "stack", glyphs: ["doc", "person", "clock", "check"] },
  "form-5472-china-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "person", "hash", "check"] },
  "form-5472-brazil-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-spain-residents-us-llc": { accent: C.amber, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-nigeria-residents-us-llc": { accent: C.teal, motif: "globe", glyphs: ["globe", "hash", "person", "check"] },
  "llc-vs-c-corp-non-resident-founders": { accent: C.amber, motif: "split", glyphs: ["two", "doc", "hash", "check"] },
  "us-bank-account-foreign-owned-llc": { accent: C.teal, motif: "card", glyphs: ["hash", "doc", "person", "check"] },
  "w8ben-vs-w9-foreign-owned-llc": { accent: C.clay, motif: "split", glyphs: ["two", "person", "doc", "check"] },
  "form-5472-youtube-creators-influencers": { accent: C.clay, motif: "stack", glyphs: ["person", "doc", "clock", "check"] },
  "form-5472-etsy-print-on-demand-sellers": { accent: C.amber, motif: "stack", glyphs: ["doc", "person", "hash", "check"] },
  "form-8832-election-foreign-owned-llc": { accent: C.navySoft, motif: "correct", glyphs: ["pen", "doc", "two", "check"] },
  "form-5472-airbnb-short-term-rental-host": { accent: C.teal, motif: "calendar", glyphs: ["person", "doc", "calendar", "check"] },
  "ein-application-rejected-reference-number-101": { accent: C.clay, motif: "notice", glyphs: ["warn", "hash", "doc", "check"] },
  "lost-ein-147c-letter-replacement": { accent: C.amber, motif: "notice", glyphs: ["doc", "hash", "clock", "check"] },
  "how-to-fill-out-form-ss-4-foreign-owned-llc": { accent: C.navySoft, motif: "checklist", glyphs: ["pen", "doc", "hash", "check"] },
  "ein-for-stripe-amazon-paypal-seller-account": { accent: C.green, motif: "card", glyphs: ["hash", "doc", "person", "check"] },
  "ein-third-party-designee-apply-on-your-behalf": { accent: C.teal, motif: "split", glyphs: ["two", "person", "doc", "check"] },
  "how-to-fill-out-form-w-7-nonresident-llc-owner": { accent: C.navySoft, motif: "checklist", glyphs: ["pen", "doc", "person", "check"] },
  "itin-renewal-expired-itin-what-to-do": { accent: C.amber, motif: "calendar", glyphs: ["clock", "calendar", "hash", "check"] },
  "itin-application-rejected-cp567-cp566": { accent: C.clay, motif: "notice", glyphs: ["warn", "doc", "person", "check"] },
  "when-nonresident-actually-needs-itin": { accent: C.teal, motif: "split", glyphs: ["two", "hash", "person", "check"] },
  "itin-refund-30-percent-withholding-1042-s": { accent: C.green, motif: "stack", glyphs: ["doc", "hash", "clock", "check"] },
  "boi-reporting-foreign-owned-us-llc-2026": { accent: C.green, motif: "correct", glyphs: ["doc", "person", "warn", "check"] },
  "registered-agent-foreign-owned-llc": { accent: C.teal, motif: "card", glyphs: ["person", "doc", "hash", "check"] },
  "single-member-llc-operating-agreement-foreign-owner": { accent: C.navySoft, motif: "notice", glyphs: ["pen", "doc", "person", "check"] },
  "certificate-of-good-standing-foreign-owned-llc": { accent: C.amber, motif: "checklist", glyphs: ["doc", "calendar", "hash", "check"] },
  "sales-tax-nexus-foreign-owned-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "hash", "doc", "check"] },
  "offer-form-5472-filing-as-a-service": { accent: C.teal, motif: "card", glyphs: ["doc", "person", "hash", "check"] },
  "file-form-5472-for-multiple-clients": { accent: C.navySoft, motif: "stack", glyphs: ["doc", "person", "calendar", "check"] },
  "form-5472-in-house-vs-outsourced-firm": { accent: C.amber, motif: "split", glyphs: ["doc", "person", "hash", "check"] },
  "form-5472-client-intake-checklist-for-firms": { accent: C.green, motif: "checklist", glyphs: ["doc", "pen", "person", "check"] },
  "file-form-5472-for-clients-without-being-a-cpa": { accent: C.clay, motif: "correct", glyphs: ["person", "doc", "check", "hash"] },
  "form-5472-thailand-residents-us-llc": { accent: C.teal, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-indonesia-bali-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-vietnam-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-portugal-residents-us-llc": { accent: C.amber, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-digital-nomad-us-llc": { accent: C.navySoft, motif: "globe", glyphs: ["globe", "calendar", "doc", "check"] },
  "form-5472-philippines-residents-us-llc": { accent: C.teal, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-malaysia-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-georgia-country-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "hash", "doc", "check"] },
  "form-5472-colombia-residents-us-llc": { accent: C.amber, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-estonia-residents-us-llc": { accent: C.navy, motif: "globe", glyphs: ["globe", "person", "hash", "check"] },
  "us-llc-tax-free-digital-nomads-myth": { accent: C.clay, motif: "correct", glyphs: ["globe", "doc", "hash", "check"] },
  "stripe-atlas-doola-firstbase-form-5472": { accent: C.teal, motif: "checklist", glyphs: ["doc", "person", "calendar", "check"] },
  "form-5472-freelancers-upwork-fiverr-us-llc": { accent: C.green, motif: "stack", glyphs: ["person", "doc", "hash", "check"] },
  "wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads": { accent: C.amber, motif: "split", glyphs: ["doc", "calendar", "hash", "check"] },
  "us-llc-vs-estonia-ou-vs-uae-company-digital-nomads": { accent: C.navySoft, motif: "split", glyphs: ["globe", "doc", "calendar", "check"] },
  "form-5472-turkey-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "form-5472-hungary-residents-us-llc": { accent: C.amber, motif: "notice", glyphs: ["doc", "globe", "hash", "check"] },
  "form-5472-costa-rica-residents-us-llc": { accent: C.green, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-argentina-residents-us-llc": { accent: C.teal, motif: "globe", glyphs: ["globe", "person", "hash", "check"] },
  "form-5472-south-korea-residents-us-llc": { accent: C.navySoft, motif: "globe", glyphs: ["globe", "doc", "person", "check"] },
  "form-5472-croatia-residents-us-llc": { accent: C.navy, motif: "globe", glyphs: ["globe", "hash", "doc", "check"] },
  "form-5472-taiwan-residents-us-llc": { accent: C.clay, motif: "globe", glyphs: ["globe", "person", "doc", "check"] },
  "pay-yourself-from-us-llc-non-resident": { accent: C.green, motif: "card", glyphs: ["person", "hash", "doc", "check"] },
  "form-5472-from-mercury-wise-relay-statements": { accent: C.teal, motif: "stack", glyphs: ["doc", "hash", "calendar", "check"] },
  "form-5472-coaches-consultants-course-creators": { accent: C.amber, motif: "checklist", glyphs: ["person", "doc", "calendar", "check"] },
  "form-5472-small-corporation-reasonable-cause": { accent: C.clay, motif: "notice", glyphs: ["warn", "doc", "pen", "check"] },
  "foreign-owned-llc-compliance-calendar-2027": { accent: C.green, motif: "calendar", glyphs: ["calendar", "clock", "doc", "check"] },
  "llc-annual-report-late-fees-by-state": { accent: C.amber, motif: "notice", glyphs: ["warn", "calendar", "hash", "check"] },
  "form-5472-family-members-related-parties": { accent: C.teal, motif: "split", glyphs: ["person", "two", "doc", "check"] },
  "irs-official-exchange-rate-form-5472": { accent: C.navySoft, motif: "stack", glyphs: ["globe", "hash", "doc", "check"] },
  "form-5472-software-turbotax-taxact-hr-block": { accent: C.teal, motif: "split", glyphs: ["doc", "hash", "warn", "check"] },
  "form-966-closing-foreign-owned-llc": { accent: C.clay, motif: "notice", glyphs: ["doc", "calendar", "pen", "check"] },
};

const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : Object.keys(POSTS);

for (const slug of slugs) {
  const cfg = POSTS[slug];
  if (!cfg) {
    console.error(`no artwork config for "${slug}"`);
    process.exitCode = 1;
    continue;
  }
  const file = path.join(OUT, `${slug}.webp`);
  await sharp(Buffer.from(svg(cfg))).webp({ quality: 88 }).toFile(file);
  const { size } = await fs.stat(file);
  console.log(`${slug}.webp  ${(size / 1024).toFixed(1)} KB`);
}
