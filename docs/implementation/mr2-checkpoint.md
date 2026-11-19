# MR2 checkpoint — RARE / Rare Digital Collectibles

Date: 2026-11-18 (America/Chicago). Scope: local implementation, not deployment.
Baseline: `45072f7` plus the user's pre-existing uncommitted changes. Existing
hosting/package work was preserved. No production database was migrated.

## Decision

**GO: continue reusing the repository and card infrastructure.**
**NO-GO: keep expanding the combined design/edition model as RDC's permanent core.**

Extract the design/release boundary next using the [RDC workflow](../rare-studio-release-workflow.md).
Keep edition-shaped historical rows as logical releases and introduce an independent
reusable composition model. This is a targeted evolution of one boundary, not a
reason to replace accounts, media, jobs, issuance, saves, or collections.

The no-sports lifecycle and security boundaries are exercised by integration tests,
not just the earlier 6/14 forecast. There is no evidence here that rewriting the
whole application would lower remaining engineering cost. Conversely, no competing
rewrite was implemented or timed: this checkpoint does **not** claim measured dollar
savings or a proven speed ratio against a hypothetical clean build.

## Implemented

Security was the first code workstream:

- Removed subject-owner privileges over another creator's card mutations, private
  lists/images, and private analytics. Source images are creator-scoped.
- Removed raw-user-ID bearer authentication from production optional-auth routes.
  Test-only identity injection now lives in the test harness. Suspended/deleted
  accounts cannot use optional session authentication.
- Prevented generic patch from publishing a card or rewriting published content.
  A constrained archive transition retains publication evidence and issued copies.
- Serialized generation retries and limited-edition issuance, scoped batch keys
  and rate limits to creators, and guarded background writes against publication.
- Added private source uploads, authenticated image proxy delivery, origin-restricted
  native image credentials, and fail-closed private R2 configuration.
- Stopped granting a claim merely by creating a player. Existing controllers remain;
  an existing controller can request reviewed verification without a player record.

MR1 generalized identity:

- `PersonProfile` is the Prisma model over the existing physical `AthleteProfile`
  table. Added display name, aliases, and attributable new-profile authorship.
- Added general create/read/update/search/claim APIs, general account capabilities,
  canonical person links, and normalized polymorphic person target aliases.
- Preserved sports records, stable IDs, claims, and old player API contracts.

MR2 proved the card pipeline:

- Ordinary users can create musicians, actors, or custom people without sports data,
  select/add them in Card Studio, generate neutral portraits, publish community
  cards, save/collect numbered copies, download provenance, and share profiles.
- New publications record creator and publisher independently and capture versioned
  content snapshots. Unknown legacy publishers remain null. Old hashes are retained.
- Existing generation orchestration/provider interfaces, issues, saves, and download
  histories remain in use. No new commerce system or generic statistics engine.
- RARE is the central brand default. Existing package IDs and legacy card wordmarks
  are not globally renamed. New card defaults contain no fabricated basketball stats
  or claim that creator-entered details are independently verified.

Official publishing remains disabled pending MR3's reviewed/revocable authority
and signing work. Pursuit/content modules, full card-first navigation, reusable
layer composition, real storefront catalogs, and commerce are subsequent work.

## Evidence and limits

| Gate | Evidence |
| --- | --- |
| A1 identity/history preservation | Populated baseline migration verifier applies both migrations and asserts person ID/control, sports links, card origin hash, issue hash, and null historical publisher |
| A2 general identity | No-player account capability and person canonical-link tests; general person search API and global search provider |
| A3 target compatibility | Person/athlete follow aliases resolve to one stored follow; existing media/social/source integration coverage retained |
| A4 no-sports lifecycle | Three fixtures: musician, actor, custom geologist/driver; each generates, publishes, issues, saves, downloads and shares with zero sports rows |
| A5 private boundaries | Cross-creator mutation/read/image tests, source privacy, scoped distribution, batch-key isolation |
| A6 no implicit authority | New profiles remain unclaimed; official publication rejects requests; legacy control can seek actual review |
| A7 concurrency/recovery | Concurrent batch retry generates one job; another creator gets independent cards; concurrent claims cannot exceed the cap; existing retry recovery tests retained |
| A8 frozen content | Name/profile changes leave publication snapshot/hash/export unchanged; publish/archive block regeneration and content edits |
| A9 origin/publisher | Different admin publisher preserves original creator; unknown historical publisher stays null |

Validation commands and results:

- `pnpm db:migrate:verify`: passed against **statman_test** with populated legacy data.
- Full server suite: **206 tests passed across 24 files** in the final run,
  including 13 no-sports/RDC-boundary proof cases and two focused permission cases.
- Targeted client media/share/native-auth tests: 6 passed.
- `pnpm typecheck`, mobile boundary lint, OpenAPI lint, and SDK drift check: passed.
  Final workspace typecheck passed after the final server suite.
- Web export: passed. Native device/browser interaction was not exercised; no
  browser automation tool was available in this session.

Generation acceptance uses the deterministic stub. It proves lifecycle and access
boundaries, not live Gemini output quality or paid-provider reliability. R2 external
bucket policies were not changed or remotely verified. Rendering snapshots freeze
selected data/artwork references; RDC's next release model must additionally pin the
composition renderer and full export manifest for reproducible commercial editions.

## Actual effort, not a coupling-score cost claim

Execution windows are recorded in [effort.json](effort.json). The first observed
implementation window ran from 13:44:12 to approximately 13:59:53 Central (about
16 minutes), covering security, identity, no-sports proof, migration/build work,
and tests. Work resumed at 18:10:56 Central after the RDC product steering; the
intervening user/idle gap is excluded from active-window totals.

These are observed agent execution windows, including tool waits and iteration,
not human developer-hours, billing data, or a fabricated per-feature time sheet.
Phase-level labour and a clean-rewrite counterfactual were not independently timed.
The resumed window includes RDC design documentation and verification cleanup;
it is not all attributable to the original MR2 scope.

Observed rework: an existing admin audit test raced an asynchronous response hook;
its assertion now waits for the audit. Native-auth test setup initially over-mocked
React Native and was corrected. Expected old assertions for auto-claiming players,
batch draft status, and subject-owned distribution were updated to the new rules.
No production failures were hidden by weakening access-control assertions.

## Compatibility ledger

| Retained adapter or compromise | Why retained / cost | Removal or containment |
| --- | --- | --- |
| Logical PersonProfile mapped to physical AthleteProfile | Avoids copying identities or breaking FKs | Permanent storage mapping is acceptable |
| Existing Prisma relations/FKs still named athleteProfile/athleteProfileId | Limits churn across sports imports, seeds and existing contracts | Rename logically when release contracts are introduced; no data copy needed |
| First/last name columns use empty defaults; display-name fallback | Old writers and athlete DTOs still expect strings | New person API requires displayName; nullable physical names can wait until old writers retire |
| Old player/card routes and athlete-shaped card summary remain | Existing clients and sports views continue to resolve | New people APIs and subject field are available; retire aliases by client usage |
| personProfileId input normalizes to old card FK | One conflict-checking adapter rather than two subject identities | Move canonical contract to release API during separation |
| PERSON_PROFILE normalizes to stored ATHLETE_PROFILE | Prevents duplicate follows/reactions/media targets | Central adapter including multipart upload; migrate all target tables together if needed |
| Generator payload still says athleteName | Persisted jobs/provider interface remain recoverable | Version/rename payload at a deliberate job boundary; value is now general display name |
| Batch path optionally consults sports poses | Existing athlete batch tests and clients retain their presets | Neutral portrait works without Player; later put sports preset resolution behind a dedicated adapter |
| Studio state and statsSnapshotJson retain legacy names | Reuses builder preview and current card rendering | New release composition resolves general content; avoid growing the legacy stats bag into a universal schema |
| Legacy hash format preserved, new publications use versioned snapshot hash | Old issued provenance must not be recalculated | Version-aware verification remains necessary, even after release extraction |
| Migration captures currently available legacy content | Original historical render content cannot be reconstructed if already edited | Snapshot marks captureOrigin=migration-current-content; never present it as original publication evidence |
| Existing edition-shaped CardTemplate remains until next boundary | Demonstrated reuse before committing to a larger model migration | Map it to CardRelease and add a separate design table; do not add more mutable design features to published rows |
| Test harness injects direct user IDs | Existing integration fixtures use short authentication setup | Test-only; production optional auth now requires sessions |

No new profile tables were added per profession. There is no duplicate issue ledger,
parallel authorization system for community cards, or replacement generation queue.
The largest remaining boundary is now explicit: editable composition versus release.

## Coupling reassessment

| Fixed audit unit | Actual treatment | Score |
| --- | --- | --- |
| Person persistence/access | Mapped existing table, new general API | 1 |
| Card creation/serialization | Adapted existing service and compatibility DTOs | 1 |
| Generation orchestration/provider | Reused executor/provider; changed presets, retry reservation and sources | 1 |
| Authorization/claims | Narrowed existing checks; removed auth bypass and implicit claims | 1 |
| Publishing/snapshots | Extended existing lifecycle with freezing and publisher attribution | 1 |
| Issuance/ownership | Kept ledger; added row-lock protection | 1 |
| Saves/downloads/collection | Kept models; adapted scope and snapshot exports | 1 |

Actual classification: **7/14, 0/7 principal replacements**, versus the static 6/14
forecast. This measures change scope, not elapsed cost. Image delivery needed
additional targeted hardening outside that seven-unit rubric; the initial audit
understated security effort there. The upcoming design/release extraction is new
RDC scope and must be measured separately.

## Rollout conditions and next checkpoint

- Apply identity/security migration, then card-core migration with generated Prisma
  client and API/SDK changes. SQL was tested only in the dedicated test database.
- For R2, provision a distinct non-public `R2_PRIVATE_BUCKET`. New private writes
  fail closed without it. Inventory and relocate/invalidate any historically public
  private-card/source URLs before release; a new proxy cannot revoke an old public
  bucket URL. Do not claim that code changes retroactively remove leaked copies.
- Do not roll back to a build with raw-ID optional auth or subject-owner private-card
  access. An application rollback must retain these security fixes and understand
  new snapshots/fields. Leave additive schema in place.
- Run browser/native and live-provider smoke checks in the target environment before
  production promotion. No deployment, external storage mutation, or payment work
  was performed in this task.
- Next bounded proof: one reusable design, two separately numbered releases, one
  creator storefront; edit the design and verify the first release stays intact.
  Reassess cost and compatibility at that boundary rather than defending old code.
