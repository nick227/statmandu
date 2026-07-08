import { FlatList, View } from 'react-native'
import { Link } from 'expo-router'
import { Newspaper } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Button } from '@/shared/ui/Button'
import { Screen } from '@/shared/layout'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ArticleCardLink } from '@/modules/articles/ArticleCardLink'
import { useArticlesFeed } from '@/modules/articles/useArticlesFeed'

export function MyArticlesScreen() {
  const { user, isAuthenticated, isAuthLoading } = useAuthGate()
  const { articles, isError, isLoading } = useArticlesFeed(user ? { authorUserId: user.id } : undefined)

  if (!isAuthLoading && !isAuthenticated) {
    return <SignInPrompt message="Sign in to see the articles you've written." />
  }

  return (
    <Screen title="My Articles">
      <View className="px-lg pb-md">
        <Link href="/articles/new" asChild>
          <Button size="sm">Write a new article</Button>
        </Link>
      </View>

      {isError ? (
        <ErrorState message="Your articles couldn't be loaded." />
      ) : isLoading ? (
        <View className="flex-row flex-wrap gap-md px-lg">
          {[0, 1].map((i) => <Skeleton key={i} className="h-40 w-[47%]" />)}
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(a) => a.id}
          numColumns={2}
          contentContainerClassName="gap-md px-lg pb-xxl"
          columnWrapperClassName="gap-md"
          renderItem={({ item }) => <ArticleCardLink article={item} className="flex-1" />}
          ListEmptyComponent={
            <EmptyState icon={Newspaper} title="You haven't written anything yet" description="Start your first article." />
          }
        />
      )}
    </Screen>
  )
}
