import { ActivityIndicator, FlatList, View, useWindowDimensions } from 'react-native'
import { Link } from 'expo-router'
import { Newspaper } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { PageFrame, Screen } from '@/shared/layout'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ArticleCardLink } from '@/modules/articles/ArticleCardLink'
import { useArticlesFeed } from '@/modules/articles/useArticlesFeed'

// PageFrame centers this screen's content up to a 1180px column regardless
// of viewport width (it only grows a sidebar rail past 1024px, and this
// screen has none) — a fixed 2-column grid left most of that column empty
// on a wide desktop window. Scale columns with width instead so the grid
// actually uses the space PageFrame already gives it.
function useColumnCount() {
  const { width } = useWindowDimensions()
  if (width >= 1100) return 4
  if (width >= 700) return 3
  return 2
}

export function ArticlesListScreen() {
  const { isAuthenticated } = useAuthGate()
  const { articles, isError, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useArticlesFeed()
  const numColumns = useColumnCount()

  const writeAction = isAuthenticated ? (
    <Link href="/articles/new" asChild>
      <Button size="sm" variant="secondary">Write</Button>
    </Link>
  ) : null

  return (
    <Screen title="Articles" insetTop={false} headerActions={writeAction}>

      {isError ? (
        <ErrorState message="Articles couldn't be loaded." />
      ) : isLoading ? (
        <View className="flex-row flex-wrap gap-md px-lg">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-[47%]" />)}
        </View>
      ) : (
        <PageFrame
          main={
            <FlatList
              key={numColumns}
              data={articles}
              keyExtractor={(a) => a.id}
              numColumns={numColumns}
              contentContainerClassName="gap-md pb-xxl"
              columnWrapperClassName="gap-md"
              renderItem={({ item }) => <ArticleCardLink article={item} className="flex-1" />}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
              }}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-md" /> : null}
              ListEmptyComponent={
                <EmptyState icon={Newspaper} title="No articles yet" description="Be the first to write one." />
              }
            />
          }
        />
      )}
    </Screen>
  )
}
