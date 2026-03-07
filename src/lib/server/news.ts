import { db } from './db'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import { Prisma, type News, type NewsCategory, type NewsTag } from '@prisma/client'
import type { ExtendedNews } from '$lib/utils/db'

export async function getNews(limit: number = 20): Promise<ExtendedNews[]> {
  let news
  try {
    news = await db.news.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true } },
        categories: true,
        tags: true
      }
    })
    return news
  } catch (err) {
    console.error('Failed to get news:', err)
    throw new ServerError('Failed to get news', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getNewsById(newsId: string): Promise<News | null> {
  let news
  try {
    news = await db.news.findUnique({ where: { id: newsId } })
    return news
  } catch (err) {
    console.error('Error fetching news by ID:', err)
    throw new ServerError('Error fetching news by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addNews(title: string, content: string, authorId: string, categoriesId: string[], tagsId: string[]): Promise<void> {
  try {
    await db.news.create({
      data: {
        title,
        content,
        authorId,
        categories: { connect: categoriesId.map((category) => ({ id: category })) },
        tags: { connect: tagsId.map((tag) => ({ id: tag })) }
      }
    })
  } catch (err) {
    console.error('Failed to add news:', err)
    throw new ServerError('Failed to add news', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateNews(newsId: string, news: { title: string; content: string }, categoriesId: string[], tagsId: string[]): Promise<void> {
  try {
    await db.news.update({
      where: { id: newsId },
      data: {
        title: news.title,
        content: news.content,
        categories: { set: categoriesId.map((category) => ({ id: category })) },
        tags: { set: tagsId.map((tag) => ({ id: tag })) }
      }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News with ID ${newsId} not found`)
      throw new BusinessError('News not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit news:', err)
    throw new ServerError('Failed to edit news', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteNews(newsId: string): Promise<void> {
  try {
    await db.news.delete({ where: { id: newsId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News with ID ${newsId} not found`)
      throw new BusinessError('News not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting news:', err)
    throw new ServerError('Error deleting news', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

//* News Categories

export async function getNewsCategories(): Promise<NewsCategory[]> {
  let categories
  try {
    categories = await db.newsCategory.findMany({
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (err) {
    console.error('Failed to get news categories:', err)
    throw new ServerError('Failed to get news categories', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function getNewsCategoryById(categoryId: string): Promise<NewsCategory | null> {
  let category
  try {
    category = await db.newsCategory.findUnique({ where: { id: categoryId } })
    return category
  } catch (err) {
    console.error('Error fetching news category by ID:', err)
    throw new ServerError('Error fetching news category by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addNewsCategory(name: string): Promise<void> {
  try {
    await db.newsCategory.create({ data: { name } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`News category with name ${name} already exists`)
      throw new BusinessError('News category already exists', NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS, 400)
    }
    console.error('Failed to add news category:', err)
    throw new ServerError('Failed to add news category', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateNewsCategory(categoryId: string, name: string): Promise<void> {
  try {
    await db.newsCategory.update({ where: { id: categoryId }, data: { name } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`News category with name ${name} already exists`)
      throw new BusinessError('News category already exists', NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS, 400)
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News category with ID ${categoryId} not found`)
      throw new BusinessError('News category not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit news category:', err)
    throw new ServerError('Failed to edit news category', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteNewsCategory(categoryId: string): Promise<void> {
  try {
    await db.newsCategory.update({
      where: { id: categoryId },
      data: { news: { set: [] } }
    })

    await db.newsCategory.delete({ where: { id: categoryId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News category with ID ${categoryId} not found`)
      throw new BusinessError('News category not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting news category:', err)
    throw new ServerError('Error deleting news category', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

//* News Tags

export async function getNewsTagById(tagId: string): Promise<NewsTag | null> {
  let tag
  try {
    tag = await db.newsTag.findUnique({ where: { id: tagId } })
    return tag
  } catch (err) {
    console.error('Error fetching news tag by ID:', err)
    throw new ServerError('Error fetching news tag by ID', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function addNewsTag(name: string, color: string = '#000000'): Promise<void> {
  try {
    await db.newsTag.create({ data: { name, color } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`News tag with name ${name} already exists`)
      throw new BusinessError('News tag already exists', NotificationCode.NEWS_TAG_ALREADY_EXISTS, 400)
    }
    console.error('Failed to add news tag:', err)
    throw new ServerError('Failed to add news tag', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function updateNewsTag(tagId: string, name: string, color: string): Promise<void> {
  try {
    await db.newsTag.update({ where: { id: tagId }, data: { name, color } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      console.warn(`News tag with name ${name} already exists`)
      throw new BusinessError('News tag already exists', NotificationCode.NEWS_TAG_ALREADY_EXISTS, 400)
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News tag with ID ${tagId} not found`)
      throw new BusinessError('News tag not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Failed to edit news tag:', err)
    throw new ServerError('Failed to edit news tag', err, NotificationCode.DATABASE_ERROR, 500)
  }
}

export async function deleteNewsTag(tagId: string): Promise<void> {
  try {
    await db.newsTag.update({
      where: { id: tagId },
      data: { news: { set: [] } }
    })

    await db.newsTag.delete({ where: { id: tagId } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      console.warn(`News tag with ID ${tagId} not found`)
      throw new BusinessError('News tag not found', NotificationCode.NOT_FOUND, 404)
    }
    console.error('Error deleting news tag:', err)
    throw new ServerError('Error deleting news tag', err, NotificationCode.DATABASE_ERROR, 500)
  }
}
