import {defineController, errorNotFound, errorUnprocessableEntity, useBody, useParams} from "unrouted";

type Article = {
  id: number
  title: string
}
let articles : Article[] = [
  { id: 1, title: 'hi' }
]

export default defineController(() => {
  return {
    getArticles () {
      return articles
    },
    getArticle() {
      const { id } = useParams<{ id: number }>()
      const article = articles.find(article => article.id == id)
      if (!article) {
        return errorNotFound({
          message: 'Failed to find article with id: ' + id
        })
      }
      return article
    },
    createArticle() {
      const article = useBody<Article>()
      if (!article) {
        return errorUnprocessableEntity({
          success: false,
          error: 'missing article'
        })
      }
      articles.push(article as Article)
      return article
    },
    updateArticle() {
      const {id} = useParams<{ id: number }>()
      const updateData = useBody<Article>()
      let newArticle: null | Article = null
      articles = articles.map((article) => {
        if (article.id !== id) {
          return article
        }
        newArticle = {
          ...article,
          ...updateData as Article,
        }
        return newArticle
      })
      return newArticle
    },
    deleteArticle () {
      const {id} = useParams<{ id: number }>()
      articles = articles.filter(article => article.id !== id)
      return {
        id
      }
    }
  }
})
