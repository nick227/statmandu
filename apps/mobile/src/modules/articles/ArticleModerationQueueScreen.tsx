import { FlatList, View } from 'react-native'
import { Stack } from 'expo-router'
import { Newspaper } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { ConnectedArticleReviewCard } from '@/modules/articles/ConnectedArticleReviewCard'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useArticlesQueue } from '@/modules/articles/useArticlesQueue'

// Mirrors ClaimsQueueScreen.tsx — same admin-queue shell, second entry
// alongside the Claims queue rather than a separate admin app. Not yet
// linked from AdminHubScreen (see the moderation queue wiring note in the
// design-system-articles.md follow-up) — that file is mid-edit elsewhere
// right now, so this route is reachable directly at /articles/review.
export function ArticleModerationQueueScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { articles, isError, isLoading } = useArticlesQueue()

  if (!isAuthLoading && !isAdmin) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Article Review' }} />
        <SignInPrompt message="Sign in as an admin to review articles." />
      </>
    )
  }

  return (
    <View className="flex-1 bg-canvas p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Article Review' }} />
      {/* Bounded to a reading-list column (same measure the write form uses)
          instead of a full-bleed FlatList — a queue of a handful of cards
          read as a stray, abandoned box on a wide desktop viewport
          otherwise. See docs/design-system-articles.md §3.4. */}
      <View className="w-full max-w-[720px] flex-1 self-center">
      {isError ? (
        <ErrorState message="Articles couldn't be loaded." />
      ) : isLoading ? (
        <View className="gap-sm">
          {[0, 1].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(a) => a.id}
          contentContainerClassName="gap-sm pb-xxl"
          renderItem={({ item }) => (
            <ConnectedArticleReviewCard
              articleId={item.id}
              title={item.title}
              byline={item.author.displayName ?? item.author.username ?? 'Unknown'}
            />
          )}
          ListEmptyComponent={<EmptyState icon={Newspaper} title="No articles awaiting review" />}
        />
      )}
      </View>
    </View>
  )
}
