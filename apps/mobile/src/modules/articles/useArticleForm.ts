import { useEffect, useState } from 'react'
import { useArticle, useCreateArticle, useSubmitArticle, useUpdateArticle } from '@statman/sdk'

const KEYWORD_LIMIT = 10

function normalizeKeyword(raw: string) {
  return raw.trim().toLowerCase().replace(/[,#]/g, '')
}

// Backs the one shared article-editing surface used by a first-time author,
// an author editing their own DRAFT/REJECTED article, and an admin editing
// before publish — see docs/design-system-articles.md §3.3. The article is
// created as a DRAFT on first save (no id yet), then every later save PATCHes
// it — same create-then-refine shape as useAthleteOnboarding's player step.
export function useArticleForm(articleId?: string) {
  const articleQuery = useArticle(articleId ?? '')
  const [createdArticleId, setCreatedArticleId] = useState<string | null>(null)
  const resolvedArticleId = articleId ?? createdArticleId ?? ''

  const createArticle = useCreateArticle()
  const updateArticle = useUpdateArticle(resolvedArticleId)
  const submitArticle = useSubmitArticle(resolvedArticleId)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  const article = articleQuery.data?.data
  useEffect(() => {
    if (article && !hydrated) {
      setTitle(article.title)
      setBody(article.body)
      setKeywords(article.keywords ?? [])
      setHydrated(true)
    }
  }, [article, hydrated])

  function addKeyword(raw: string) {
    const value = normalizeKeyword(raw)
    if (!value || keywords.includes(value) || keywords.length >= KEYWORD_LIMIT) return
    setKeywords((prev) => [...prev, value])
  }

  function removeKeyword(value: string) {
    setKeywords((prev) => prev.filter((keyword) => keyword !== value))
  }

  async function save() {
    if (!resolvedArticleId) {
      const result = await createArticle.mutateAsync({ title, body, keywords })
      setCreatedArticleId(result.data.id)
      return
    }
    await updateArticle.mutateAsync({ title, body, keywords })
  }

  async function submit() {
    if (!resolvedArticleId) return
    await submitArticle.mutateAsync()
  }

  const isValid = title.trim().length > 0 && body.trim().length > 0
  // An author can keep editing a DRAFT or a REJECTED (bounced-back) article;
  // once it's PENDING_REVIEW or PUBLISHED it's locked for the author. The
  // screen decides whether to override this for an admin.
  const isLockedForAuthor = Boolean(article) && article!.status !== 'DRAFT' && article!.status !== 'REJECTED'

  return {
    articleId: resolvedArticleId || null,
    article,
    isLoadingExisting: Boolean(articleId) && articleQuery.isLoading,
    isErrorExisting: articleQuery.isError,
    title,
    setTitle,
    body,
    setBody,
    keywords,
    addKeyword,
    removeKeyword,
    save,
    submit,
    isSaving: createArticle.isPending || updateArticle.isPending,
    isSubmitting: submitArticle.isPending,
    saveError: createArticle.error ?? updateArticle.error,
    isValid,
    isLockedForAuthor,
    titleMax: 140,
  }
}
