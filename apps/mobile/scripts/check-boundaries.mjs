import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const appRoot = join(process.cwd())
const sourceRoots = [join(appRoot, 'app'), join(appRoot, 'src')]
const violations = []

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) return walk(path)
    return /\.(ts|tsx)$/.test(path) ? [path] : []
  })
}

function importsFor(file) {
  const text = readFileSync(file, 'utf8')
  const imports = [...text.matchAll(/import( type)? .*? from ['"]([^'"]+)['"]/g)].map((match) => ({
    specifier: match[2],
    typeOnly: Boolean(match[1]),
  }))
  const sideEffects = [...text.matchAll(/import ['"]([^'"]+)['"]/g)].map((match) => ({
    specifier: match[1],
    typeOnly: false,
  }))
  return [...imports, ...sideEffects]
}

function report(file, message) {
  violations.push(`${relative(appRoot, file)}: ${message}`)
}

for (const root of sourceRoots) {
  for (const file of walk(root)) {
    const rel = relative(appRoot, file)
    const imports = importsFor(file)

    if (rel.startsWith('src/shared/')) {
    for (const { specifier } of imports) {
        if (specifier.startsWith('@/modules/')) report(file, `shared code must not import module code (${specifier})`)
        if (specifier === '@statman/sdk') report(file, 'shared code must not import @statman/sdk')
      }
    }

    if (rel.startsWith('app/')) {
      for (const { specifier } of imports) {
        if (specifier.startsWith('@/shared/ui/') || specifier.startsWith('@/shared/layout/')) {
          report(file, `routes should render module screens instead of shared UI/layout directly (${specifier})`)
        }
      }
    }

    for (const { specifier } of imports) {
      if (specifier.startsWith('@/features/') || specifier.startsWith('@/components/')) {
        report(file, `stale import path (${specifier})`)
      }
    }

    const base = rel.split('/').pop() ?? ''
    const canUseSdk = rel.startsWith('src/modules/') && (base.startsWith('use') || base.startsWith('Connected'))
    const hasRuntimeSdkImport = imports.some(({ specifier, typeOnly }) => specifier === '@statman/sdk' && !typeOnly)
    const isSdkInfrastructure = rel === 'src/lib/sdk.ts'
    if (hasRuntimeSdkImport && !canUseSdk && !isSdkInfrastructure) {
      report(file, 'SDK imports belong in use*.ts hooks or Connected*.tsx components')
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('mobile boundaries ok')
