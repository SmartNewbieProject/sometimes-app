#!/usr/bin/env node
// Ensure files that use semanticColors have the proper import added.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function walk(dir, out=[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git' || e.name === 'build' || e.name === '.expo' || e.name === 'ios' || e.name === 'android') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) {
      const ext = path.extname(p);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) out.push(p);
    }
  }
  return out;
}

function ensureImport(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (!/semanticColors\./.test(code)) return false;
  if (/import\s+[^;]*\bsemanticColors\b[^;]*from\s+['"][^'"]+['"]/m.test(code)) return false;

  // try to augment existing import from colors
  const importRe = /import\s+([^;]+)\s+from\s+['"]([^'"]+)['"];?/g;
  let m;
  let updated = code;
  while ((m = importRe.exec(code)) !== null) {
    const full = m[0];
    const spec = m[1];
    const src = m[2];
    if (/shared\/constants\/colors(?:\.ts)?$/.test(src) || src.endsWith('src/shared/constants/colors') || src.endsWith('src/shared/constants/colors.ts') || /\/shared\/constants\/colors(?:\.ts)?$/.test(src)) {
      let newImport;
      if (/^\s*\{[\s\S]*\}\s*$/.test(spec)) {
        if (!/\bsemanticColors\b/.test(spec)) newImport = full.replace('{', '{ semanticColors, ');
        else newImport = full;
      } else if (/\{[\s\S]*\}/.test(spec)) {
        if (!/\bsemanticColors\b/.test(spec)) newImport = full.replace(/\}/, ', semanticColors }');
        else newImport = full;
      } else {
        newImport = full.replace(/from/, ', { semanticColors } from');
      }
      updated = updated.replace(full, newImport);
      fs.writeFileSync(filePath, updated, 'utf8');
      return true;
    }
  }

  // add new import line at top if not found
  const rel = path.relative(path.dirname(filePath), path.join(ROOT, 'src/shared/constants/colors')).replace(/\\/g, '/');
  const relNoExt = rel.startsWith('.') ? rel : './' + rel;
  const importLine = `import { semanticColors } from '${relNoExt}';\n`;
  if (/^import\s/m.test(code)) {
    const firstImportStart = code.indexOf('import ');
    const newCode = code.slice(0, firstImportStart) + importLine + code.slice(firstImportStart);
    fs.writeFileSync(filePath, newCode, 'utf8');
  } else {
    fs.writeFileSync(filePath, importLine + code, 'utf8');
  }
  return true;
}

const files = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'app'))];
let count = 0;
for (const f of files) {
  if (ensureImport(f)) count++;
}
console.log(JSON.stringify({ files: files.length, modified: count }, null, 2));
