# Mobile Source Boundaries

The mobile app is organized around route glue, product modules, and shared foundations.

## Folders

- `app/`: Expo Router files only. Routes read params and render module screens.
- `src/modules/`: Statman product code. Screens, hooks, connected components, and module-specific display components live flat inside the owning module.
- `src/shared/ui/`: dumb visual primitives only. No SDK hooks, navigation, or module imports.
- `src/shared/layout/`: reusable app/page layout primitives. No SDK hooks or module imports.
- `src/shared/media/`: reusable media primitives and helpers. No SDK hooks or module imports.
- `src/lib/`: app infrastructure such as SDK client setup, query client, theme helpers, and generic utilities.

## Naming

- Pure display: `PlayerCard`
- Navigates: `PlayerCardLink`
- Calls SDK hooks: `ConnectedFollowButton`
- Feature screen: `PlayerProfileScreen`
- Feature hook: `usePlayerProfile`
- Generic shell: `EntityProfileShell`

## Import Rules

- `app/` may import module screens and app infrastructure.
- `modules/*` may import `shared/*`, `lib/*`, and explicit sibling modules.
- `shared/*` may import only `shared/*`, `lib/*`, React, React Native, and third-party UI/runtime packages.
- SDK hooks belong in `use*.ts` module hooks or `Connected*.tsx` components.
- Avoid barrels in modules. Import the file you mean.
