import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { db } from '$lib/server/db'
import { deleteFile, getFiles, uploadFile } from '$lib/server/files'
import { newsCategorySchema, newsSchema, newsTagSchema } from '$lib/utils/validations'
import {
  addNews,
  addNewsCategory,
  addNewsTag,
  deleteNews,
  deleteNewsCategory,
  deleteNewsTag,
  getNewsById,
  getNewsCategoryById,
  getNewsTagById,
  updateNews,
  updateNewsCategory,
  updateNewsTag
} from '$lib/server/news'
import path_ from 'node:path'
import { randomBytes } from 'node:crypto'

export const load = (async (event) => {
  const domain = event.url.origin
  const user = event.locals.user

  if (!user?.p_news) {
    throw redirect(303, '/dashboard')
  }

  try {
    let news, newsCategories, newsTags, images
    try {
      news = await db.news.findMany({
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, username: true } }, categories: true, tags: true }
      })
    } catch (err) {
      console.error('Failed to load news:', err)
      throw new ServerError('Failed to load news', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      newsCategories = await db.newsCategory.findMany({ orderBy: { name: 'asc' } })
    } catch (err) {
      console.error('Failed to load news categories:', err)
      throw new ServerError('Failed to load news categories', err, NotificationCode.DATABASE_ERROR, 500)
    }

    try {
      newsTags = await db.newsTag.findMany({ orderBy: { name: 'asc' } })
    } catch (err) {
      console.error('Failed to load news tags:', err)
      throw new ServerError('Failed to load news tags', err, NotificationCode.DATABASE_ERROR, 500)
    }

    images = await getFiles(domain, 'images')

    return { news, newsCategories, newsTags, images }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  addEditNews: async (event) => {
    const user = event.locals.user

    if (!user?.p_news) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const raw = {
      newsId: form.get('news-id'),
      title: form.get('title'),
      content: form.get('content'),
      categoriesId: form.getAll('categories'),
      tagsId: form.getAll('tags')
    }

    const result = newsSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { newsId, title, content, categoriesId, tagsId } = result.data

    try {
      if (newsId) {
        const news = await getNewsById(newsId)
        if (!news) {
          console.warn(`News with ID ${newsId} not found`)
          throw new BusinessError('News not found', NotificationCode.NOT_FOUND, 404)
        }

        if (user.id !== news.authorId) {
          throw new BusinessError('You are not the author of this news', NotificationCode.FORBIDDEN, 403)
        }

        await updateNews(newsId, { title, content }, categoriesId ?? [], tagsId ?? [])
      } else {
        await addNews(title, content, user.id, categoriesId ?? [], tagsId ?? [])
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteNews: async (event) => {
    const user = event.locals.user

    if (!user?.p_news) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const newsId = form.getAll('news-id')

    try {
      for (const id of newsId) {
        if (typeof id !== 'string') continue

        const news = await getNewsById(id)
        if (!news) {
          console.warn(`News with ID ${id} not found`)
          throw new BusinessError('News not found', NotificationCode.NOT_FOUND, 404)
        }

        if (user.id !== news.authorId && !user.isAdmin && user.p_news !== 2) {
          throw new BusinessError('You are not the author of this news', NotificationCode.FORBIDDEN, 403)
        }

        await deleteNews(id)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  uploadImages: async (event) => {
    const user = event.locals.user

    if (!user?.p_news) {
      throw redirect(303, '/dashboard')
    }

    const formData = await event.request.formData()
    const images = formData.getAll('images')

    try {
      for (const image of images) {
        if (!(image instanceof File)) continue

        const newName = `${randomBytes(8).toString('hex')}${path_.extname(image.name)}`
        const newImage = new File([image], newName, { type: image.type })

        await uploadFile('images', '', newImage)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteImage: async (event) => {
    const user = event.locals.user

    if (!user?.p_news) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const imageName = form.get('image-name')

    try {
      if (typeof imageName !== 'string') return

      await deleteFile('images', imageName)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  addEditCategory: async (event) => {
    const user = event.locals.user

    if (!user?.p_newsCategories) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const raw = {
      categoryId: form.get('category-id'),
      name: form.get('name')
    }

    const result = newsCategorySchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { categoryId, name } = result.data

    try {
      if (categoryId) {
        const category = await getNewsCategoryById(categoryId)
        if (!category) {
          console.warn(`News category with ID ${categoryId} not found`)
          throw new BusinessError('News category not found', NotificationCode.NOT_FOUND, 404)
        }

        await updateNewsCategory(categoryId, name)
      } else {
        await addNewsCategory(name)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteCategory: async (event) => {
    const user = event.locals.user

    if (!user?.p_newsCategories) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const categoryId = form.get('category-id')

    try {
      if (typeof categoryId !== 'string') return

      await deleteNewsCategory(categoryId)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  addEditTag: async (event) => {
    const user = event.locals.user

    if (!user?.p_newsTags) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const raw = {
      tagId: form.get('tag-id'),
      name: form.get('name'),
      color: form.get('color')
    }

    const result = newsTagSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { tagId, name, color } = result.data

    try {
      if (tagId) {
        const tag = await getNewsTagById(tagId)
        if (!tag) {
          console.warn(`News tag with ID ${tagId} not found`)
          throw new BusinessError('News tag not found', NotificationCode.NOT_FOUND, 404)
        }

        await updateNewsTag(tagId, name, color)
      } else {
        await addNewsTag(name, color)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteTag: async (event) => {
    const user = event.locals.user

    if (!user?.p_newsTags) {
      throw redirect(303, '/dashboard')
    }

    const form = await event.request.formData()
    const tagId = form.get('tag-id')

    try {
      if (typeof tagId !== 'string') return

      await deleteNewsTag(tagId)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}
