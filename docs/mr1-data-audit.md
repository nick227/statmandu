# MR1 audit: general people and collectible cards

Date: 2026-11-18. Baseline: working tree based on `45072f7`, including existing
uncommitted work. Scope: static source inspection before any pivot migration.
Companion: [approved data roadmap](data-roadmap.md).

## Finding

Proceed with focused refactoring. The person table already exists independently
of `Player`; card issuance, saves, downloads, and the generation executor have
reusable implementations. Sports coupling is concentrated in identity entry
points, queries/contracts, generation presets, and permissions. This is a static
assessment, not a passing runtime proof or a cost estimate.

The most consequential findings are authorization boundaries, not table count:

- `PlayerService.create` sets `claimedByUserId` directly. That field alone cannot
  prove official publishing authority. Preserve legacy control without upgrading
  it to verified authority; support review of an existing controller's claim.
- Manual draft creation and creator publishing are already possible in
  `CardService`, while batch generation requires subject control. MR2 must unify
  these as explicit community permissions rather than wait for MR3.
- `requireOwner` lets the subject controller edit/publish another creator's card.
  `listCardsForAthlete` and the image handler also expose private content through
  subject control. General community cards must remove those shortcuts.
- Batch retry lookup is scoped to subject and request ID, not creator. Broadening
  batch access without changing this could return another user's private batch.
- `ClaimService` supports pending approval/rejection but no revocation. Its initial
  pending check is outside the transaction; implement conditional transitions and
  a shared publication/revocation locking protocol before official publishing.

## Dependency register

Paths below are repository-relative. Method names identify the inspected seam.
Adapt means preserve the model or algorithm while changing its boundary. Retain
means keep it in the optional sports module. New means an absent capability.

| Area and source | Current coupling | Required treatment | MR |
| --- | --- | --- | --- |
| `packages/db/prisma/schema.prisma`: AthleteProfile, User, Claim | Required name parts; unique controller; claims point to athlete identity | Adapt logical naming with mappings; add display name; preserve IDs and both controller uniqueness constraints | 1 |
| `apps/server/src/services/PlayerService.ts`: create/get/update/list | Sport required for creation; nested player creation; implicit claim on create; names and profile edits through player | New general person service/route; retain player service as sports adapter; never grant verified authority on creation | 1 |
| `apps/server/src/services/AuthService.ts`: capabilities | Claimed identities projected through `claimedProfile.players`; non-player profile disappears | Return general claimed person independently of optional player attachments | 1 |
| `apps/server/src/lib/athleteProfile.ts` | Athlete-specific helper naming and claim display fields | Adapt helper, preserve account/profile distinction | 1 |
| `apps/server/src/services/ClaimService.ts`, `handlers/claims.ts` | Claim entry requires player ID; no revocation; rejects any already-controlled profile | Add general subject entry point, same-controller verification, conditional review, revocation and revalidation | 1, 3 |
| `apps/server/src/services/VerificationService.ts`: verifyPlayer | Source status updated via player, separate from claim review | Retain sports path; ensure source labels never authorize official publishing | 1, 3 |
| `apps/server/src/services/EntityTargetService.ts`, schema EntityType | Polymorphic targets use `ATHLETE_PROFILE` and sports types | Normalize general person aliases centrally; preserve old target IDs and prevent duplicate social records | 1 |
| `apps/server/src/services/CardService.ts`: CARD_INCLUDE, serializeAthlete, serialize | Joins players/rosters/team; summary uses first player and concatenated names | General person summary and link; optional sports context; remove core dependence on sports joins | 2 |
| Same: createDraftCard, requireCardTargets | Required athlete identity; optional team/game; source image constrained to athlete target | General person FK; optional sports validation isolated; explicit asset access and creator rules | 2 |
| Same: generateBatch | Subject-owner gate, sports registry, basketball fallback; subject-scoped retry and throttling | General presets; creator-scoped retry identity and quotas; private batch isolation | 2 |
| Same: requireOwner, requirePublishPermission, getCard, listCardsForAthlete, getDistribution | Creator/subject powers mixed; list and detail private access differ; subject-wide analytics | Central creator/admin rules for community cards, consistent reads, creator-scoped private analytics | 2 |
| Same: buildGenerationInput; `services/CardImageGenerator.ts` | Required athlete name and sports portrait default | General display name and neutral prompt; retain provider/rendering implementation | 2 |
| Same: publishCard, updateDraftCard, download metadata | Hash contains legacy athlete key/stats; some fields remain mutable after publication; exports use live person/card data | Preserve old hashes; version new snapshot/hash input; freeze displayed publication content; export snapshot rather than live profile | 2 |
| Same: claimCard, saves/download events | Algorithms use card/issue IDs, not game rules | Retain; test concurrency, limits, ownership and idempotency | 2 |
| `apps/server/src/jobs/GenerationExecutor.ts`, cardGenerationReconciler | Executor is task-based; recovery uses card service | Retain executor and jobs; verify persisted old/new generation inputs can resume | 2 |
| `apps/server/src/services/ImageService.ts`, `handlers/images.ts` | Avatar mutation/access via PLAYER; gallery permissions fall through; private card image access admits subject owner | General avatar path; explicit asset ownership/access; do not make community uploads edit another person's identity or expose private sources | 1, 2 |
| `apps/server/src/services/SearchService.ts`, `handlers/discovery.ts` | People discovered as players with roster/team context and sports verification signals | General person discovery; optional sports facets; card discovery works with sports services disabled | 1, 5 |
| `apps/server/src/lib/shareMetadata.ts` | Player-based person metadata and athlete URL/name | General person canonical link and display name; keep legacy redirects | 1, 2 |
| `packages/api-spec/src/{components/schemas,paths}`, root.yaml | Athlete/player/card/claim/auth contracts and target enums | Add general contracts; compatibility adapters; regenerate SDK, never hand-edit generated types | 1–3 |
| `packages/sdk/src/hooks/useCards.ts`, generated/types.ts | Athlete route parameters, query keys and payload types | General person hooks and cache invalidation; legacy adapters | 1, 2 |
| `apps/mobile/src/modules/cards/builder/` | Player-only selector, athlete state, profile-gallery uploads, sports poses and basketball fallback | General selector, neutral preset flow, creator-owned source access | 2 |
| `apps/mobile/src/modules/cards/`: cardDisplay, useCardDetail, CardBack/Face/1A, profile rail/distribution | Athlete summaries/links; default copy implies verified sports context | Render frozen person content; truthful authority labels; limit distribution to authorized scope | 2, 3, 5 |
| `apps/mobile/src/modules/account/`, `modules/players/`, app routes | Capabilities and navigation link through player IDs | General person profile/create/claim destinations; keep sports links contextual | 1, 5 |
| `apps/mobile/src/shared/layout/`, `shared/share/`, feed/leaderboards | Primary games/sports creation and discovery | Card-first navigation and general sharing; retain optional sports views | 5 |
| `packages/sports/src/`, server sports services/imports, seed scripts | Specialized stats, event vocabulary, poses and fixtures | Retain behind optional boundary; extract only general presets; adapt renamed Prisma accessors and add no-sports fixtures | 1, 2 |
| Server/mobile tests and fixtures | Tests encode athlete ownership and sports-only creation | Retain legacy coverage, intentionally replace subject-owner privilege assertions, add acceptance cases below | 1–5 |

`PermissionPolicy.ts` is primarily sports/media policy; it is not currently the
source of card authorization. Audit and change the actual `CardService` checks,
not just that policy class. Also inspect admin/import/seed writers during logical
Prisma renaming: they may retain legitimate sports behavior while requiring new
accessor names. No production data was inspected to infer historical publishers.

The companion [source-reference inventory](mr1-data-audit-inventory.md) lists
matched source paths for implementation follow-through. Search matches include
legitimate sports-only references and generated contracts; they are not all bugs.
Static searches cannot prove the absence of dynamic coupling. The tests below
are the gate, and new dependencies discovered during implementation join this
register before migration approval.

## Acceptance matrix fixed before implementation

All rows are specified, **not executed** for this audit. Existing tests were read,
not run. Use a dedicated test database: this repository's integration setup
truncates tables. Use a deterministic generator stub for acceptance and a separate
provider smoke test when generation integration changes.

| ID | Required observable result | Gate |
| --- | --- | --- |
| A1 | Create/read/update a person with display name only; preserve existing athlete IDs/slugs/cards/claims and sports history through migration/backfill | MR1 |
| A2 | General person appears in account capability output when claimed, person search and canonical share link without Player | MR1 |
| A3 | Old target IDs, media, sources, follows and reactions resolve; aliases cannot produce duplicates; legacy API adapters work | MR1 |
| A4 | Ordinary user creates an unclaimed musician/actor/custom-profession person and their own community draft; generates, publishes, saves, issues, downloads and shares with zero sports rows | MR2 |
| A5 | Another user and subject controller cannot edit/publish/read private community drafts, images, batch retries or private analytics; explicit admin moderation remains | MR2 |
| A6 | Community requests cannot set official status; profile creation and legacy controller fields alone confer no official authority | MR2, MR3 |
| A7 | Concurrent retries do not duplicate generation; actor retry keys do not cross users; concurrent limited-edition claims never over-issue or duplicate numbers; generation recovery works | MR2 |
| A8 | Legacy hash/issue numbers unchanged; profile edits cannot alter published content/artwork/exports; new snapshots carry versions and attribution | MR2 |
| A9 | Existing creators unchanged; unknown legacy publisher stays null; new publisher is authenticated actor, even when different from creator | MR2 |
| A10 | Admin-reviewed claim authorizes official release; pending/rejected/revoked claims and unreviewed legacy control do not; competing approval is atomic | MR3 |
| A11 | Revocation and publication serialize: if revocation wins, publish fails; if publish wins, evidence persists and future publishing fails; revoked control does not clear a newer controller | MR3 |
| A12 | Later claim leaves community cards unchanged; official withdrawal/review retains authority evidence, origin and issued copies; status governs discovery/issuance | MR3 |
| A13 | Multiple/custom pursuits and optional entries work without new profession schema; source verification remains separate from identity authority | MR4 |
| A14 | General UI discovery/create/collect/share works with sports routes/jobs disabled; enabling sports restores historical profile content | MR5 |

MR2 must include the minimal general person selection/UI path for A4; broad
navigation redesign remains MR5. Define asset upload/access for community cards
before A4 is considered complete. Do not silently reuse another user's private
source merely because both cards depict the same person.

## Coupling baseline and decision rule

Assess seven fixed functional units. Score 0 = retain, 1 = adapt existing
boundaries/queries, 2 = replace the unit's principal implementation. Mechanical
renames and new optional features do not count as replacement. Re-score from
actual implementation diffs after MR2; record files, changed behavior, failed
acceptance IDs, and remaining estimated work for each unit.

| Unit | Static forecast | Evidence |
| --- | --- | --- |
| Person identity persistence/access | 1 | Existing independent profile table; new general entry points needed |
| Card creation and serialization | 1 | Existing draft model/service; player joins and display contracts need change |
| Generation orchestration/provider | 1 | Reusable executor/provider; presets/input/permissions need change |
| Authorization and claims | 1 | Existing creator checks and claim reviews; official lifecycle and isolation need extension |
| Publishing and snapshots | 1 | Existing publish/hash flow; immutable general content and authority evidence need extension |
| Issuance and ownership | 0 | Card/issue-based existing implementation |
| Saves, downloads and collection | 1 | Existing stores/queries; metadata and access scopes need adaptation |

Baseline forecast: **6/14 coupling points, 0/7 replacements**. This is a declared
planning rubric, not measured effort or a prediction of elapsed time. Authorization
is the largest uncertainty; missing official functionality is new scope rather
than evidence that the generation or issuance implementation must be replaced.

- Continue reuse when A1–A9 pass and no more than three units need replacement.
- Trigger a clean-core cost comparison if four or more units require replacement,
  or any A1–A9 invariant cannot be satisfied without breaking identity/history.
- A trigger is not automatic approval for a rewrite. Compare remaining engineering
  work for adapting versus rebuilding the same acceptance scope, including legacy
  migration, permissions, tests, and deployment. Record estimates and assumptions;
  choose a clean core only with evidence that it is cheaper or necessary.
- Failing tests pause the relevant MR; they do not by themselves justify a rewrite.

Current decision: proceed to MR1 implementation planning. No database migration,
application change, runtime proof, or production-data backfill has occurred.
