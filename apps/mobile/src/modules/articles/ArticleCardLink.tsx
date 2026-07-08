import { Link } from 'expo-router'
import type { components } from '@statman/sdk'
import { ArticleTile } from '@/shared/ui/ArticleTile'
import { Badge } from '@/shared/ui/Badge'
import { articleStatusColor } from '@/lib/theme'

type Article = components['schemas']['Article']

export interface ArticleCardLinkProps {
  article: Article
  className?: string
}

function relativeDate(value?: string | null) {
  if (!value) return null
  const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ArticleCardLink({ article, className }: ArticleCardLinkProps) {
  const byline = article.author.displayName ?? article.author.username ?? 'Unknown'
  const date = relativeDate(article.publishedAt)
  const keywords = article.keywords ?? []

  return (
    <Link href={{ pathname: '/articles/[articleId]', params: { articleId: article.id } } as never} asChild>
      <ArticleTile
        title={article.title}
        imageUri={article.thumbnailUrl}
        meta={`By ${byline}${date ? ` · ${date}` : ''}`}
        kicker={keywords[0]}
        badge={article.status !== 'PUBLISHED' ? (
          <Badge tone={articleStatusColor(article.status)}>
            {article.status === 'PENDING_REVIEW' ? 'In Review' : article.status === 'REJECTED' ? 'Not Published' : article.status}
          </Badge>
        ) : undefined}
        className={className}
      />
    </Link>
  )
}
