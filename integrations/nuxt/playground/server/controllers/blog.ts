import {useBody, useParams} from "unrouted";
import {setStatusCode} from "unrouted";

type Article = {
  id: number
  title: string
}
let articles : Article[] = [
  { id: 1, title: 'hi' }
]

export function getArticles () {
  return articles
}

export function getArticle() {
  const {slug: id} = useParams<{ slug: number }>()
  console.log(articles.find(article => article.id == id), id, articles)
  return articles.find(article => article.id == id)
}

export function createArticle() {
  const article = useBody<Article>()
  if (!article) {
    setStatusCode(422)
    return {
      success: false,
      error: 'missing article'
    }
  }
  articles.push(article as Article)
  return article
}

export function updateArticle() {
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
}

export function deleteArticle () {
  const {id} = useParams<{ id: number }>()
  articles = articles.filter(article => article.id !== id)
  return {
    id
  }
}
