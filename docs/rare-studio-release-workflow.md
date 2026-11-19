# RARE: Studio, releases, and storefronts

Product: **Rare Digital Collectibles (RDC)**. Short name: **RARE**.
Promise: **Create yourself. Collect anyone.**

Status: accepted product direction; release/storefront changes below are a design,
not implemented schema. The current MR1/MR2 implementation proves general people
and community cards. This document supersedes the earlier decision to keep design
and edition permanently combined in `CardTemplate`.

## Product boundary

RARE gives people tools to create the products they publish and collect:

**Information → Identity → Artwork → Edition → Signature → Inventory → Store → Trade**

Creation, collecting, and selling are separate capabilities. A person represented
on a card, its designer, its publisher, its authorizing subject, and its collector
may all be different people. A storefront belongs to an account, not to a claimed
person profile. Creating a profile or storefront never verifies identity.

## Five primary objects

| Object | Responsibility | Mutability |
| --- | --- | --- |
| `PersonProfile` | Public identity and optional source material: biography, achievements, projects, media, and specialized content | Editable under profile permissions; published cards do not follow edits |
| `CardTemplate` | Creator-owned reusable composition: layout, layers, style, bindings and canvas dimensions | Editable/versioned; edits affect future releases |
| `CardRelease` | Resolved edition: subject, artwork, content, publisher, authorization, signature evidence, edition size and issuance rules | Freeze on publication/signing; numbered issues can never silently change |
| `CardIssue` | One uniquely numbered copy within one release, with initial provenance and current owner | Number and release immutable; ownership changes require a future transfer record |
| `Storefront` | One account's public creator presence and published release catalog | Editable presentation; selling disabled until commerce is explicitly enabled |

Everyone gets a storefront backed by their existing public account profile.
Reuse `Profile.username`, display name, avatar, and biography for its initial
presentation. Add a one-to-one `Storefront.userId` when catalog settings require
persistence; provision it transactionally at registration and backfill existing
accounts idempotently. Do not expose account email or private draft inventory.
Collecting does not require publishing, and publishing does not require selling.

## Studio → release workflow

1. **Gather information.** Create/select a public person; optionally choose their
   achievements, projects, images, or other entries. Show who supplied each item.
   Let the creator omit stats entirely. Distinguish private uploads from public
   profile contributions.
2. **Compose a design.** Choose a reusable template, generate/select artwork, and
   arrange content overlays, decorative layers, frames, and styles. Store a bounded,
   versioned composition document rather than a new SQL table for every layer.
3. **Preview resolved content.** Resolve selected profile fields into concrete text
   and images. Show exactly what will appear, including creator attribution and
   official/community status. Pin the renderer version and artwork assets.
4. **Prepare an edition.** Create a release draft from a specific design revision.
   Choose quantity, title, release rules, subject, and destination storefront.
   Subsequent template edits cannot alter this preview without explicit refresh.
5. **Authorize and sign.** Recheck publishing authority on the server. Bind any
   confirmation/signature to the exact release manifest hash. A changed preview,
   edition limit, artwork, or rule invalidates the previous confirmation.
6. **Publish and issue.** Freeze the release and list it on the publisher's
   storefront. Allocate numbered copies atomically within the fixed edition limit.
   Support allocation on demand; do not generate thousands of separate artwork
   images or rows merely because a release permits thousands of copies.

The first Studio version can support image, text, and decorative-image layers,
with ordered placement, dimensions, style parameters, and permitted asset IDs.
Treat markup/scripts as data, never executable template content. Add other layer
kinds only for a demonstrated authoring need.

Render shared artwork once per release. Numbering can be a deterministic overlay
per issue, with the release manifest defining its placement and renderer version.
An exported numbered image must resolve to its actual issue; a preview is not an
issued collectible. Repeated issue requests require an idempotency key and the
same transactional edition-limit protection as the current issuance path.

## Release separation: reuse the release-shaped data

Inspection shows the current `CardTemplate` already stores the properties of a
release: subject, edition mode/size, issued count, publication status, frozen
snapshot, origin hash, publisher, and issue relationships. Published rows cannot
be reused as editable designs without breaking collectible integrity.

**Recommended migration: keep those rows as releases; add a separate design model.**

| Current record | Future logical model | Preservation strategy |
| --- | --- | --- |
| Existing `CardTemplate` row | `CardRelease @@map("CardTemplate")` | Keep IDs, hashes, snapshots, dates, edition limits, and issue relationships |
| New reusable composition | `CardTemplate @@map("CardDesign")` | New physical table; independent of historical edition records |
| `CardIssue.cardTemplateId` | `releaseId @map("cardTemplateId")` | Existing FK continues to reference the same physical table |
| Card saves and download events | Release saves and issue/download history | Preserve rows and IDs; update logical terminology and adapters |
| Existing generation jobs | Release-artwork generation jobs initially | Preserve inputs and recovery; introduce design-preview rendering separately when needed |

Add nullable `CardRelease.templateId` referencing the new design table, plus the
captured template revision in the release snapshot. Old releases need no fabricated
design provenance. Let a creator explicitly derive a new design from an old card;
that action creates a new design and later a new release, never edits old issues.
Legacy drafts can remain release drafts during the transition.

Keep `/cards/{id}` as a release compatibility route. New Studio contracts should
use explicit template and release endpoints. Existing polymorphic `CARD_TEMPLATE`
targets refer to release-shaped rows; normalize them to the release concept.
Give new designs a distinct stored target vocabulary such as `CARD_DESIGN`.
Never reuse the old discriminator for new design IDs or silently change saves
from release saves into template saves.

The alternative—turning old rows into designs, copying releases to a new table,
and repointing every issue—is more migration work with no current benefit.
Compare again if concrete implementation exposes a constraint; do not create
both designs and releases from every historical row automatically.

## Signatures and provenance

Three different things must have different labels:

- **Visual signature:** an autograph image or decorative layer. It is not proof
  that the depicted person approved the release.
- **Verified approval:** authenticated, authorized account consent to a specific
  immutable manifest, with evidence and approval/revocation history.
- **Cryptographic attestation:** a verifiable signature over the canonical manifest
  digest, with algorithm, key ID, signer identity/role, and verification procedure.

Existing `originHash` and `issueHash` provide hashes, not digital signatures. Do
not relabel them as signatures. Decide whether the signer is the platform attesting
to account consent or a person using their own key; disclose that distinction.
A platform signature must never be presented as the subject's personal key.

Before enabling signing, specify canonical serialization, asset digests, renderer
version, domain separation, key custody/rotation, a public verification endpoint,
and what a verifier sees after key or publishing-authority revocation. Preserve
old verification material. A hash binds the manifest; it does not independently
verify every fact in that manifest.

Official and community releases use the same release/issue tables. Official
classification requires current approved subject control or a validated delegate
at publication. Community releases retain clear creator attribution. Revocation
can stop future releases and cause withdrawal/review of old ones without erasing
the original approval record.

## Sequencing and release gates

1. Finish MR1/MR2 security, identity, and no-sports proof; retain the existing
   template/edition combination as a **temporary compatibility model**.
2. Introduce the design/release boundary and minimal creator storefront catalog
   before adding mass-production authoring. Prove one template can produce two
   independent releases with different edition limits.
3. Complete official authorization and signature verification before exposing an
   official-sign button. Community publication remains available meanwhile.
4. Add richer profile inputs and composition layers incrementally.
5. Design commerce separately: payment settlement, seller activation, transfers,
   refunds/disputes, and inventory reservation. No checkout or monetary claims are
   implied by a public storefront.

Acceptance for the new boundary: edit a reusable template after releasing edition
A; publish edition B from the changed design; A's artwork, content, limit, signatures,
issue numbers, and ownership remain unchanged. Each edition has independent
numbering, and both appear in the creator's storefront. A collector can collect
without creating a release or enabling selling.
