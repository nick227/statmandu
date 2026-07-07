# Technical Specifications Sheet

## Frontend

- Client: React Native Web / PWA first.
- Routing: dynamic route structure for entities and app surfaces.
- State: React Query for REST resources, WebSocket client for live rooms.
- Design system: reusable primitives and product-aware primitives.
- Media: YouTube embeds/links first; no direct hosting in MVP.

## Backend

- API contract: OpenAPI YAML, split by domain.
- Generated code: CRUD controllers, validation, SDK methods, query hooks.
- Realtime: WebSocket rooms for live games, presence, event streams, spectator updates.
- Event model: raw game events stored first; final stats derived later.
- Database: relational schema recommended for players, teams, games, events, stats, disputes.

## Contract organization

```txt
packages/contracts/openapi/root.yaml
packages/contracts/openapi/components/*
packages/contracts/openapi/paths/*
packages/contracts/realtime/*
packages/sport-config/*
packages/sdk/*
```

## Performance budgets

- First screen mobile load: target under 2.5s on common mobile network.
- Entity profile media should lazy-load below the first viewport.
- Feed should use pagination/infinite loading.
- SmartImage should select correct size, lazy load, preserve aspect ratio, and show placeholders.
- Live event latency target: under 500ms for accepted event broadcast under normal conditions.

## Offline support

- Live scoring should queue events locally.
- Events should include client timestamp, device/session ID, reporter ID.
- Sync status must be visible.
- Reconciliation should tolerate delayed reporter logs.

## Browser/device support

- Modern mobile Safari.
- Modern Chrome Android.
- Modern desktop Chrome/Firefox/Safari/Edge.
- PWA installable where available.
