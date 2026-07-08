import { ActivityIndicator, FlatList, View } from 'react-native'
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

export function ArticlesListScreen() {
  const { isAuthenticated } = useAuthGate()
  const { articles, isError, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useArticlesFeed()

  const writeAction = isAuthenticated ? (
    <Link href="/articles/new" asChild>
      <Button size="sm" variant="secondary">Write</Button>
    </Link>
  ) : null

  return (
    <Screen title="Articles" withBack headerActions={writeAction}>

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
              data={articles}
              keyExtractor={(a) => a.id}
              numColumns={2}
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
