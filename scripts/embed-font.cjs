/**
 * Embed Noto Sans SC font into pdf.ts as base64
 *
 * Usage:
 *   1. Place NotoSansSC-Regular.ttf in scripts/
 *      Download from Fontsource or convert from woff2 with fonttools
 *   2. Run: node scripts/embed-font.cjs
 *   3. Rebuild: npm run build
 */

const fs = require('fs')
const path = require('path')

const fontPath = path.join(__dirname, 'NotoSansSC-Regular.ttf')
if (!fs.existsSync(fontPath)) {
  console.error('Font file not found:', fontPath)
  console.error('Place NotoSansSC-Regular.ttf in scripts/')
  console.error('Then re-run: node scripts/embed-font.cjs')
  process.exit(1)
}

const fontData = fs.readFileSync(fontPath).toString('base64')
console.log(`Font loaded: ${(fontData.length / 1024).toFixed(0)} KB base64`)

const pdfPath = path.join(__dirname, '..', 'src', 'features', 'export', 'pdf.ts')
let pdfSource = fs.readFileSync(pdfPath, 'utf-8')

// Replace any existing FONT_DATA value back to empty placeholder first
const markerRegex = /const FONT_DATA = '.*'/
const importRegex = /import \{ FONT_DATA \} from '\.\/fontData'/
if (!markerRegex.test(pdfSource) && !importRegex.test(pdfSource)) {
  console.error('FONT_DATA marker not found in pdf.ts')
  process.exit(1)
}

// Reset any existing FONT_DATA to empty
pdfSource = pdfSource.replace(markerRegex, "const FONT_DATA = ''")
// Replace import with inline const
pdfSource = pdfSource.replace(importRegex, `const FONT_DATA = '${fontData}'`)
fs.writeFileSync(pdfPath, pdfSource, 'utf-8')

console.log('✓ Font embedded into src/features/export/pdf.ts')
// Also update fontData.ts for imagePdf.ts
const fontDataPath = path.join(__dirname, '..', 'src', 'features', 'export', 'fontData.ts');
const fontDataContent = `/**
 * Noto Sans SC Regular — base64 encoded TTF
 * Generated from scripts/NotoSansSC-Regular.ttf by embed-font.cjs
 * Shared by pdf.ts (pdfmake) and imagePdf.ts (pdf-lib)
 */
export const FONT_DATA = '${fontData}'
`;
fs.writeFileSync(fontDataPath, fontDataContent, 'utf-8');
console.log('✓ fontData.ts updated for imagePdf.ts');

console.log('  Now run: npm run build')
