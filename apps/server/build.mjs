import { build } from 'esbuild'
import { readFileSync } from 'node:fs'

const { dependencies } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

// Workspace packages publish TypeScript source. Bundle them into the server;
// keep installed dependencies (including Prisma's native engine) external.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  sourcemap: true,
  external: [...Object.keys(dependencies).filter(name => !name.startsWith('@statman/')), '@prisma/client'],
})
