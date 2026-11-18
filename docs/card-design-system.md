# Statman Premium Card System

## Context and goals

Statman cards are premium print products represented online, not responsive content cards. Card 1A establishes the required physical geometry, front/back anatomy, asset boundaries, and one site-wide interaction model that later variants must preserve.

## Design tokens and foundations

- Trim canvas must be 1500 × 2100 px at 600 DPI: 2.5 × 3.5 inches and exactly 5:7.
- Online Card 1A must render at 320 × 448 CSS px. The complete interactive stage is 368px wide, including 24px exterior-control clearance on both sides.
- Cards must not grow for featured, detail, grid, or rail placement. Shrink-to-fit is allowed only when a device is narrower than the 368px interaction stage.
- Printable canvas must be 1650 × 2250 px: 2.75 × 3.75 inches, including 75 px/0.125 inch bleed on every edge.
- Critical text, marks, faces, and statistics must remain at least 90 px inside the trim edge.
- The outer frame and bottom identity plate are structural assets. Photo treatments must never replace, cover, or resize them.
- The 8-point spacing system must be used for online previews. Print measurements must scale from the 1500 × 2100 master rather than CSS viewport units.
- Front and back must use the same frame palette, border weight, corner treatment, set identity, and typography family.
- Generated photography must contain no text, borders, logos, badges, nameplates, or interface elements. Those are deterministic card assets.

## Component-level rules

### Card 1A front

1. The common outer frame encloses the complete trim canvas.
2. The photo is inset into a bordered window and occupies approximately 80% of the available interior height.
3. The permanent lower plate occupies approximately 20% and must contain athlete name, team/title line, `STATMAN`, and edition/set information.
4. Athlete names must be uppercase, single-line, and truncated rather than reduced below the minimum rail size.
5. Foil treatment may change surface finish only. It must not change anatomy or information placement.

### Card 1A back

1. The back must repeat the common frame and interior stock color.
2. The masthead must contain `STATMAN`, `Card 1A`, card type, and team mark.
3. Athlete identity and set name must precede biography copy.
4. Statistics must use a ruled print ledger, not tiles, pills, or translucent panels.
5. Card number, edition, and copyright must remain in the fixed bottom legal line.

### Online flip interaction

- Every online card must render through `Card1A`, which delegates interaction to `FlippableCard`.
- Cards must open on the front unless a controlled builder preview explicitly selects the back.
- A 44 px-high half-circle control must sit completely outside the vertical midpoint of each trim edge. Its flat side must align flush with the card; it must never cover printed artwork.
- The left control must animate a leftward flip; the right control must animate a rightward flip.
- A horizontal swipe of at least 48 px must flip in the swipe direction. Vertical movement must not trigger a flip.
- Flip duration is 360 ms. Reduced-motion mode must change sides without animation.
- Flip controls are online affordances and must never appear in print or downloadable artwork.
- Navigation, claiming, saving, publishing, and selection must remain outside the flippable card. Do not wrap the card in a link or pressable.

### States and responsive behavior

- Default: front visible, both flip controls available.
- Back: same controls remain available and announce that they will show the front.
- Active: the selected control darkens; duplicate flip requests are ignored until animation completes.
- Loading/error: preserve the full 5:7 footprint so surrounding layout does not shift.
- Rail: horizontally scroll full 320 × 448 cards; do not create thumbnails or reduce typography.
- Featured/detail: use the same 320 × 448 card. Emphasis belongs in surrounding layout and actions, not card enlargement.

## Accessibility requirements and testable acceptance criteria

- Each edge control must expose button semantics and a label containing direction and destination side.
- Effective pointer targets must be at least 44 × 44 px, including hit slop.
- The card container must announce athlete name and currently visible side.
- Keyboard users must be able to focus and activate either flip control.
- When reduced motion is enabled, the side must change with zero-duration animation.
- A mostly vertical gesture must not flip the card.
- Navigation and action links must be siblings of the card so rendered HTML contains no nested interactive elements.

## Content and tone standards

- Athlete name: official display name; do not add promotional adjectives.
- Biography: concise, factual, and limited to five lines on Card 1A.
- Statistics: label/value pairs sourced from the saved snapshot; do not invent missing values.
- Set and edition copy: short production language such as `Statman Debut`, `Unlimited`, or `12/100`.
- Brand mark must be written as `STATMAN` on the printed artifact.

## Anti-patterns and prohibited implementations

- Do not render a landscape image with text layered like a website hero.
- Do not create one-off flip logic in rails, detail screens, review screens, or builders.
- Do not omit the back at smaller sizes.
- Do not place badges, buttons, gradients used as readability scrims, or application status controls inside the printed anatomy.
- Do not wrap a flippable card in a navigation link or selection pressable.
- Do not include edge controls or other online chrome in print exports.
- Existing cards that bypass `Card1A` must migrate to the shared component before new variations are introduced.

## QA checklist

- [ ] Front and back are exactly 5:7 on every screen.
- [ ] Printable output is 1650 × 2250 px with 75 px bleed per edge.
- [ ] Both half-circle controls are vertically centered and keyboard operable.
- [ ] Flip controls sit outside the trim edge and do not cover either card face.
- [ ] Left tap, right tap, left swipe, and right swipe each flip correctly.
- [ ] Reduced-motion mode changes sides without animation.
- [ ] Front and back share frame, palette, radius, set, and card number.
- [ ] Player identity and `STATMAN` remain part of the card at rail size.
- [ ] Card navigation and workflow actions remain outside the card.
- [ ] No nested links or buttons are emitted on web.
- [ ] Builder, review, rail, featured, and detail surfaces all use `Card1A`.
