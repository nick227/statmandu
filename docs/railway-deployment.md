# Railway deployment

Project: `sports-card-platform`, production environment.

## Services

- **web** (formerly mobile): Expo / React Native Web production export from
  `apps/mobile`, served by a Node HTTP server. Desktop and mobile browsers use
  https://sports-card-platform.up.railway.app. Deep links fall back to index.html.
  `/api/*` proxies to the API so browser session cookies remain first-party.
- **server**: Fastify API, built as a Node bundle including workspace packages.
  Public API: https://server-production-dce0505e.up.railway.app.
  Native iOS/Android builds use this URL directly with bearer-token auth.
- **MySQL**: existing MySQL 8 database with its existing persistent volume.
- **server-images**: persistent volume mounted on the API at `/data` for uploads
  and generated images. Keep one API replica while using filesystem storage.

The source app is React Native with Expo Router and React Native Web. There is
no need for a fourth Railway service or a duplicate frontend codebase. Native
binaries are built separately with Expo EAS / native toolchains and distributed
through app stores or internal distribution; Railway serves the web app and API.

## Build configuration

Both services use the repository root so shared workspace packages are available.
The GitHub source remains `nick227/statmandu`, branch `main`.

| Service | Build | Start | Pre-deploy | Health |
| --- | --- | --- | --- | --- |
| web | `pnpm build:web` | `pnpm --filter mobile start:web` | — | `/` |
| server | `pnpm build:server` | `pnpm --filter server start` | `pnpm db:migrate:deploy` | `/health` |

Builds explicitly generate OpenAPI and SDK or Prisma artifacts. The server
bundles internal TypeScript workspace packages and leaves installed dependencies
external. No Expo development server runs in production. Node 22 is pinned in
Railway. Watch patterns include each app, its shared packages, root package and
lockfiles, workspace configuration, and base TypeScript configuration.

These settings are saved directly on Railway. Railway's legacy per-service
`railway.json` configuration is deprecated; do not add it as a second source of
truth. Commit the application changes before relying on subsequent GitHub builds.
Local `railway up` deployments upload the working tree and do not push GitHub.
`.railwayignore` excludes local env files, dependencies, build output and media.

## Variables

Both app services: `NODE_ENV=production`, `PORT=3001`, `RAILPACK_NODE_VERSION=22`.

web:

- `EXPO_NO_DOTENV=1`
- `EXPO_PUBLIC_API_URL=https://sports-card-platform.up.railway.app/api`
- `API_UPSTREAM=https://server-production-dce0505e.up.railway.app`

server:

- `DATABASE_URL=${{MySQL.MYSQL_URL}}`
- `CORS_ORIGIN=https://sports-card-platform.up.railway.app`
- `FRONTEND_URL=https://sports-card-platform.up.railway.app`
- `PUBLIC_BASE_URL=https://server-production-dce0505e.up.railway.app`
- `IMAGE_STORAGE_DIR=/data/uploads/images`

`EXPO_PUBLIC_API_URL` is compiled into the client: changing it requires a rebuild.
Use the public API URL (without `/api`) for native production builds. Configure
`GEMINI_API_KEY` and `API_SPORTS_KEY` on the API if their integrations are needed;
without the Gemini key, the existing application uses its stub image generator.
Never put provider secrets in `EXPO_PUBLIC_*` variables.

## Releases and verification

Push committed code to main for GitHub automatic deployments, or deploy the
working tree explicitly with `railway up --service web --environment production`
and the corresponding command for `server`. Check the resulting deployment IDs
reach SUCCESS; successful upload alone is not deployment success.

Run `pnpm install --frozen-lockfile`, `pnpm build:server`, `pnpm build:web` (with
the production public API URL), and `pnpm --filter mobile test:web` locally.
Verify the website, a deep link, `/api/health`, and a database-backed route such
as `/api/sports`. Database migrations run before API startup; never use
`db:push` or reset commands for production deployment. Demo seeds are not run
automatically. A new database starts empty until intentional data setup/import.

## Initial rollout verification (2026-11-18)

The API deployed successfully and applied both checked-in migrations. Health,
sports, players, games, and both discovery routes responded successfully against
the Railway database. Desktop and mobile Chromium checks rendered the app and
athlete deep link without JavaScript startup errors. The hosting test exercises
SPA fallback plus proxy request bodies, response cookies, health and API errors.

The application database initially contains no sports, athletes, teams, or demo
users. Development fixture seeds intentionally reject production; provision real
reference data and an administrator separately before opening registration to a
wider audience. Provider integrations remain subject to their configured keys.
