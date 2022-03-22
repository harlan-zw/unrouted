import { defineController, errorNotFound, errorUnprocessableEntity, useBody, useParams } from 'unrouted'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

interface Article {
  id: number
  title: string
}

const storage = createStorage()

storage.mount('/output', fsDriver({ base: './output' }))

export default defineController(() => {
  return {
    async getArticles() {
      const keys = await storage.getKeys()
      const items = []
      for (const k of keys)
        items.push(await storage.getItem(k))
      return items
    },
    async getArticle() {
      const { id } = useParams<{ id: number }>()
      const article = await storage.getItem(id)
      if (!article) {
        return errorNotFound({
          message: `Failed to find article with id: ${id}`,
        })
      }
      return article
    },
    async createArticle() {
      const article = useBody<Article>()
      if (!article) {
        return errorUnprocessableEntity({
          success: false,
          error: 'missing article',
        })
      }
      await storage.setItem(((await storage.getKeys()).length + 1).toString(), article)
      return article
    },
    async updateArticle() {
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
    },
    async deleteArticle() {
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
    },
  }
})
