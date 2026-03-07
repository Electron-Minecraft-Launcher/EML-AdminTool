import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import { NotificationCode } from '$lib/utils/notifications'
import { BusinessError, ServerError } from '$lib/utils/errors'
import type { File as File_ } from '$lib/utils/types'
import { IBackgroundStatus } from '$lib/utils/db'
import type { BackgroundStatus } from '@prisma/client'
import { backgroundSchema } from '$lib/utils/validations'
import { addBackground, updateBackground, enableBackground, getBackgroundById, deleteBackground } from '$lib/server/backgrounds'
import { randomBytes } from 'node:crypto'
import path_ from 'node:path'
import { deleteFile, getFiles, uploadFile } from '$lib/server/files'

export const load = (async (event) => {
  const user = event.locals.user

  if (!user?.p_backgrounds) {
    throw redirect(303, '/dashboard')
  }

  try {
    let backgrounds

    try {
      backgrounds = (await db.background.findMany({ orderBy: { createdAt: 'desc' } })) as {
        id: string
        name: string
        file: File_ | null
        status: BackgroundStatus
      }[]
    } catch (err) {
      console.error('Failed to load backgrounds:', err)
      throw new ServerError('Failed to load backgrounds', err, NotificationCode.DATABASE_ERROR, 500)
    }

    return { backgrounds }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  addEditBackground: async (event) => {
    const domain = event.url.origin
    const user = event.locals.user

    if (!user?.p_backgrounds) {
      return fail(event, 403, { failure: NotificationCode.UNAUTHORIZED })
    }

    const form = await event.request.formData()
    const raw = {
      backgroundId: form.get('background-id'),
      name: form.get('name'),
      status: form.get('status'),
      file: form.get('file')
    }

    const result = backgroundSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { backgroundId, name, status, file } = result.data

    try {
      if (backgroundId) {
        const existingBackground = await getBackgroundById(backgroundId)

        if (!existingBackground) {
          return fail(event, 404, { failure: NotificationCode.NOT_FOUND })
        }

        const newStatus =
          status === IBackgroundStatus.ACTIVE || existingBackground.status === IBackgroundStatus.ACTIVE
            ? IBackgroundStatus.ACTIVE
            : IBackgroundStatus.INACTIVE

        if (newStatus !== existingBackground.status) {
          await enableBackground(backgroundId)
        }

        if (name !== existingBackground.name) {
          await updateBackground(backgroundId, name)
        }
      } else {
        if (!file || typeof file === 'string') {
          return fail(event, 400, { failure: NotificationCode.MISSING_INPUT })
        }

        const newName = `${randomBytes(8).toString('hex')}${path_.extname(file.name)}`
        const newFile = new File([file], newName, { type: file.type })

        await uploadFile('backgrounds', '', newFile)
        const backgroundFiles = await getFiles(domain, 'backgrounds')
        const currentBackgroundFile = backgroundFiles.find((f) => f.name === newName)!

        await addBackground(name, currentBackgroundFile, status)
      }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  enableBackground: async (event) => {
    const user = event.locals.user

    if (!user?.p_backgrounds) {
      return fail(event, 403, { failure: NotificationCode.UNAUTHORIZED })
    }

    const form = await event.request.formData()
    const backgroundId = form.get('background-id')

    if (!backgroundId || typeof backgroundId !== 'string') {
      return fail(event, 400, { failure: NotificationCode.MISSING_INPUT })
    }

    try {
      await enableBackground(backgroundId)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteBackground: async (event) => {
    const user = event.locals.user

    if (!user?.p_backgrounds) {
      return fail(event, 403, { failure: NotificationCode.UNAUTHORIZED })
    }

    const form = await event.request.formData()
    const backgroundId = form.get('background-id')

    if (!backgroundId || typeof backgroundId !== 'string') {
      return fail(event, 400, { failure: NotificationCode.MISSING_INPUT })
    }

    try {
      const existingBackground = await getBackgroundById(backgroundId)

      if (!existingBackground) {
        return fail(event, 404, { failure: NotificationCode.NOT_FOUND })
      }

      await deleteBackground(backgroundId)
      await deleteFile('backgrounds', (existingBackground.file as unknown as File_).name)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.code })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}
