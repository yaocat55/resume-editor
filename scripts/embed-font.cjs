/**
 * Embed PingFang SC font into pdf.ts as base64
 *
 * Usage:
 *   1. Download PingFang SC Regular .ttf to scripts/PingFangSC-Regular.ttf
 *      You can get it from macOS /System/Library/Fonts/PingFang.ttc
 *      Or download from: https://github.com/nicadre/nice-fonts/raw/main/fonts/PingFangSC-Regular.ttf
 *   2. Run: node scripts/embed-font.cjs
 *   3. Rebuild: npm run build
 */

const fs = require('fs')
const path = require('path')

const fontPath = path.join(__dirname, 'PingFangSC-Regular.ttf')
if (!fs.existsSync(fontPath)) {
  console.error('Font file not found:', fontPath)
  console.error('Please download PingFang SC Regular .ttf to scripts/PingFangSC-Regular.ttf')
  console.error('Then re-run: node scripts/embed-font.cjs')
  process.exit(1)
}

const fontData = fs.readFileSync(fontPath).toString('base64')
console.log(`Font loaded: ${(fontData.length / 1024).toFixed(0)} KB base64`)

const pdfPath = path.join(__dirname, '..', 'src', 'features', 'export', 'pdf.ts')
let pdfSource = fs.readFileSync(pdfPath, 'utf-8')

// Replace the FONT_DATA placeholder
const marker = "const FONT_DATA = ''"
if (!pdfSource.includes(marker)) {
  console.error('FONT_DATA marker not found in pdf.ts')
  process.exit(1)
}

pdfSource = pdfSource.replace(marker, `const FONT_DATA = '${fontData}'`)
fs.writeFileSync(pdfPath, pdfSource, 'utf-8')

console.log('✓ Font embedded into src/features/export/pdf.ts')
console.log('  Now run: npm run build')
