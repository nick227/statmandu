# Deployment

Not yet deployed anywhere — this covers the intended path once it is.

## Environment variables

See `.env.example` for all required variables. Never commit `.env` or `.env.test`.

## Server

The Fastify server (`apps/server`) is a standard Node.js process.

```bash
pnpm --filter server build
node apps/server/dist/index.js
```

Recommended hosts: Railway, Render, Fly.io. All support Node.js with a
Dockerfile or buildpack.

## Image storage

Image uploads use one API path and one asset model across local dev, Railway,
athlete profile images, and UGC evidence images. Localhost stores files under
`IMAGE_STORAGE_DIR` and serves them from `/uploads/images/:objectKey`.

For Railway dev, set `IMAGE_STORAGE_DRIVER=r2` and configure `R2_ENDPOINT`,
`R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and
`R2_PUBLIC_BASE_URL`. If R2 is unavailable or not fully configured, the server
falls back to `RAILWAY_VOLUME_MOUNT_PATH/uploads/images`; without a Railway
volume it falls back to local `IMAGE_STORAGE_DIR`.

**Dockerfile (server):**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @statman/db exec prisma generate
RUN pnpm spec:bundle
RUN pnpm --filter server build
EXPOSE 3001
CMD ["node", "apps/server/dist/index.js"]
```

## Client

Not built yet. Planned: React Native (Expo) mobile-first, consuming
`@statman/sdk` exactly as described in `docs/sdk.md`. A web/PWA build can
reuse the same SDK package.

## Database

Push the schema before deploying a new server version:

```bash
pnpm db:push   # dev/staging
# or: pnpm --filter @statman/db exec prisma migrate deploy   # production, once migrations are adopted
```

This project currently uses `prisma db push` (no migration history) —
appropriate for pre-launch iteration. Switch to `prisma migrate` before the
schema needs to evolve against a production dataset with real user data.
