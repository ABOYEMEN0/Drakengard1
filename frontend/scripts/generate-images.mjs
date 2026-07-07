/**
 * Generates the LEOR brand imagery as elegant, self-contained SVGs:
 * logo, hero, category tiles, product shots (3 angles each) and gallery tiles.
 * Re-run with: node scripts/generate-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const NAVY = "#0F2345";
const NAVY_DEEP = "#0A1930";
const GOLD = "#D8B46A";
const GOLD_SOFT = "#E9D6AC";
const IVORY = "#F8F6F2";

const PALETTES = {
  coffee: { a: "#3E2C22", b: "#1E140F", accent: GOLD },
  chocolate: { a: "#4A2E24", b: "#241310", accent: "#E8C79A" },
  nuts: { a: "#8A6B44", b: "#4F3A22", accent: "#F0DDB8" },
  accessories: { a: NAVY, b: NAVY_DEEP, accent: GOLD },
  "gift-boxes": { a: "#132A52", b: NAVY_DEEP, accent: GOLD },
  seasonal: { a: "#23345C", b: "#101C36", accent: GOLD_SOFT },
};

const MOTIFS = {
  coffee: `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <ellipse cx="0" cy="0" rx="52" ry="78" />
      <path d="M 0 -78 C 30 -40 -30 40 0 78" />
    </g>`,
  chocolate: `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <rect x="-70" y="-70" width="140" height="140" rx="14" />
      <line x1="-70" y1="0" x2="70" y2="0" /><line x1="0" y1="-70" x2="0" y2="70" />
      <rect x="-46" y="-46" width="24" height="24" rx="5" fill="ACCENT" stroke="none" opacity="0.55"/>
    </g>`,
  nuts: `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <path d="M 0 -75 C 55 -55 55 35 0 75 C -55 35 -55 -55 0 -75 Z" />
      <path d="M 0 -55 C 30 -35 30 30 0 55" opacity="0.7"/>
    </g>`,
  accessories: `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <path d="M -55 -30 L -35 65 L 45 65 L 60 -30 Z" />
      <path d="M -55 -30 C -55 -55 60 -55 60 -30" />
      <path d="M -80 -38 C -30 -60 -10 -34 -58 -28" stroke-width="2.5"/>
    </g>`,
  "gift-boxes": `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <rect x="-65" y="-25" width="130" height="90" rx="8" />
      <rect x="-75" y="-52" width="150" height="27" rx="6" />
      <line x1="0" y1="-52" x2="0" y2="65" />
      <path d="M 0 -52 C -35 -95 -55 -60 0 -52 C 55 -60 35 -95 0 -52" stroke-width="2.5"/>
    </g>`,
  seasonal: `
    <g fill="none" stroke="ACCENT" stroke-width="3">
      <path d="M 18 -70 A 72 72 0 1 0 70 22 A 58 58 0 1 1 18 -70 Z" />
      <path d="M 52 -52 l 4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 Z" fill="ACCENT" stroke="none" opacity="0.8"/>
    </g>`,
};

function write(rel, svg) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + "\n");
}

const defs = (id, a, b) => `
  <defs>
    <radialGradient id="${id}" cx="35%" cy="28%" r="95%">
      <stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>
    </radialGradient>
  </defs>`;

// ——— Logo: monogram + wordmark ———
const wordmark = (fill, sub) => `
  <text x="200" y="96" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif"
    font-size="72" letter-spacing="26" fill="${fill}" font-weight="500">LEOR</text>
  <line x1="120" y1="120" x2="280" y2="120" stroke="${GOLD}" stroke-width="1.5"/>
  <text x="200" y="146" text-anchor="middle" font-family="Inter, sans-serif" font-size="14"
    letter-spacing="8" fill="${sub}">MAISON GOURMANDE</text>`;

write(
  "logo.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170">${wordmark(NAVY, "#8f8f8f")}</svg>`
);
write(
  "logo-light.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170">${wordmark(IVORY, GOLD_SOFT)}</svg>`
);
write(
  "logo-mark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="56" fill="${NAVY}"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
    <text x="60" y="82" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif"
      font-size="62" fill="${GOLD}" font-weight="500">L</text>
  </svg>`
);
write(
  "favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="${NAVY}"/>
    <text x="32" y="45" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${GOLD}">L</text>
  </svg>`
);

// ——— Hero ———
write(
  "images/hero.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
    ${defs("hero", "#1D3760", NAVY_DEEP)}
    <rect width="1600" height="900" fill="url(#hero)"/>
    <g opacity="0.16" stroke="${GOLD}" fill="none">
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="1250" cy="450" r="${90 + i * 68}" stroke-width="0.8"/>`).join("")}
    </g>
    <g transform="translate(1250 450)" opacity="0.9">
      <ellipse cx="0" cy="0" rx="120" ry="180" fill="none" stroke="${GOLD}" stroke-width="4"/>
      <path d="M 0 -180 C 70 -90 -70 90 0 180" fill="none" stroke="${GOLD}" stroke-width="4"/>
    </g>
    <g opacity="0.35" fill="${GOLD}">
      <circle cx="180" cy="760" r="2.5"/><circle cx="420" cy="120" r="2"/><circle cx="960" cy="200" r="2.5"/>
      <circle cx="720" cy="800" r="2"/><circle cx="1480" cy="120" r="2"/>
    </g>
  </svg>`
);

// ——— Category tiles ———
for (const [slug, p] of Object.entries(PALETTES)) {
  write(
    `images/categories/${slug}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      ${defs(`c-${slug}`, p.a, p.b)}
      <rect width="800" height="1000" fill="url(#c-${slug})"/>
      <rect x="28" y="28" width="744" height="944" rx="18" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.6"/>
      <g transform="translate(400 470) scale(2.1)">${MOTIFS[slug].replaceAll("ACCENT", p.accent)}</g>
      <g opacity="0.25" stroke="${p.accent}" fill="none">
        <circle cx="400" cy="470" r="260" stroke-width="0.8"/>
        <circle cx="400" cy="470" r="300" stroke-width="0.6"/>
      </g>
    </svg>`
  );
}

// ——— Products ———
const PRODUCTS = [
  ["ethiopian-yirgacheffe", "Ethiopian Yirgacheffe", "coffee"],
  ["colombian-geisha", "Colombian Geisha", "coffee"],
  ["leor-signature-espresso", "Signature Espresso", "coffee"],
  ["yemeni-mocha-haraz", "Yemeni Mocha Haraz", "coffee"],
  ["decaf-swiss-water", "Swiss Water Decaf", "coffee"],
  ["cold-brew-blend", "Cold Brew Reserve", "coffee"],
  ["single-origin-madagascar-70", "Madagascar 70%", "chocolate"],
  ["pistachio-praline-collection", "Pistachio Praliné", "chocolate"],
  ["dark-sea-salt-85", "85% Sea Salt", "chocolate"],
  ["date-and-tahini-bar", "Date & Tahini", "chocolate"],
  ["hot-chocolate-flakes", "Drinking Chocolate", "chocolate"],
  ["ruby-raspberry-bonbons", "Ruby Bonbons", "chocolate"],
  ["royal-mixed-nuts", "Royal Mixed Nuts", "nuts"],
  ["honey-glazed-almonds", "Honey Almonds", "nuts"],
  ["smoked-pistachios", "Smoked Pistachios", "nuts"],
  ["candied-pecans-cinnamon", "Candied Pecans", "nuts"],
  ["leor-brass-pour-over", "Brass Pour-Over", "accessories"],
  ["precision-hand-grinder", "Hand Grinder", "accessories"],
  ["ceramic-cupping-set", "Cupping Set", "accessories"],
  ["gooseneck-kettle", "Gooseneck Kettle", "accessories"],
  ["leor-grand-hamper", "Grand Hamper", "gift-boxes"],
  ["petit-tasting-box", "Petit Tasting Box", "gift-boxes"],
  ["ramadan-nights-collection", "Ramadan Nights", "seasonal"],
  ["winter-spice-hot-chocolate", "Winter Spice", "seasonal"],
];

const layouts = [
  (motif, accent, name) => `
    <g transform="translate(400 360) scale(1.75)">${motif}</g>
    <g opacity="0.3" stroke="${accent}" fill="none"><circle cx="400" cy="360" r="215" stroke-width="0.9"/></g>
    <text x="400" y="680" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif"
      font-size="40" fill="${accent}" letter-spacing="3">${name}</text>
    <text x="400" y="722" text-anchor="middle" font-family="Inter, sans-serif" font-size="15"
      letter-spacing="7" fill="${accent}" opacity="0.7">L E O R</text>`,
  (motif, accent) => `
    <g transform="translate(540 300) scale(2.6) rotate(12)" opacity="0.95">${motif}</g>
    <g opacity="0.25" stroke="${accent}" fill="none">
      <circle cx="540" cy="300" r="250" stroke-width="0.8"/><circle cx="540" cy="300" r="300" stroke-width="0.6"/>
    </g>
    <line x1="90" y1="640" x2="330" y2="640" stroke="${accent}" stroke-width="1.5"/>
    <text x="90" y="695" font-family="Inter, sans-serif" font-size="16" letter-spacing="8" fill="${accent}">DETAIL</text>`,
  (motif, accent) => `
    <g transform="translate(400 400) scale(1.15)" opacity="0.55">${motif}</g>
    <g transform="translate(400 400) scale(1.9)" opacity="0.9">${motif}</g>
    <rect x="60" y="60" width="680" height="680" rx="16" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.5"/>`,
];

for (const [slug, name, cat] of PRODUCTS) {
  const p = PALETTES[cat];
  const motif = MOTIFS[cat].replaceAll("ACCENT", p.accent);
  layouts.forEach((layout, i) => {
    write(
      `images/products/${slug}-${i + 1}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        ${defs(`p-${slug}-${i}`, p.a, p.b)}
        <rect width="800" height="800" fill="url(#p-${slug}-${i})"/>
        ${layout(motif, p.accent, name)}
      </svg>`
    );
  });
}

// ——— Instagram gallery ———
const igPalettes = Object.values(PALETTES);
igPalettes.forEach((p, i) => {
  const motifs = Object.values(MOTIFS);
  write(
    `images/instagram/${i + 1}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      ${defs(`ig-${i}`, p.a, p.b)}
      <rect width="600" height="600" fill="url(#ig-${i})"/>
      <g transform="translate(300 300) scale(1.5) rotate(${i * 17 - 30})">${motifs[i].replaceAll("ACCENT", p.accent)}</g>
      <text x="300" y="560" text-anchor="middle" font-family="Inter, sans-serif" font-size="14"
        letter-spacing="6" fill="${p.accent}" opacity="0.75">@LEOR.SA</text>
    </svg>`
  );
});

console.log("LEOR imagery generated.");
