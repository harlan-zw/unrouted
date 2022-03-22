import { errorNotFound, errorUnprocessableEntity, useBody, useParams } from '@unrouted/core'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

interface Article {
  id: number
  title: string
}

const storage = createStorage()

storage.mount('/output', fsDriver({ base: './output' }))

export async function getArticles() {
  const keys = await storage.getKeys()
  const items = []
  for (const k of keys)
    items.push(await storage.getItem(k))
  return items
}
export async function getArticle() {
  const { id } = useParams<{ id: number }>()
  const article = await storage.getItem(id)
  if (!article) {
    return errorNotFound({
      message: `Failed to find article with id: ${id}`,
    })
  }
  return article
}
export async function createArticle() {
  const article = useBody<Article>()
  if (!article) {
    return errorUnprocessableEntity({
      success: false,
      error: 'missing article',
    })
  }
  await storage.setItem(((await storage.getKeys()).length + 1).toString(), article)
  return article
}
export async function updateArticle() {
  const { id } = useParams<{ id: number }>()
  const updateData = useBody<Article>()
  let newArticle: null | Article = null
  const existingArticle = await storage.getItem(id) as Article

  newArticle = {
    ...existingArticle,
    ...updateData as Article,
  }
  await storage.setItem(id, newArticle)
  return newArticle
}
export async function deleteArticle(): Promise<{ message: string } | { id: number }> {
  const { id } = useParams<{ id: number }>()
  if (!await storage.hasItem(id)) {
    return errorNotFound({
      message: `Failed to find article with id: ${id}`,
    })
  }
  await storage.removeItem(id)
  return {
    id: Number.parseInt(id),
  }
}
