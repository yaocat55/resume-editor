import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgPath = resolve(__dirname, '../package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

// Get current version
const [major, minor, patch] = (pkg.version || '0.0.0').split('.').map(Number)

// Bump patch version
const nextVersion = `${major}.${minor}.${patch + 1}`

// Ask user
console.log(`\n  Current version: v${pkg.version}`)
console.log(`  Next version:    v${nextVersion}`)
console.log()

import { createInterface } from 'readline'
const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question(`  Press Enter to release v${nextVersion}, or type custom version: `, (answer) => {
  rl.close()
  const tag = answer.trim() || nextVersion
  const fullTag = `v${tag.replace(/^v/, '')}`

  console.log(`\n  Releasing ${fullTag}...`)

  try {
    // Update package.json version
    pkg.version = fullTag.replace(/^v/, '')
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')

    // Git operations
    execSync('git add package.json', { stdio: 'inherit' })
    execSync(`git commit -m "chore: bump version to ${fullTag}"`, { stdio: 'inherit' })
    execSync(`git tag ${fullTag}`, { stdio: 'inherit' })
    execSync('git push', { stdio: 'inherit' })
    execSync(`git push origin ${fullTag}`, { stdio: 'inherit' })

    console.log(`\n  ✅ Released ${fullTag}`)
    console.log(`  ➜  https://github.com/yaocat55/resume-editor/actions\n`)
  } catch (e) {
    console.error(`\n  ❌ Failed: ${e.message}\n`)
    process.exit(1)
  }
})
