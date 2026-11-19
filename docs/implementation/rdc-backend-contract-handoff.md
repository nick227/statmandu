# RARE Studio backend contract handoff

## Data boundary

`CardTemplate` is now the reusable design, physically stored in `CardDesign`.
`CardRelease` maps to the existing physical `CardTemplate` table. Historical
releases retain their IDs and have null design references; migration does not
invent designs or copy issues. Issue, save, download and generation-job foreign
keys remain physically `cardTemplateId`, exposed internally as `releaseId`.
Historical origin/issue hashes and unknown publisher attribution are untouched.
Sports tables and relationships remain available and optional.

`Storefront.userId` is unique. Existing users receive catalog rows during migration;
registration creates one atomically with the account. Imported accounts are
provisioned lazily. A storefront currently represents a public creator catalog,
with `commerceEnabled: false`; it is not a payment or trading account.

## API contracts for Antigravity

The committed OpenAPI sources and generated `packages/sdk/src/generated/types.ts`
are authoritative. Existing `/cards` endpoints still address releases.

| Endpoint | Contract |
| --- | --- |
| `POST /card-designs` | Authenticated creator; title and versioned composition |
| `GET /card-designs` | Creator's active designs, newest updated first, maximum 100 |
| `GET /card-designs/{designId}` | Creator/admin only |
| `PATCH /card-designs/{designId}` | Requires `expectedRevision`; title, composition, or archive; conflicts return 409 |
| `POST /releases` | Creator-owned design, `expectedRevision`, `personProfileId`, title, edition settings, `requestId`; optional source image |
| `GET /releases/{releaseId}` | Public published release or creator/admin |
| `POST /releases/{releaseId}/generate` | Existing generation pipeline, using captured identity; job records include design snapshot |
| `POST /releases/{releaseId}/publish` | Existing community authorization and immutable publication snapshot |
| `POST /releases/{releaseId}/issues` | Existing atomic issuance; independent numbering within each release |
| `POST /releases/{releaseId}/archive` | Creator/admin withdrawal, retaining provenance and issues |
| `GET /me/storefront` | Authenticated account's catalog settings |
| `PATCH /me/storefront` | Set nullable description, maximum 2,000 characters |
| `GET /storefronts/{username}` | Public profile-based catalog metadata, no account secrets |
| `GET /storefronts/{username}/releases` | Published/public releases only; cursor pagination, limit 1–50 |

Existing `/card-saves`, collection, download and authenticity APIs remain in use.
Their legacy `cardTemplateId` means release ID. Issue/save DTOs additionally expose
`releaseId`. `CARD_RELEASE` normalizes to stored `CARD_TEMPLATE`; `CARD_DESIGN` is a
separate private target supported by the design/image APIs, not generic social
or media attachment APIs.

## Composition and release workflow

A minimal design request:

```json
{
  "title": "Creator portrait",
  "composition": {
    "schemaVersion": 1,
    "canvas": { "width": 600, "height": 900 },
    "layers": [
      { "id": "name", "type": "TEXT", "x": 20, "y": 20,
        "width": 560, "height": 100, "personField": "displayName" }
    ]
  }
}
```

Layers are ordered back-to-front: `TEXT`, owned-asset `IMAGE`, and filled
`RECTANGLE`. Coordinates are canvas pixels; bounds must fit. Up to 100 layers,
256 KB composition, canvas dimensions 1–4096. Text accepts either literal text or
one of `displayName`, `bio`, `hometown`. Bindings resolve when creating a release
and are capped at 4,000 characters. Render text as plain text, never HTML. Fills
are hex colors; there are no executable expressions or arbitrary external URLs.

1. Save a design and preview its returned revision.
2. Create a release with a unique creator-scoped `requestId`. A retry of the same
   payload returns the same release, even if the design has since changed. Reuse
   with different input returns 409. Concurrent retries create one release.
3. Preview **`templateSnapshot.composition`**, not the current mutable design.
   The snapshot captures resolved text, person data and selected asset references.
4. Generate artwork if wanted, then publish with the existing edition options.
   Publish captures artwork and provenance; issued copies use the shared release
   content plus their individual number. Design edits never update releases.
5. Refresh the creator catalog; draft/private/archived releases do not appear.

The backend stores and validates compositions. The existing image generator
produces artwork; it does not rasterize the layer document. Antigravity owns the
versioned layer renderer, preview, editor, number overlay, and download/export
composition. Use `rendererVersion: rdc-composition-v1` and the frozen snapshot for
published display/export. Do not render an earlier release from the live design.
If server-side flattened exports become required, add a renderer to the existing
generation pipeline rather than introducing a second issuance system.

Images uploaded to `CARD_DESIGN` remain private. Only assets explicitly selected
in a public published release snapshot can be served publicly through the image
proxy. Unselected source images remain private; archiving removes that release's
public access grant. Authenticated image requests must carry the existing session
credentials. Asset object keys are retained; origin/issue hashes are provenance
hashes, not cryptographic signatures or independent verification of facts.

Official publishing remains disabled. A claim does not automatically grant it;
reviewed/revocable publishing authority and verified signing remain separate
future work. Existing single-owner claim semantics are preserved.

## Compatibility and checkpoint

Continue refactoring: the acceptance path uses one existing generation service,
one publication service, one issue allocator and existing collection/download
infrastructure. No principal subsystem replacement was needed for this step.
Compatibility is localized to Prisma table/column mappings, `/cards` aliases,
legacy DTO IDs, stored polymorphic targets and the existing job input name.
Nullable design references preserve historical releases without fabricated data.
The design model, release orchestration, composition validation and storefront
catalog are new RDC functionality, not compatibility implementations.

This is structural evidence, not a measured comparison against an implemented
rewrite. No reliable cumulative engineering-time log exists for the preceding
sessions; do not treat the earlier coupling score as elapsed cost or claim a
proven dollar saving. Reassess the image-generation subsystem when deterministic
flattened exports and verified signatures have concrete requirements.

## Migration and validation

Apply the additive `20261118020000_designs_releases_storefronts` migration after
MR1/MR2 migrations, generate Prisma, and deploy matching backend/SDK artifacts.
No production migration or deployment was performed here. Keep additive tables
on rollback; older applications will not understand new design-derived releases.
Retain MR1/MR2 security fixes and the private-bucket rollout requirements in the
MR2 checkpoint.

Validation includes a populated legacy migration fixture, existing backend suite,
and `studio.test.ts` for independent numbering, immutable snapshots/hashes,
creator permissions, revision conflicts, retry concurrency, private media and
catalog pagination. Run database-resetting checks sequentially against
`statman_test`; simultaneous test processes invalidate their results.

Verified for this implementation: **25 server test files / 210 tests passed**,
workspace typechecking passed, OpenAPI lint passed, and SDK drift check passed.
The migration fixture creates saves, downloads, ownership and an approved claim
before design/release extraction, then checks their original relationships. It
also covers maximum-length account IDs in storefront backfill. The first
concurrent-database attempts were discarded; the sequential runs are the evidence.
