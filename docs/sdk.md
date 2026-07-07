# Using the SDK in another app

`@statman/sdk` is a portable, self-contained API + hook layer. Any React app
(web or React Native / Expo) can install it and get typed data access with
zero setup — this is the intended path for the upcoming Expo client.

```bash
pnpm add @statman/sdk @tanstack/react-query
```

## Setup

```typescript
import { createApiClient } from '@statman/sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

createApiClient({
  baseUrl: 'https://api.statman.dev',
  // Web uses httpOnly cookies automatically (credentials: 'include').
  // React Native has no cookie jar — inject a Bearer token from secure storage instead:
  getToken: () => SecureStore.getItem('token'),
})

// Wrap the app in <QueryClientProvider client={queryClient}>
```

## Usage

```typescript
import { usePlayers, useGameSnapshot, useCurrentUser } from '@statman/sdk'

function ExplorePage() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePlayers({ sportSlug: 'basketball' })
  // ...
}

function LiveGameScreen({ gameId }: { gameId: string }) {
  // Polls every 4s in place of a websocket room — see CLAUDE.md "Deviations"
  const { data } = useGameSnapshot(gameId)
}
```

All hooks are typed from the OpenAPI spec. No additional setup required.

## Domain hook files

| File | Covers |
|---|---|
| `useAuth.ts` | register, login, logout, current user |
| `useSports.ts` | sports, leagues |
| `useTeams.ts` | teams, roster |
| `usePlayers.ts` | player list/search/detail/create/update |
| `useGames.ts` | game list/detail/create |
| `useLiveGames.ts` | join as reporter, start live, submit/undo events, snapshot, finalize |
| `useStats.ts` | player games + season stats |
| `useMedia.ts` | YouTube attach + list |
| `useFollows.ts` / `useReactions.ts` | social layer |
| `useFeed.ts` | paginated activity feed |
| `useSources.ts` / `useDisputes.ts` / `useClaims.ts` | verification, disputes, profile claims |
