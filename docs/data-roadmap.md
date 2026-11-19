# RARE data roadmap: people and digital collectibles

Status: accepted direction. MR1/MR2 are implemented locally; see the
[implementation checkpoint](implementation/mr2-checkpoint.md). Later RDC objects
and official publishing remain planned.

## RDC direction update

The product is **Rare Digital Collectibles (RDC)**, nicknamed **RARE**:
**Create yourself. Collect anyone.** See the [Studio and release workflow](rare-studio-release-workflow.md).

The five-object destination is PersonProfile → reusable CardTemplate → immutable
CardRelease → numbered CardIssue, with an account-owned Storefront. The current
MR1/MR2 card model combines design and release temporarily. Separate them before
mass-production Studio work; retain existing edition-shaped rows as releases.
Everyone gets a public creator/storefront presence, with commerce independently
enabled later. Existing hashes are not cryptographic signatures.

## Direction

Make cards the primary product and support any person: athletes, musicians,
actors, writers, drivers, scientists, lawyers, sales agents, and pursuits we have
not anticipated. A person may have several pursuits and specializations.

Reuse the existing application and card lifecycle. Generalize public identity;
keep sports as an optional source of profile content. Stop expanding sports
infrastructure while establishing the shared core. Official and community cards
share the same infrastructure. Sports compatibility must not dictate the new
core architecture; compatibility adapters are transitional.

**Acceptance rule: a person can create, publish, collect, and share a meaningful
card with zero sport, player, team, season, or game records.**

## Reuse and boundaries

| Existing schema | Direction |
| --- | --- |
| `User`, `Profile`, `Session` | Keep account identity and public account presentation. Do not merge these with the person depicted on a card. |
| `AthleteProfile` | Generalize to `PersonProfile`, preserving IDs, slugs, claims, media, and card relationships. |
| `Player`, `Sport`, `League`, `School`, `Season`, `Team`, `RosterMembership` | Keep as optional sports records attached through `Player.personProfileId`. |
| Games, events, consensus, stat lines, season stats, imported stats | Preserve existing data and domain meaning. Expose useful profile content without requiring live scoring or imports in the core experience. |
| `CardTemplate`, `CardIssue`, `CardSave`, `CardDownloadEvent`, `CardGenerationJob` | Keep the publishing, edition, collection, download, and generation foundation. Remove required sports assumptions. |
| Media, images, articles, follows, reactions, sources, disputes, audit logs | Reuse; extend target handling and neutral terminology where necessary. |
| `Claim`, `claimedByUserId` | Reuse the existing claim workflow against general people. Keep current ownership limits initially. |

Do not reinterpret a team as a band, a game as a film, or a season as a career
period. Similar-looking concepts do not necessarily have the same rules.
Freeze investment in live scoring, consensus, and sports-import expansion.
Retire unused workflows separately from preserving their historical records.

## Small shared core

### 1. General person identity

`PersonProfile` retains the existing profile fields and relations, with:

- Required `displayName`, supporting stage names, handles, and single names.
- Optional `firstName` and `lastName`, retained for compatibility.
- Optional aliases, initially a validated JSON string array.
- Existing biography, hometown, avatar, timestamps, and soft deletion.

Backfill display names from current names. A public person does not require a
login, a claim, a pursuit, or a sports attachment. A user account, a depicted
person, a card creator, and a card owner remain distinct identities.

### 2. Pursuits and specialization

After the general card lifecycle works, add two small tables. No deep profession
hierarchy is required:

| Model | Minimum shape |
| --- | --- |
| `Pursuit` | ID, unique slug, label; parent ID deferred until needed |
| `PersonPursuit` | ID, person FK, optional pursuit FK, optional custom label, optional specialization text |

Support multiple assignments per person. Require either a catalog pursuit or a
custom label; validate that rule in the service. Prevent duplicate catalog
assignments per person. Custom entries should work immediately without admin
approval or schema changes.

Start with labels such as Basketball, Music Production, and Geology. Position,
genre, or focus can be specialization text. Cross-disciplinary people receive
multiple assignments. Add parent categories only when discovery requires them;
validate against cycles if that relationship is introduced.

Keep `Sport` authoritative for sports operations. Backfill pursuit assignments
from existing player/sport relationships using an explicit mapping; a pursuit
assignment never automatically creates a player. Add a persistent mapping only
if a feature needs ongoing synchronization.

### 3. Optional profile content

Add `ProfileEntry` rather than a table for every profession:

- Person FK; optional person-pursuit FK; kind; title; description.
- Optional occurrence/start/end dates and display order.
- Versioned, validated `detailsJson` for kind-specific fields.
- Timestamps and an explicit publication state, defaulting to draft.

Start with achievements, projects, credits, credentials, links, and metrics.
Require any linked person-pursuit assignment to belong to the same person.
Publishers can omit entire content types; no profession has required metrics.

Examples: a book publication, film role, research project, production credit,
professional certification, completed sales milestone, or millionth mile driven.

Metric entries include a value, unit, observation date, and scope/platform where
relevant. Use `SourceReference` for provenance and `Dispute` for corrections.
Distinguish self-reported content from independently verified content; identity
claims do not verify every achievement or credential.

Keep fields needed for joins, filtering, permissions, and lifecycle in normal
columns. Use JSON only for bounded content details with application schemas.
Promote a detail to a typed column or dedicated model when a real query or
workflow requires it. Do not build a universal statistics engine or cross-career
ranking system. Existing sports statistics remain in their current tables and
can be projected into profile views without duplicating them into entries.

### 4. Cards independent of pursuits

For MR1/MR2, keep the existing `CardTemplate` edition lifecycle and `CardIssue`
copies to prove reuse. For RDC, evolve existing edition-shaped rows into logical
`CardRelease` and introduce a separate reusable design model as described in the
Studio workflow. This is a behavior distinction, not a cosmetic table rename.

- Replace the logical athlete relationship with `personProfileId`.
- Keep optional `teamId` and `gameId` as legacy sports context initially.
- Retain current card types for compatibility; add a neutral `MOMENT` type.
  `PROFILE`, `MILESTONE`, and `HIGHLIGHT` already work beyond sports.
- Add versioned `contentSnapshotJson` for published identity, story, selected
  facts, and source attribution. Read legacy `statsSnapshotJson` through an
  adapter; do not reinterpret existing payloads in place.
- Published artwork and snapshots remain stable as profiles change. Corrections
  need an explicit revision/reissue policy; never silently rewrite issued cards.
- Use general generation presets, with optional pursuit-specific presets.
  Remove the implicit basketball fallback and required player lookups.

Retain issue numbers, edition limits, hashes, saves, download events, and job
history. Preserve existing hash inputs for issued cards. Saving a design and
owning an issued copy remain different actions.

Keep one primary person per card initially. Defer multi-person subjects,
publisher organizations, named collections, series, trading, and payment marketplaces
until a concrete product flow requires them. The existing saves and issues are
enough for the first collection experience.

## Official and community publishing

Support both through the existing templates, generation pipeline, editions,
issues, saves, and discovery. Do not create separate official/community tables.
Official status means verified publishing authority, not verification of every
fact, achievement, or statistic on the card.

| Concept | Meaning |
| --- | --- |
| Subject | General `PersonProfile` depicted by the card |
| Creator | Existing `createdByUserId`; retain original attribution |
| Publisher | Account performing publication, recorded separately from creator |
| Official authority | Verified subject control or an authorized representative's valid grant |
| Collector | Owner of an issued copy, independent of subject and creator |

Extend `CardTemplate` with:

- `publicationType`: `COMMUNITY` by default, or `OFFICIAL`.
- `publishedByUserId`: publisher FK, nullable for legacy records lacking evidence.
- A versioned authorization snapshot recording subject, actor, authority basis,
  evidence reference, and validation time. Sensitive verification evidence is
  private; public attribution belongs in `contentSnapshotJson`.
- An approved claim reference for official self-publishing, with a real relation.
- An indexed nullable `publisherAuthorizationId` relation only when delegated
  publishing is implemented.

Use approved, still-valid claims to authorize official self-publishing. Validate
eligibility on the server at publication, atomically with the state transition.
Clients cannot grant themselves official status. Community publishing requires
no claim on the subject, but still follows account and moderation permissions.
Creating an unclaimed person does not confer verified control of that identity.

Add `CardPublisherAuthorization` when representatives are needed: subject,
authorized account, granting/reviewing actor, scope, validity, revocation, and
evidence. Do not enable official representative publishing before a grant can be
validated. Self-publishing through claims does not require delegation machinery.

Existing cards remain community unless reliable historical evidence supports an
audited official classification. Later profile claims never promote community
cards retroactively. Freeze classification and authorization evidence at
publication. Revocation blocks future official publishing and may trigger review
or withdrawal of existing cards while retaining their original provenance.
Display current review/withdrawal status separately from historical authority.

Subject control must not automatically grant edit/delete rights over another
user's community cards. Review existing subject-owner permission shortcuts in
`CardService`; disputes go through moderation. Display creator attribution and
official/community classification clearly in card details and discovery.

## Claim approval, revocation, and revalidation

Preserve one controller per person and the existing unique `claimedByUserId`
constraint (one claimed person per account) initially. This is profile control,
not sufficient evidence of official authority: current player creation sets that
field without an approved claim.

- Approval: an admin reviews evidence on a pending claim. In one transaction,
  conditionally transition the pending claim, assign the controller if eligible,
  reject competing pending claims, and record the reviewer, time, and audit event.
  Enforce both uniqueness constraints and prevent concurrent conflicting reviews.
- Legacy control: preserve existing controllers and edit access, but require an
  approved claim before official publication. Allow the same controller to submit
  verification for their existing profile; do not treat this as a competing claim.
- Revocation: add explicit claim revocation metadata (time, actor, reason), retaining
  the original approval record. Atomically revoke authority and clear the matching
  controller for a revoked control claim; do not clear a subsequent controller.
  Record an audit event. Never delete evidence or rewrite published provenance.
- Revalidation: every official publication checks an approved, non-revoked claim
  for the actor and subject, a matching current controller, an active account, and
  a non-deleted subject. Revalidate inside the publication transaction using a
  shared lock/version protocol with revocation so the operations serialize.
- After revocation: require a new reviewed claim to regain authority. Existing
  cards retain original authority evidence; current review/withdrawal is separate.
  Delegated grants must later use the same revocation/revalidation discipline.

## Origin, authority, and current status

Keep these independent on each published card:

| Property | Representation |
| --- | --- |
| Origin | Preserve `createdByUserId`; never infer or overwrite it from later claims |
| Authority | Publication classification plus immutable approval evidence |
| Current status | Existing `CardTemplate.status` and visibility; extend lifecycle states only if review/withdrawal cannot be represented clearly |

For legacy cards, leave `publishedByUserId` null unless reliable historical evidence
identifies the actual publishing actor. The creator and publisher may differ;
never backfill the publisher from the creator or current subject controller by
assumption. New publication records the authenticated publishing actor.

Do not add an independent moderation state by default. Define review/withdrawal
transitions, discoverability, and collection access against the existing lifecycle
first. An official card can be withdrawn without losing its original authority.

## Migration sequence

Before MR 1 changes code or data, use the [MR1 dependency audit](mr1-data-audit.md)
as the baseline inventory, acceptance matrix, and coupling assessment. These tests
are requirements, not claims that the proposed architecture already passes.

### MR 1 — Generalize identity without moving historical data

1. Inventory athlete assumptions across Prisma, API schemas, SDK, permissions,
   target resolution, search, sharing, generation, imports, and seeds.
2. Add and backfill `displayName`; make personal name parts optional once all
   readers support display names.
3. Rename the Prisma model logically using `@@map("AthleteProfile")`; map logical
   `personProfileId` fields onto existing `athleteProfileId` columns with `@map`.
   Coordinate generated-client changes with service changes. Physical table and
   column renames are unnecessary for the pivot.
4. Introduce general person API contracts while retaining adapters for existing
   athlete/player routes and clients. Regenerate the OpenAPI SDK.
5. Extend neutral provenance values without deleting sports-specific ones.
   Update defaults and verification labels so new people are not described as
   player-reported. Keep source origin distinct from verification decisions.
6. Handle polymorphic targets centrally. Initially normalize public person
   targets to the existing stored `ATHLETE_PROFILE` discriminator. If storage is
   later migrated to `PERSON_PROFILE`, migrate all target tables together with
   deduplication and uniqueness checks; do not allow aliases to create duplicate
   follows or reactions.

Exit: existing IDs, links, claims, cards, and sports associations still resolve;
a non-athlete person can exist without a `Player`.

### MR 2 — Complete the general card path

1. Add the snapshot field and legacy reader; write new cards in the new format.
   Add community classification and publisher attribution now. Preserve creators,
   default historical cards to community, and leave unknown publishers null.
2. Remove sports requirements from generation, serialization, asset validation,
   authorization, and public person links.
3. Introduce minimum community permissions now: authenticated active users may
   create unclaimed people and create/generate/publish their own community cards.
   Default publication classification to community; reject official requests until
   MR 3. Creating a person never grants verified control.
4. Remove subject-owner shortcuts for another creator's edits, private reads,
   images, and generation; preserve explicit admin moderation. Scope batch retry
   keys and rate limits to the actor as well as subject so users cannot retrieve
   one another's private batches. Define source-asset access explicitly.
5. Verify issuance, collecting, sharing, and legacy rendering without sports
   records or active sports services.

Exit: an athlete, musician, and truck driver can each publish and collect cards
through the same flow. Only the athlete needs sports data, and only when using
the optional sports features.

### Next RDC boundary — Reusable designs, releases, and creator storefronts

Use the Studio workflow design before implementing mass production. Preserve
existing releases and issued copies; add independent template composition and
a creator catalog. This is the next scoped implementation after the MR2 checkpoint.

### MR 3 — Complete official publishing

1. Extend MR 2 community classification with official authorization evidence.
2. Implement claim approval/revocation/revalidation rules above, including legacy
   controllers without approved claims.
3. Enable official self-publishing through server-verified active claims.
4. Audit any evidence-backed official classification of historical cards; never
   infer authority or publisher from current profile control.
5. Test unauthorized official requests, revoked claims, community-card ownership,
   and later claims leaving earlier community cards unchanged.

Exit: official and community cards coexist for one person without privilege
escalation through profile creation or claiming.

### MR 4 — Add pursuits and useful profile depth

1. Add pursuits, person assignments, and profile entries.
2. Backfill athlete pursuits without changing existing player or sports IDs.
3. Extend media/source/dispute target validation for profile entries.
4. Expose optional content and existing sports history through general profiles.
5. Verify custom pursuits and multiple pursuits using a writer, actor,
   scientist/geologist, lawyer, sales agent, and musician/athlete.

Exit: supporting an unfamiliar pursuit requires content entry, not a migration.

### MR 5 — Card-first application

Make discovery, creation, collecting, and sharing work through general people and
cards. Lead profiles with cards, then optional content. Remove sports from primary
navigation and creation requirements. Show creator attribution and official versus
community status wherever users discover or inspect cards.

Exit: with active sports routes and jobs disabled in a test environment, people,
cards, collections, and discovery still work. Sports history remains available
when the optional module is enabled.

### Subsequent cleanup — Reduce maintenance based on usage

Retire unused sports jobs, routes, and screens after checking their consumers.
Preserve historical sports data and useful profile views. Remove compatibility
fields only after old clients and jobs have migrated. Archive or export data
before any later destructive cleanup; keeping optional tables is acceptable.

## Architectural proof and restart decision

Establish the audit baseline and acceptance tests before MR 1 implementation.
After MR 1 and MR 2, reassess measured coupling rather than the number of sports
tables. Create cards for a musician, actor, and custom profession without sports
records. Verify generation, publishing, issuing, collecting, sharing, permissions,
and legacy cards. Keep the repository if focused adaptation succeeds. Reconsider
a clean core only if most identity and card lifecycle infrastructure must be
replaced; replacing individual subsystems may still be sufficient.

Final acceptance scenario across all five MRs:

1. A new user creates an unclaimed profile for an unknown musician and publishes
   a community card about them.
2. That user collects another user's card.
3. The musician later claims the same profile and publishes an official limited
   edition through verified authorization.
4. Both releases coexist without changing original creator attribution,
   community classification, issued copies, or frozen content.
5. Existing athlete cards and statistics continue to work.

## Verification and release discipline

- Use additive migrations and repeatable backfills. Check row counts, orphaned
  relations, and ID preservation before switching readers.
- Verify claims, follows, reactions, images, sources, and disputes still resolve
  after identity changes, including authorization and private-content behavior.
- Test edition limits, concurrent issuance, retry idempotency, and old card
  rendering. Compare existing issue hashes and snapshots before/after migration.
- Test the complete card path in a fixture with no sports records.
- Verify existing athlete profiles still show their sports history correctly.
- Deploy compatible readers before new writers; defer destructive changes so
  rollback does not require reconstructing records. Once new-format data exists,
  rollback targets must understand it.

## Scope guardrail

Build a universal person and card core with optional depth. Reuse sports as the
first specialized module. Add another specialized module only when shared
profile entries cannot support a demonstrated feature—not merely because a new
profession joins the platform.

Defer marketplaces, trading, organization accounts, cross-profession rankings,
and deep profession hierarchies. Keep extension points for series, shared works,
collaborations, multi-person cards, and authorized publishers without building
those features upfront.
