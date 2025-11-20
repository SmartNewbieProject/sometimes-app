#!/usr/bin/env node
// Cluster near-duplicate colors across the repo and print consolidated values.
// - Collects hex (#RGB, #RGBA, #RRGGBB, #RRGGBBAA), rgba(), hsla(), and named colors (white, black, transparent)
// - Converts to sRGB and Lab, clusters by CIE76 deltaE threshold
// - Prints canonical colors (most frequent in each cluster) in #RRGGBB

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// ---------- Utils: parsing colors ----------
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }

function hexToRgba(hex) {
  const s = hex.slice(1);
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return { r, g, b, a: 1 };
  }
  if (s.length === 4) { // #RGBA
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    const a = parseInt(s[3] + s[3], 16) / 255;
    return { r, g, b, a };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }
  if (s.length === 8) { // #RRGGBBAA
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    const a = parseInt(s.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  return null;
}

function parseRgbFunc(str) {
  // rgba(122, 74, 226, 0.25)
  const m = str.match(/^rgba?\(([^\)]*)\)$/i);
  if (!m) return null;
  const parts = m[1].split(',').map(s => s.trim());
  let [r, g, b, a] = [0, 0, 0, 1];
  const parseComp = c => c.endsWith('%') ? clamp(Math.round(parseFloat(c) * 2.55), 0, 255) : clamp(parseInt(c, 10), 0, 255);
  if (parts.length >= 3) {
    r = parseComp(parts[0]);
    g = parseComp(parts[1]);
    b = parseComp(parts[2]);
    if (parts.length >= 4) a = clamp(parseFloat(parts[3]), 0, 1);
  }
  return { r, g, b, a };
}

function parseHslFunc(str) {
  // hsla(270, 100%, 50%, 0.5)
  const m = str.match(/^hsla?\(([^\)]*)\)$/i);
  if (!m) return null;
  const parts = m[1].split(',').map(s => s.trim());
  if (parts.length < 3) return null;
  let h = parseFloat(parts[0]);
  let s = parts[1].endsWith('%') ? parseFloat(parts[1]) / 100 : parseFloat(parts[1]);
  let l = parts[2].endsWith('%') ? parseFloat(parts[2]) / 100 : parseFloat(parts[2]);
  let a = 1;
  if (parts.length >= 4) a = clamp(parseFloat(parts[3]), 0, 1);

  // hsl -> rgb
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m_ = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const r = Math.round((r1 + m_) * 255);
  const g = Math.round((g1 + m_) * 255);
  const b = Math.round((b1 + m_) * 255);
  return { r, g, b, a };
}

function toHex6({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// ---------- Color space conversions (sRGB -> Lab) ----------
function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToXyz({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  // sRGB D65
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
  return { X: X * 100, Y: Y * 100, Z: Z * 100 };
}

function xyzToLab({ X, Y, Z }) {
  // D65 reference white
  const refX = 95.047, refY = 100.0, refZ = 108.883;
  let x = X / refX, y = Y / refY, z = Z / refZ;
  const eps = 216 / 24389, k = 24389 / 27;
  const f = (t) => t > eps ? Math.cbrt(t) : (k * t + 16) / 116;
  const fx = f(x), fy = f(y), fz = f(z);
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  return { L, a, b };
}

function rgbToLab(rgb) { return xyzToLab(rgbToXyz(rgb)); }

function deltaE76(lab1, lab2) {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// ---------- Collect colors from repo ----------
function collectTokens() {
  const roots = ['app', 'src', 'assets', 'global.css', 'tailwind.config.js', 'app.json'];
  const ignoreDirs = new Set(['node_modules', 'dist', '.git', 'build', '.expo', 'ios', 'android']);
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.svg', '.json', '.md', '.mjs', '.cjs']);
  const hexRe = /#[0-9A-Fa-f]{3,8}\b/g;
  const funcRe = /(rgba?|hsla?)\([^\)]*\)/gi;
  const namedRe = /(?<![\w-])(white|black|transparent)(?![\w-])/gi;
  const tokens = [];

  function walk(p) {
    let stat;
    try { stat = fs.statSync(p); } catch { return; }
    if (stat.isDirectory()) {
      const name = path.basename(p);
      if (ignoreDirs.has(name)) return;
      for (const entry of fs.readdirSync(p)) walk(path.join(p, entry));
    } else if (stat.isFile()) {
      const ext = path.extname(p);
      if (!exts.has(ext) && !roots.includes(p)) return;
      let txt = '';
      try { txt = fs.readFileSync(p, 'utf8'); } catch { return; }
      let m;
      while ((m = hexRe.exec(txt)) !== null) tokens.push(m[0]);
      while ((m = funcRe.exec(txt)) !== null) tokens.push(m[0]);
      let n;
      while ((n = namedRe.exec(txt)) !== null) tokens.push(n[0]);
    }
  }

  for (const r of roots) walk(r);
  return tokens;
}

function tokenToRgba(token) {
  if (!token) return null;
  if (token[0] === '#') return hexToRgba(token);
  const lower = token.toLowerCase();
  if (lower.startsWith('rgb')) return parseRgbFunc(lower);
  if (lower.startsWith('hsl')) return parseHslFunc(lower);
  if (lower === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (lower === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (lower === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

function normalizeOpaqueHex(token) {
  const rgba = tokenToRgba(token);
  if (!rgba) return null;
  return toHex6(rgba);
}

function buildPoints(tokens) {
  // Aggregate counts for each concrete token
  const tokenCounts = new Map();
  for (const t of tokens) tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);

  // Build color points keyed by exact RGB (ignoring alpha for clustering)
  const points = [];
  const zeroAlphaTokens = [];
  for (const [token, count] of tokenCounts.entries()) {
    const rgba = tokenToRgba(token);
    if (!rgba) continue;
    // skip fully transparent (any rgb) for clustering of RGB; collect tokens separately
    if (rgba.a === 0) { zeroAlphaTokens.push({ token, count }); continue; }
    const key = `${rgba.r},${rgba.g},${rgba.b}`;
    points.push({ token, count, rgb: { r: rgba.r, g: rgba.g, b: rgba.b }, lab: rgbToLab({ r: rgba.r, g: rgba.g, b: rgba.b }) });
  }
  return { points, zeroAlphaTokens };
}

function cluster(points, threshold = 6.5) {
  // Greedy single-linkage: iterate by frequency, assign to existing cluster if within threshold of any member
  const sorted = [...points].sort((a, b) => b.count - a.count);
  const clusters = [];
  for (const p of sorted) {
    let assigned = false;
    for (const c of clusters) {
      // if p is close to any member, add to this cluster
      let close = false;
      for (const m of c.members) {
        const d = deltaE76(p.lab, m.lab);
        if (d <= threshold) { close = true; break; }
      }
      if (close) {
        c.members.push(p);
        c.totalCount += p.count;
        assigned = true;
        break;
      }
    }
    if (!assigned) clusters.push({ members: [p], totalCount: p.count });
  }
  // Pick canonical color = member with highest count within cluster
  for (const c of clusters) {
    c.members.sort((a, b) => b.count - a.count);
    c.canonical = c.members[0];
    c.hex = toHex6(c.canonical.rgb);
  }
  // Sort clusters by total frequency desc
  clusters.sort((a, b) => b.totalCount - a.totalCount);
  return clusters;
}

function main() {
  const tokens = collectTokens();
  const { points, zeroAlphaTokens } = buildPoints(tokens);
  const threshold = process.env.THRESHOLD ? parseFloat(process.env.THRESHOLD) : 6.5;
  const clusters = cluster(points, threshold);

  // Consolidated palette: unique canonical hex values with summed counts
  const out = clusters.map(c => ({ hex: c.hex, count: c.totalCount }));
  // Merge any duplicates (can happen if canonical from different clusters matches same hex)
  const merged = new Map();
  for (const { hex, count } of out) merged.set(hex, (merged.get(hex) || 0) + count);
  const list = [...merged.entries()].map(([hex, count]) => ({ hex, count })).sort((a, b) => b.count - a.count);

  const args = new Set(process.argv.slice(2));
  if (args.has('--json')) {
    const tokenMap = {};
    for (const c of clusters) {
      for (const m of c.members) tokenMap[m.token] = c.hex;
    }
    for (const z of zeroAlphaTokens) tokenMap[z.token] = 'transparent';
    const json = {
      threshold,
      canonical: list,
      tokenMap,
    };
    process.stdout.write(JSON.stringify(json, null, 2));
  } else {
    for (const item of list) {
      console.log(`${item.hex}\t${item.count}`);
    }
  }
}

main();
