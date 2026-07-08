# Design System — Articles

Guidance for the sports-articles feature: reading page, submission form, and
admin moderation queue. This is an *extension* of the existing token system
(`statman_project_docs/statman_docs_bundle/19_DESIGN_TOKEN_SHEET.json`,
`apps/mobile/global.css`, `tailwind.config.js`), not a parallel one — no new
color palette, no new spacing/radius scale. The only genuinely new thing
Articles need is a **long-form reading type scale**, because nothing in the
app today renders more than a stat label, a body sentence, or an entity
name — no screen currently asks someone to read a few hundred words.

## 1. Context and goals

Give any user a path to write and publish a sports article inside the
existing Statman shell (same tab bar, same `Screen`/`PageFrame` chrome, same
light/dark tokens), gated by admin approval before it's publicly readable —
reusing the `Claim` review-queue pattern already proven in this codebase
rather than inventing a new moderation shape.

## 2. Design tokens and foundations

### 2.1 Reused as-is (no changes)

- Color: `canvas` / `surface` / `text` / `muted-text` / `border` / `brand` /
  `live` / `verified` / `dispute` / `imported` / `sport-accent`
- Spacing: `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48`
- Radius: `sm 8 · md 16 · lg 24 · pill 999`
- Motion: `cardPressMs 120 · sheetSnapMs 260 · pageTransitionMs 220 ·
  liveEventFeedbackMs 160`
- Every primitive in `shared/ui` and `shared/layout` (`Text`, `Button`,
  `Card`, `Badge`, `Avatar`, `Input`, `Textarea`, `Sheet`, `Screen`,
  `ScreenState`, `PageFrame`, `TabPanel`, `BackButton`, `SignInPrompt`,
  `EmptyState`, `LoadingState`, `ErrorState`)

### 2.2 New: reading type scale

Add to `Text.tsx`'s `textVariants` (mirrors the existing `entityName` /
`statValue` pattern — a token-backed Tailwind class, not an inline style)
and to `tailwind.config.js` `fontSize`:

| Token | Size / line-height / weight | Tailwind class | Use |
|---|---|---|---|
| `kicker` | 12 / 16 / 700, uppercase, `letterSpacing: 0.8` | `text-kicker` | Category/keyword eyebrow above a headline (e.g. "GAME RECAP") |
| `articleTitle` | 28 / 34 / 800 | `text-article-title` | Article headline on the reader screen. Deliberately smaller than `entityName` (36/40/700) — a headline is not an identity, don't compete with Player/Team name weight. |
| `articleDek` | 18 / 26 / 400, `muted-text` | `text-article-dek` | One-line summary/subhead under the title, reader screen only. |
| `articleBody` | 17 / 28 / 400 | `text-article-body` | Article prose. Deliberately *not* the same as `body` (16/24) — reading long-form wants a taller line-height (1.65 vs 1.5) and a hair larger size than UI copy. Constrain measure to `max-w-[640px]` on wide/web layouts (`PageFrame`'s existing 70/30 split already caps this close to ideal — don't add a second width system). |

Everything else (byline, meta, timestamps) reuses existing `caption` (`text-sm text-muted-text`).

### 2.3 New: article status → color

No new colors. Map `ArticleStatus` onto the existing `StatusColorToken`
palette, following the exact precedent of `sourceStatusColor()` /
`gameStatusColor()` in `lib/theme.ts`:

```ts
const ARTICLE_STATUS_COLOR: Record<ArticleStatus, StatusColorToken> = {
  DRAFT: 'muted-text',
  PENDING_REVIEW: 'dispute',   // amber — "needs attention," matches IN_DISPUTE's semantic, not literally a dispute
  PUBLISHED: 'verified',
  REJECTED: 'muted-text',      // deliberately not `live`(red) — a rejection isn't an alarm, see §5
}
```

Add `articleStatusColor()` next to the other two status-color functions in
`lib/theme.ts`, not a new file — one place to keep the status→color mapping
consistent, per the existing convention.

## 3. Component-level rules

### 3.1 `ArticleCard` (new, `shared/media/` or a new `modules/articles/`)

Anatomy (top to bottom): thumbnail (16:9, `rounded-md`, `SmartImage` —
reuse, don't rebuild), `kicker` (first keyword, optional), `entityName`-tier
title *at card scale* — actually use a new `cardTitle` need? No — reuse
`Text` with `className="text-base font-semibold"` for card-scale titles;
don't add a token for something that only appears at one size in one place.
Then one `caption`-styled byline+date line.

States:
- **default** — as above.
- **loading** — reuse `Skeleton` (thumbnail rect + two text lines), not a
  bespoke skeleton.
- **empty** (no published articles yet) — reuse `EmptyState`, copy per §5.
- **long title** — 2-line clamp (`numberOfLines={2}`), never push the
  thumbnail aspect ratio around.

Grid placement: reuse `EntityTile`'s wrapping-grid layout convention (Home
feed / Explore already do this for players/teams) rather than a new list
component — Articles is one more tile kind in the same grid, not a
separate rail.

### 3.2 `ArticleReaderScreen` (`modules/articles/ArticleReaderScreen.tsx`)

Composition, reusing exactly what Player/Team/Game already establish:

- `Screen` (no `title` prop — the article has its own identity, same rule
  `EntityHero`-based screens already follow) + `BackButton` overlay, OR a
  native `Stack.Screen` header if there's no hero image (mirror the
  existing "hero screens get floating BackButton, non-hero screens get
  native header" split documented in `apps/mobile/src/README.md`).
- Hero thumbnail: full-bleed image at the top, **not** the `MediaSurface`
  scoreboard composition (that's game-specific) — plain `SmartImage` at a
  fixed aspect ratio, tap-to-fullscreen via the existing
  `FullScreenMediaViewer` (reuse, it's already generic).
- `kicker` → `articleTitle` → `articleDek` (if present) → byline row
  (`Avatar` sm + author name + relative date, `caption` styling) — this is
  the same "stepped-weight identity block" pattern `IdentityOverlay`
  already established for Player/Team, just swapped from
  name/username/hometown to title/dek/byline. If `IdentityOverlay` can be
  generalized to take arbitrary `metaLines` for this too without forcing
  entity-profile assumptions on it, prefer that over a parallel component;
  if the hero-photo layout diverges too much, a sibling component is fine
  — don't force a shared component past the point it's still simplifying
  anything.
- Body: `articleBody` text, `max-w-[640px]` measure constraint on wide
  layouts (via `PageFrame`'s `main` slot — no sidebar needed, article
  reading is a single-column task).
- Keywords: row of `Badge tone="muted-text"` chips at the bottom, reusing
  `Badge` exactly as-is — don't add a new "tag" component for what's
  visually identical to a badge.
- `ConnectedSourcesPanel`'s pattern doesn't apply here (no dispute/source
  concept for an article) — skip it, don't force every entity screen into
  the same tab set.

States: `LoadingScreenState` / `ErrorScreenState` (both already exist,
already handle the `BackButton` + `Screen` wiring — this is exactly the gap
CLAUDE.md notes was closed for Player/Team, extend the same coverage here
day one instead of retrofitting later).

### 3.3 `ArticleFormScreen` (shared creation + edit surface)

One form, three consumers: a first-time author, an author editing their own
`DRAFT`/`REJECTED` article, and an admin editing before publish. Same
component, gated fields via a `mode` prop (`create | edit | adminEdit`) —
same pattern `SportEventPad`/`LiveScoringSessionScreen` already use for
role-based UI variation, don't invent a second convention.

Fields, top to bottom:
- Thumbnail — reuse `ConnectedImageUploadButton` exactly as wired for
  Player avatars (`usage="AVATAR"` today; give Article a `usage="EVIDENCE"`-
  sibling value or a new `usage` value if the backend needs to distinguish
  it — a design-system doc shouldn't silently invent backend enum values,
  flag this as an open question for the schema work, not a design decision).
- Title — `Input`, single line, required, visible character count once
  past ~80% of whatever max length the schema settles on (reuse the same
  "don't let a required field silently truncate" principle as everywhere
  else in the app — no screen today has a max-length field, so this is a
  first, keep the affordance simple: a `caption`-styled counter under the
  field, not a modal warning).
- Keywords — chip input: typed text + Enter/comma commits a `Badge`-styled
  chip with a small remove (×) target. Reuses `Badge` visually; the
  interactive remove affordance is new (badges elsewhere are read-only) —
  keep it visually identical to a static `Badge` plus one small icon, not a
  differently-shaped control.
- Body — `Textarea`, but `Textarea.tsx` today is a bare single-style
  wrapper sized for short inputs (dispute notes, bios). Article bodies are
  paragraphs; give `Textarea` a `size="lg"` variant (taller `minHeight`,
  `articleBody` line-height) rather than a new `ArticleBodyInput`
  component — same rationale as the `Textarea` reuse everywhere else in
  the app (Sources panel, Claims form).
- Submit row — `Button variant="secondary"` "Save Draft" +
  `Button variant="primary"` "Submit for Review" (author flow); admin
  `mode="adminEdit"` instead shows "Save" + "Publish" + `destructive`
  "Reject" — three actions max, don't stack a fourth.

States: `disabled` submit while title/body are empty (mirror existing form
validation elsewhere — inline `caption`-styled error text under the
offending field, not a toast). `isLoading` on the submit `Button` (prop
already exists). A submitted-successfully state should route back to the
reader/dashboard, not linger on the form — same as every other creation
flow in the app (no "success screen" pattern exists here, don't add one
just for Articles).

### 3.4 Admin moderation queue

Reuse the Claims queue screen's shape wholesale — it already solves "list
of pending things needing an approve/reject decision," including the
loading skeleton CLAUDE.md notes was added there. One list, each row a
`Card` with: thumbnail thumb + title + author + submitted-date, and two
`Button`s (`primary` "Approve", `destructive` "Reject" — opens a `Sheet`
for an optional rejection reason, same modal pattern
`ConnectedConflictQueue`'s "Mark Disputed" already uses for a reason-
needed reject action). Sits alongside the existing Claims queue in the
admin surface (`AdminHubScreen.tsx`, already modified in this working
tree) as a second queue entry, not a separate admin app.

## 4. Accessibility requirements

- Hero thumbnail and every `ArticleCard` thumbnail: required `alt`-
  equivalent (`accessibilityLabel`) sourced from the article title — never
  ship an unlabeled image, this is a reading-content feature, screen-reader
  users are a primary audience here more than anywhere else in the app.
- `articleTitle`/`articleBody` contrast: verify `text` (17 17 17 light /
  245 245 244 dark) against `canvas`/`surface` — already AA-compliant
  everywhere else in the app since it's the same token, but re-check once
  actual article thumbnails introduce photo-behind-text layouts (the hero
  treatment) — if a title ever renders over a photo instead of on
  `canvas`, it needs a scrim, same as `EntityHero` already applies for
  Player/Team names over photos. Don't render `articleTitle` directly over
  an unprocessed photo.
- Keyword chip remove target: minimum 44×44 touch target (existing
  project-wide rule from CLAUDE.md's style-audit pass) even though the
  visible × glyph is small — pad the `Pressable`, not the icon.
- Reading order: title → dek → byline → body → keywords must match visual
  order exactly (no `flex-row-reverse` or absolute-position tricks that
  would desync visual and screen-reader order) — this screen exists
  specifically to be read.
- Form errors: associate the `caption` error text with its `Input` via
  `accessibilityLabelledBy`/adjacent placement so a screen reader
  announces the error when the field receives focus, not just visually
  under it.
- Reduced motion: the chip-add/remove and card-press animations must
  respect the system reduced-motion setting the same way `cardPressMs`
  presses already do platform-wide — don't add a bespoke animation that
  skips that check.

## 5. Content and tone standards

Match the project's existing voice — CLAUDE.md's own docs are direct and
concrete, not hedgy; apply the same to in-product copy:

- Empty state (no published articles): **"No articles yet — be the first
  to write one."** Not "Oops! Nothing here." — action-oriented, not cute.
- Pending-review badge label: **"In Review"**, not "Pending" (matches
  `PENDING_REVIEW`'s meaning in plain language, avoids sounding like a
  system status leaking through).
- Rejection: label as **"Not Published"** in the badge (muted, not red —
  see §2.3), but the optional reason text shown to the author should be
  specific and actionable ("Needs a source for the score" beats
  "Rejected"), same principle as `Dispute`/`GameConflict` copy elsewhere in
  the app already being specific rather than generic.
- Character-count copy: "120 / 140" not "20 characters remaining" — the
  project's stat-forward visual language (`statValue`) suggests numbers
  read better as counts than as a sentence.

## 6. Anti-patterns

- **Don't** introduce a second color palette (the generic Editorial
  black/#111111/#f1f1f1 skin this skill defaults to) — Statman already has
  a token system with light/dark parity and per-sport theming; a second,
  unrelated palette for one feature would break the "flip with `.dark`"
  guarantee every other screen relies on.
- **Don't** build a new list/grid primitive for the article feed — reuse
  `EntityTile`'s grid. A `FlatList` nested inside the feed's `ScrollView`
  will misbehave, per the exact caution already documented for
  `MediaGrid.tsx`.
- **Don't** give `Textarea` a rich-text/WYSIWYG mode for this pass — no
  other input in the app has formatting, and it's a large scope increase
  (sanitization, a renderer for the reader screen) not asked for. Plain
  text with paragraph breaks only.
- **Don't** invent a fourth moderation status shape — `PENDING/APPROVED/
  REJECTED` (Claim's exact enum) is proven; Articles' extra `DRAFT` state
  (which `Claim` doesn't need, since a claim is submitted complete) is the
  only genuinely new value, not a reason to redesign the whole enum.
- **Don't** hard-code the rejection-red instinct — `REJECTED` uses
  `muted-text`, not `live`. `live` is reserved for actually-live games;
  reusing it for "rejected" would blur a color that currently has exactly
  one meaning app-wide.

## 7. QA checklist

- [ ] `articleTitle`/`articleDek`/`articleBody`/`kicker` added to both
      `Text.tsx`'s `textVariants` and `tailwind.config.js` `fontSize` (and
      the token sheet JSON, per its own "don't hand-tune without updating
      the sheet" rule) — not just one or the other.
- [ ] `articleStatusColor()` added next to `sourceStatusColor`/
      `gameStatusColor` in `lib/theme.ts`, using only existing
      `StatusColorToken` values — grep confirms no new hex/rgb literal was
      introduced.
- [ ] `ArticleCard` renders correctly in both light and dark (`.dark`
      class), including the thumbnail-loading `Skeleton` state.
- [ ] Reader screen passes the same `LoadingScreenState`/`ErrorScreenState`
      coverage every other detail screen has — verify by pulling a bad id.
- [ ] Reader screen's `BackButton`/native-header choice matches whether it
      has a hero image, per `apps/mobile/src/README.md`'s existing rule —
      don't leave a screen with neither.
- [ ] Form: empty title/body correctly disables submit; error text is
      screen-reader-linked to its field (test with VoiceOver/TalkBack, not
      just visually).
- [ ] Keyword chip remove target measures ≥44×44 (Xcode/Android Studio
      layout inspector, not eyeballed).
- [ ] Moderation queue's reject flow requires opening the `Sheet` (no
      silent one-tap reject) and the optional reason, if provided, reaches
      the author-facing "Not Published" state.
- [ ] `pnpm --filter mobile lint` (boundary check) passes — confirms new
      `modules/articles/` files only import from `shared/*` and
      `@statman/sdk`, per the existing import-boundary rules.
- [ ] `pnpm --filter mobile typecheck` clean.

## 8. Open questions for the engineering pass (not design decisions)

This doc intentionally stops short of specifying the `Article` Prisma
model, OpenAPI paths, and SDK hooks — that's an implementation task
following the patterns already established (`Claim`'s status/reviewedBy
shape, `EntityType` polymorphic target enum if articles need
comments/reactions/follows later, `packages/api-spec/src/paths/` split-file
convention). Flagging two things the design surfaced that engineering
needs to settle, not guess:

1. **Image usage value** for article thumbnails — does `ImageAsset.usage`
   gain a new enum value, or does an article thumbnail reuse `HERO`? (See
   §3.3.)
2. **Who can edit a `PENDING_REVIEW` article** — does the author retain
   edit access while it's under review (pulling it back into `DRAFT`), or
   is it locked until the admin decision, mirroring `Claim` where the
   requester can't edit a pending claim? This changes whether
   `ArticleFormScreen`'s `mode="edit"` needs a "pending, locked" read-only
   variant.
