#!/usr/bin/env node
/*
  Applies semantic color tokens across the codebase.
  - Replaces Tailwind arbitrary color classes like `text-[#xxxxxx]` with `text-<semantic>` (e.g., text-text-primary)
  - Replaces inline style string literals (color/backgroundColor/borderColor) with semanticColors.<path>
  - Adds named import for semanticColors when needed

  Usage:
    node scripts/apply_semantic_colors.js           # dry run (prints summary)
    WRITE=1 node scripts/apply_semantic_colors.js   # apply changes
*/

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const WRITE = process.env.WRITE === '1' || process.argv.includes('--write');

// semantic mapping by canonical hex (uppercase #RRGGBB)
const STYLE_MAP = new Map(Object.entries({
  '#7A4AE2': { any: 'brand.primary' },
  '#FFFFFF': { color: 'text.inverse', backgroundColor: 'surface.background', borderColor: 'border.default', any: 'surface.background' },
  '#000000': { color: 'text.primary', backgroundColor: 'surface.inverse', borderColor: 'border.strong', any: 'text.primary' },
  '#333333': { color: 'text.secondary', borderColor: 'border.strong', any: 'text.secondary' },
  '#7C7C7C': { color: 'text.muted', any: 'text.muted' },
  '#AEAEAE': { color: 'text.disabled', borderColor: 'border.default', any: 'text.disabled' },
  '#A892D7': { any: 'brand.accent' },
  '#9747FF': { any: 'brand.secondary' },
  '#49386E': { any: 'brand.deep' },
  '#FF0000': { any: 'state.error' },
  '#FFB02E': { any: 'state.warning' },
  '#80FF80': { any: 'state.success' },
  '#0000FF': { any: 'state.info' },
  '#F70A8D': { any: 'state.attention' },
}));

// class prefix → style key mapping preference
const CLASS_PREF = {
  text: 'color',
  bg: 'backgroundColor',
  border: 'borderColor',
};

function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }

// lazy-loaded canonical mapping from color-map.json
let COLOR_MAP = null;
function loadColorMap() {
  if (COLOR_MAP) return COLOR_MAP;
  const mapPath = path.join(ROOT, 'src/shared/constants/color-map.json');
  if (fs.existsSync(mapPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      COLOR_MAP = json;
    } catch (e) {
      COLOR_MAP = null;
    }
  }
  return COLOR_MAP;
}

function parseColorToken(token) {
  if (!token) return null;
  if (typeof token !== 'string') return null;
  const t = token.trim();
  if (t.startsWith('#')) return hexToHex6(t);
  if (/^white$/i.test(t)) return '#FFFFFF';
  if (/^black$/i.test(t)) return '#000000';
  return null; // skip rgba/hsla/others for now
}

function hexToHex6(hex) {
  const s = hex.slice(1);
  if (s.length === 3) {
    const r = s[0] + s[0], g = s[1] + s[1], b = s[2] + s[2];
    return `#${r}${g}${b}`.toUpperCase();
  }
  if (s.length === 4) {
    const r = s[0] + s[0], g = s[1] + s[1], b = s[2] + s[2];
    return `#${r}${g}${b}`.toUpperCase(); // drop alpha
  }
  if (s.length === 6) return `#${s}`.toUpperCase();
  if (s.length === 8) return `#${s.substring(0,6)}`.toUpperCase(); // drop alpha
  return null;
}

function toTwKey(semanticPath) {
  return semanticPath.replace(/\./g, '-');
}

function pickSemanticFor(hex, styleKey) {
  const m = STYLE_MAP.get(hex);
  if (m) return m[styleKey] || m.any || null;
  // try canonical fallback from color-map.json tokenMap
  const cm = loadColorMap();
  if (cm && cm.tokenMap) {
    // search direct key match first (original token could be hex with specific casing)
    if (cm.tokenMap[hex]) {
      const canon = cm.tokenMap[hex];
      const m2 = STYLE_MAP.get(canon.toUpperCase());
      if (m2) return m2[styleKey] || m2.any || null;
    }
    // otherwise, try to find hex variants keys (#fff → #FFF)
    const alt = hex.toLowerCase();
    if (cm.tokenMap[alt]) {
      const canon = cm.tokenMap[alt];
      const m2 = STYLE_MAP.get(canon.toUpperCase());
      if (m2) return m2[styleKey] || m2.any || null;
    }
  }
  // heuristic: very light hex → surface.background; very dark → text.primary
  const rgb = hexToRgb(hex);
  if (rgb) {
    const L = relativeLuminance(rgb);
    if (L > 0.9) return styleKey === 'color' ? 'text.inverse' : 'surface.background';
    if (L < 0.15) return styleKey === 'color' ? 'text.primary' : 'surface.inverse';
  }
  return null;
}

function hexToRgb(hex) {
  const s = hex.slice(1);
  if (s.length !== 6) return null;
  const r = parseInt(s.slice(0,2), 16);
  const g = parseInt(s.slice(2,4), 16);
  const b = parseInt(s.slice(4,6), 16);
  return { r, g, b };
}

function relativeLuminance({ r, g, b }) {
  function lin(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  const R = lin(r), G = lin(g), B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function ensureImportSemanticColors(filePath, code) {
  // Only return early if semanticColors is already imported
  const hasImport = /import\s+[^;]*\bsemanticColors\b[^;]*from\s+['"][^'"]+['"]/m.test(code);
  if (hasImport) return code;
  // find existing import from shared/constants/colors
  const importRe = /import\s+([^;]+)\s+from\s+['"]([^'"]+)['"];?/g;
  let m;
  let updated = code;
  let updatedOnce = false;
  while ((m = importRe.exec(code)) !== null) {
    const full = m[0];
    const spec = m[1];
    const src = m[2];
    if (/shared\/constants\/colors(?:\.ts)?$/.test(src) || src.endsWith('src/shared/constants/colors') || src.endsWith('src/shared/constants/colors.ts') || /\/shared\/constants\/colors(?:\.ts)?$/.test(src)) {
      // augment existing import
      let newImport;
      if (/^\s*\{[\s\S]*\}\s*$/.test(spec)) {
        // named only
        if (!/\bsemanticColors\b/.test(spec)) {
          newImport = full.replace('{', '{ semanticColors, ');
        } else newImport = full;
      } else if (/\{[\s\S]*\}/.test(spec)) {
        // default + named
        if (!/\bsemanticColors\b/.test(spec)) {
          newImport = full.replace(/\}/, ', semanticColors }');
        } else newImport = full;
      } else {
        // default only
        newImport = full.replace(/from/, ', { semanticColors } from');
      }
      updated = updated.replace(full, newImport);
      updatedOnce = true;
      break;
    }
  }
  if (!updatedOnce) {
    // add new import at top
    const rel = path.relative(path.dirname(filePath), path.join(ROOT, 'src/shared/constants/colors')).replace(/\\/g, '/');
    const relNoExt = rel.startsWith('.') ? rel : './' + rel;
    const importLine = `import { semanticColors } from '${relNoExt}';\n`;
    // place after first import or at top
    if (/^import\s/m.test(updated)) {
      updated = updated.replace(/^import[\s\S]*?;\s*/m, (match) => match + importLine);
    } else {
      updated = importLine + updated;
    }
  }
  return updated;
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let original = code;
  let tailwindChanges = 0;
  let styleChanges = 0;

  // Tailwind arbitrary colors → semantic classes
  code = code.replace(/\b!?\b(text|bg|border)-\[#([0-9A-Fa-f]{3,8})\]/g, (m, prefix, hex) => {
    const cHex = parseColorToken('#' + hex);
    if (!cHex) return m;
    const styleKey = CLASS_PREF[prefix] || 'color';
    const semPath = pickSemanticFor(cHex, styleKey);
    if (!semPath) return m;
    tailwindChanges++;
    // preserve leading ! if present
    const bang = m.startsWith('!') ? '!' : '';
    return `${bang}${prefix}-${toTwKey(semPath)}`;
  });

  // Common named classes
  code = code.replace(/\b!?\b(text|bg|border)-(white|black)\b/g, (m, prefix, name) => {
    const cHex = parseColorToken(name);
    if (!cHex) return m;
    const styleKey = CLASS_PREF[prefix] || 'color';
    const semPath = pickSemanticFor(cHex, styleKey);
    if (!semPath) return m;
    tailwindChanges++;
    const bang = m.startsWith('!') ? '!' : '';
    return `${bang}${prefix}-${toTwKey(semPath)}`;
  });

  // Inline style: color/backgroundColor/borderColor
  const styleRe = /([:\{,]\s*)(color|backgroundColor|borderColor)\s*:\s*(["'])(#[0-9A-Fa-f]{3,8}|white|black)\3/g;
  code = code.replace(styleRe, (m, before, key, quote, val) => {
    const cHex = parseColorToken(val);
    if (!cHex) return m;
    const semPath = pickSemanticFor(cHex, key) || pickSemanticFor(cHex, 'any');
    if (!semPath) return m;
    styleChanges++;
    return `${before}${key}: semanticColors.${semPath}`;
  });

  let wrote = false;
  if (styleChanges > 0) {
    code = ensureImportSemanticColors(filePath, code);
  }

  if (code !== original) {
    if (WRITE) {
      fs.writeFileSync(filePath, code, 'utf8');
      wrote = true;
    }
  }

  return { tailwindChanges, styleChanges, wrote };
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git' || ent.name === 'build' || ent.name === '.expo' || ent.name === 'ios' || ent.name === 'android') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile()) {
      const ext = path.extname(p);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) files.push(p);
    }
  }
}

const files = [];
walk(path.join(ROOT, 'src'));
walk(path.join(ROOT, 'app'));

let totalTailwind = 0, totalStyle = 0, changedFiles = 0;
for (const f of files) {
  const { tailwindChanges, styleChanges, wrote } = processFile(f);
  totalTailwind += tailwindChanges;
  totalStyle += styleChanges;
  if (wrote) changedFiles++;
}

const summary = { filesScanned: files.length, tailwindChanges: totalTailwind, styleChanges: totalStyle, changedFiles, write: WRITE };
console.log(JSON.stringify(summary, null, 2));
