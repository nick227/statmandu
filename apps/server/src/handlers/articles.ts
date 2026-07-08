import { ArticleService } from '../services/ArticleService'
import { optionalUser } from '../lib/optionalUser'

const articleService = new ArticleService()

function actor(user: any) {
  return user ? { id: user.id, role: user.role } : null
}

export async function listArticles(request: any, reply: any) {
  const user = await optionalUser(request)
  const result = await articleService.list(actor(user), request.query ?? {})
  return reply.send(result)
}

export async function getArticle(request: any, reply: any) {
  const user = await optionalUser(request)
  const article = await articleService.get(actor(user), request.params.articleId)
  return reply.send({ data: article })
}

export async function createArticle(request: any, reply: any) {
  const article = await articleService.create(request.user.id, request.body)
  return reply.status(201).send({ data: article })
}

export async function updateArticle(request: any, reply: any) {
  const article = await articleService.update(actor(request.user)!, request.params.articleId, request.body)
  return reply.send({ data: article })
}

export async function submitArticle(request: any, reply: any) {
  const article = await articleService.submit(request.user.id, request.params.articleId)
  return reply.send({ data: article })
}

export async function listArticlesForReview(request: any, reply: any) {
  const articles = await articleService.listForReview(request.query?.status)
  return reply.send({ data: articles })
}

export async function moderateArticle(request: any, reply: any) {
  const article = await articleService.moderate(request.user.id, request.params.articleId, request.body)
  return reply.send({ data: article })
}
