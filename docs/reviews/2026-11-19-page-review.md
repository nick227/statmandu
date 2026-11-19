# RARE adversarial page review — November 19, 2026

Reviewed the running local web app at `http://localhost:8081` in Chromium.
Desktop: 1440×1000 and 1440×900. Phone: 390×844/900. Additional Studio checks:
768×900 and 1024×900. Reviewed discovery, Studio, public card detail, public
person profile, login, and signed-out collection/account states. Authenticated
collection management, saving, publication and storefront management were not
reviewed. No application code was changed or data published. The working tree
is under active development; findings describe the captured version.

**Verdict:** the visual system is recognizable, but several basic rendering and
responsive-layout failures prevent a convincing product demonstration. Correct
those before adding styles, templates, gradients or more page sections.

## P1 — fix before demonstrating the core journey

### 1. Classic Collector hides the selected artwork

Studio shows a large empty navy rectangle although an artwork thumbnail is
selected. Confirmed at 390, 768, 1024 and 1440 widths. This is not a network
failure: the image had `complete=true`, natural width 800 and opacity 1.
`elementsFromPoint` at its center identifies `layer-rect-dec-inner-mat` and
`layer-rect-dec-outer-frame` above the image. These opaque decorative rectangles
cover the portrait.

Inspect `modules/designs/flagshipDesigns.ts:112` and the ordered layer composition;
`modules/cards/CardCompositionRenderer.tsx:134` renders that order literally.
Place opaque frame/mat backgrounds behind artwork, or represent the frame as
actual edges. Do not solve this by randomly raising every image above text.
Acceptance: selected image visibly occupies its intended window and text/frame
remain visible, including after changing the image and design.

### 2. Initial Studio preview disagrees with the form

On fresh load, the form says `POETRY · AUTHOR` and a biography beginning
`Celebrated poet…`; the preview says `POET & CIVIL RIGHTS ICON` and
`Phenomenal Woman…`. Changing the name to `REVIEW NAME CHANGE` updates the preview
and also reconciles the other text. Editing works; initial state is inconsistent.
A preview users cannot trust is a functional defect.

Inspect `modules/studio/hooks/useCardStudioState.ts:170` (initial composition)
and `:231` (font-ready compilation effect). Initialize/compile from the same
resolved content shown in the inputs. Verify both cold and cached font loads.
Acceptance: preview matches displayed field values before any interaction.

### 3. Discovery crops the collectible itself

Featured tiles are 288px wide (`w-72`) with 16px inner padding, but embed the
rail-sized card component, whose layout includes a 368px footprint. The outer
tile uses `overflow-hidden`. The result visibly cuts off the collectible border
and external controls. This occurs on desktop as well as mobile; it is not merely
an intentional peek of the next carousel item.

Inspect `modules/discover/DiscoverScreen.tsx:338` and `:458`.
Scale the full collectible/interaction footprint to the tile's actual inner width.
Acceptance: all four card edges remain visible in both rails and grids; only the
next carousel item may be intentionally clipped by the carousel viewport.

### 4. Phone discovery overflows the viewport

At a 390px viewport, document scroll width is **548px**. Section descriptions and
right-side navigation are laid out as a rigid row. `Browse catalog` ends around
x=464; `See all people` ends around x=500. The template subtitle and `Browse all`
run together. This makes the whole page horizontally scrollable.

Inspect section heading rows in `modules/discover/DiscoverScreen.tsx:245`, `:315`,
`:349`, `:397`. Allow the text column to shrink/wrap and place secondary links
below it on narrow screens. Do not mask the defect with body overflow suppression.
Acceptance: document scroll width equals viewport width at 390px; section links
remain readable and reachable. Check 320px and 200% zoom during the fix.

### 5. Studio title and saved-design controls overlap

At 390px the title input occupies x=16–291, while Saved occupies x≈272–374: about
19px of overlap. The Draft badge and Saved label visibly collide. The same
collision occurs at the 768px tablet layout.

Inspect `modules/studio/components/StudioTopBar.tsx:67`. The flexible title,
minimum width, revision badge and sibling actions do not fit as currently arranged.
Use explicit mobile rows: title/status, then saved designs/actions. Preserve
adequate input width without permitting siblings to overlap.
Acceptance: no intersecting control rectangles at 390, 768, 1024 or 1440 widths.

## P2 — usability and design discipline

### 6. Desktop sign-in has no form geometry

At 1440px the inputs and button span approximately 1392px. A short credential
form looks like a page-wide data-entry strip. Inputs are about 34px high and use
placeholders instead of persistent labels. Once filled, their visible purpose
is lost. Studio content fields have the same labeling weakness.

`modules/auth/LoginScreen.tsx:12` needs a centered form width around 400–440px,
persistent labels, and consistent control heights. Use the existing 44px control
convention for primary form inputs. Do not change every public page to this narrow
width; forms and card workspaces have different needs.

### 7. Discovery delays and misrepresents its product

On the 1440px capture, actual releases begin around y=1158, below a large hero
and a template rail. The template previews are palette blocks, not actual designs,
so users cannot judge typography, portrait framing or information hierarchy.
The copy claims they are “crafted by master typographers” without demonstrating
that quality. Two releases repeat under Featured and New, producing a long sparse
page rather than useful breadth.

Reduce hero height, show real card thumbnails, and avoid redundant sections when
the same small inventory fills both. Replace unsupported prestige language with
plain descriptions of available designs. This is curation/spacing work, not a
request for new backend ranking features.

### 8. Public detail gives technical metadata more space than collecting

The edition and origin-hash panels dominate the right column. The primary
signed-out collection action is a centered text link. Raw database identifiers
appear as creator handles (`@cmran…`) on discovery and detail pages. That looks
unfinished and suggests a username that is not one.

Make the collect/sign-in action the clear primary button. Keep authenticity
available but compact, with the full hash in a disclosure. Display a genuine
public username/name, or a neutral creator label until one is available.

### 9. Empty states repeat actions without adding direction

The empty public person page repeats the name in two headings and offers Create
Card, New Edition and Create First Card for the same destination. Collection's
signed-out state is essentially one long button on a blank page and promises a
“creator sales dashboard,” which overstates the POC's commerce scope.

Use one dominant action per state and name it consistently. Say what the user can
actually do now: sign in to collect cards, or create this person's first card.
Do not add dashboard scaffolding merely to fill the white space.

### 10. Mobile Studio separates editing from feedback

At 390×844, the full-size preview consumes nearly the entire first screen; subject
and content controls start below it. Users edit well below the preview and must
scroll back to inspect changes. The 36px toolbar buttons and roughly 22px media
filter pills also feel cramped compared with the large canvas.

For the POC, a compact preview or an explicit Edit/Preview switch is enough. Keep
one obvious route back to the preview; do not build a second editor. Use consistent
interactive target sizing rather than shrinking controls to compensate for layout.

## Smallest useful correction order

1. Fix artwork layering and initial preview/form agreement.
2. Fix clipped collectibles, homepage overflow, and Studio toolbar collisions.
3. Constrain the login form and label inputs.
4. Remove misleading copy and redundant actions.

Do not spend the next iteration redesigning the brand. The current palette and
basic shell are adequate for a POC once geometry and preview correctness work.

## Evidence

Screenshots and browser probes are in `/tmp/rare-page-review/`:

- `desktop-home.png`, `phone-home.png`
- `desktop-cards-studio.png`, `phone-cards-studio.png`, `studio-768.png`
- `phone-studio-edited.png` (ephemeral input edit, not saved)
- `desktop-login.png`, `phone-collection.png`
- `detail-1440.png`, `detail-390.png`, `person-1440.png`, `person-390.png`

Full-page captures place fixed navigation at its viewport position; that is not
by itself evidence of misplaced page content. Screenshots are supporting evidence;
measured document overflow and overlapping control bounds establish those findings.
