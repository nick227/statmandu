import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { X } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { ErrorScreenState, LoadingScreenState } from '@/shared/layout'
import { useNativeColor } from '@/lib/theme'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedImageUploadButton } from '@/modules/media/ConnectedImageUploadButton'
import { useArticleForm } from '@/modules/articles/useArticleForm'

export interface ArticleFormScreenProps {
  /** Omit to create a new article; pass an existing id to edit it. */
  articleId?: string
}

function KeywordChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const mutedColor = useNativeColor('mutedText')
  return (
    <Pressable
      onPress={onRemove}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className="flex-row items-center gap-xs rounded-pill bg-muted-text/15 px-sm py-xs"
    >
      <Text className="text-stat-label text-muted-text">{label}</Text>
      <X size={11} color={mutedColor} />
    </Pressable>
  )
}

export function ArticleFormScreen({ articleId }: ArticleFormScreenProps) {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading, isAdmin } = useAuthGate()
  const form = useArticleForm(articleId)
  const [keywordDraft, setKeywordDraft] = useState('')

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: articleId ? 'Edit Article' : 'Write Article' }} />
        <SignInPrompt message="Sign in to write an article." />
      </>
    )
  }

  if (form.isLoadingExisting) {
    return <LoadingScreenState withBack />
  }
  if (form.isErrorExisting) {
    return <ErrorScreenState withBack message="This article couldn't be loaded." />
  }

  const editable = !form.isLockedForAuthor || isAdmin
  const canSubmitForReview = Boolean(form.articleId) && !form.isLockedForAuthor

  return (
    <View className="flex-1 bg-canvas p-lg">
      <Stack.Screen options={{ headerShown: true, title: articleId ? 'Edit Article' : 'Write Article' }} />

      {/* Capped at the same measure the reader screen uses for body text —
          without it, the title input and body textarea stretch full-bleed
          on a wide desktop viewport, which is uncomfortable to type into
          and scan. See docs/design-system-articles.md §3.3. */}
      <View className="w-full max-w-[640px] gap-md self-center">
      {!editable ? (
        <View className="rounded-md border border-border bg-surface p-md">
          <Text variant="caption">
            This article is {form.article?.status === 'PENDING_REVIEW' ? 'awaiting review' : 'published'} and can no longer be edited here.
          </Text>
        </View>
      ) : (
        <>
          <View className="gap-xs">
            <Input
              placeholder="Article title"
              value={form.title}
              onChangeText={form.setTitle}
              maxLength={form.titleMax}
            />
            <Text variant="caption" className="text-right">{form.title.length} / {form.titleMax}</Text>
          </View>

          <View className="gap-xs">
            <Text variant="statLabel">Keywords</Text>
            <View className="flex-row flex-wrap gap-xs">
              {form.keywords.map((keyword) => (
                <KeywordChip key={keyword} label={keyword} onRemove={() => form.removeKeyword(keyword)} />
              ))}
            </View>
            <Input
              placeholder="Add a keyword, then press enter"
              value={keywordDraft}
              onChangeText={setKeywordDraft}
              onSubmitEditing={() => {
                form.addKeyword(keywordDraft)
                setKeywordDraft('')
              }}
              returnKeyType="done"
            />
          </View>

          <Textarea
            size="lg"
            placeholder="Write the article..."
            value={form.body}
            onChangeText={form.setBody}
          />

          {form.articleId ? (
            <ConnectedImageUploadButton
              targetType="ARTICLE"
              targetId={form.articleId}
              usage="HERO"
              mode="tile"
              title="Thumbnail"
              currentImageUri={form.article?.thumbnailUrl}
            />
          ) : (
            <Text variant="caption">Save a draft to add a thumbnail.</Text>
          )}

          {form.saveError ? <Text className="text-live">{form.saveError.message}</Text> : null}

          <View className="flex-row gap-sm">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={!form.isValid}
              isLoading={form.isSaving}
              onPress={() => form.save()}
            >
              Save Draft
            </Button>
            {canSubmitForReview ? (
              <Button
                className="flex-1"
                isLoading={form.isSubmitting}
                onPress={async () => {
                  await form.submit()
                  router.back()
                }}
              >
                Submit for Review
              </Button>
            ) : null}
          </View>

          {form.article?.status === 'REJECTED' ? (
            <Badge tone="dispute">Previously rejected — edits will resubmit for review</Badge>
          ) : null}
        </>
      )}
      </View>
    </View>
  )
}
