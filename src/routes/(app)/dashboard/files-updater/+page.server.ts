import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import type { PageServerLoad } from './$types'
import { NotificationCode } from '$lib/utils/notifications'
import { createFileSchema, editFileSchema, renameFileSchema, loaderSchema, deleteFilesSchema } from '$lib/utils/validations'
import { cacheFiles, createFile, deleteFile, editFile, getCachedFilesParsed, getFiles, renameFile } from '$lib/server/files'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { db } from '$lib/server/db'
import { ILoaderFormat, ILoaderType } from '$lib/utils/db'
import type { Loader, LoaderFormat } from '@prisma/client'
import { updateLoader } from '$lib/server/loader'
import { checkVanillaLoader, getVanillaVersions } from '$lib/server/loaders/vanilla'
import { checkForgeLikeLoader, getForgeLikeFile, getForgeLikeVersions } from '$lib/server/loaders/forgelike'
import { checkFabricLikeLoader, getFabricLikeGameVersions, getFabricLikeLoaderVersions } from '$lib/server/loaders/fabriclike'
import { getAccessibleProfiles, resolveProfile } from '$lib/server/profile'
import type { Dir } from '$lib/utils/types'

export const load = (async (event) => {
  const domain = event.url.origin
  const user = event.locals.user

  if (!user) {
    throw redirect(303, '/')
  }

  try {
    const profiles = await getAccessibleProfiles(user.id, user.isAdmin)

    if (profiles.length === 0) {
      throw redirect(303, '/dashboard')
    }

    const requestedProfileId = event.url.searchParams.get('profileId')
    const selectedProfile = (requestedProfileId ? profiles.find((p) => p.id === requestedProfileId) : null) ?? profiles[0]

    const [files, vanilla, forge, neoforge, fabric, quilt, fabricLoaderVersions, quiltLoaderVersions, databaseLoader] = await Promise.all([
      getCachedFilesParsed(domain, `files-updater/${selectedProfile.slug}`),
      getVanillaVersions(),
      getForgeLikeVersions(ILoaderType.FORGE),
      getForgeLikeVersions(ILoaderType.NEOFORGE),
      getFabricLikeGameVersions(ILoaderType.FABRIC),
      getFabricLikeGameVersions(ILoaderType.QUILT),
      getFabricLikeLoaderVersions(ILoaderType.FABRIC),
      getFabricLikeLoaderVersions(ILoaderType.QUILT),
      db.loader.findFirst({ where: { profileId: selectedProfile.id } }).catch((err) => {
        console.error('Failed to load loader:', err)
        throw new ServerError('Failed to load loader', err, NotificationCode.DATABASE_ERROR, 500)
      })
    ])

    const loaderList = {
      [ILoaderType.VANILLA]: vanilla,
      [ILoaderType.FORGE]: forge,
      [ILoaderType.NEOFORGE]: neoforge,
      [ILoaderType.FABRIC]: fabric,
      [ILoaderType.QUILT]: quilt
    }

    const loader: Loader = databaseLoader?.loaderVersion
      ? (databaseLoader as Loader)
      : ({
          id: '',
          type: ILoaderType.VANILLA,
          minecraftVersion: 'latest_release',
          loaderVersion: 'latest_release',
          format: ILoaderFormat.CLIENT,
          file: null,
          updatedAt: new Date()
        } as Loader)

    return { profiles, loader, loaderList, fabricLoaderVersions, quiltLoaderVersions, files }
  } catch (err) {
    if (err instanceof ServerError) throw error(err.httpStatus, { message: err.code })

    console.error('Unknown error:', err)
    throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  renameFile: async (event) => {
    const user = event.locals.user
    const domain = event.url.origin

    if (!user) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      path: form.get('path'),
      name: form.get('name'),
      newName: form.get('new-name')
    }

    const result = renameFileSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, path, name, newName } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin)
      const dir = `files-updater/${profile.slug}` as Dir

      await renameFile(dir, path, name, newName)
      await cacheFiles(dir)

      const files = await getFiles(domain, dir)
      return { files }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  createFile: async (event) => {
    const user = event.locals.user
    const domain = event.url.origin

    if (!user) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      path: form.get('path'),
      name: form.get('name') ?? undefined
    }

    const result = createFileSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, path, name } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin)
      const dir = `files-updater/${profile.slug}` as Dir

      await createFile(dir, path, name)
      await cacheFiles(dir)

      const files = await getFiles(domain, dir)
      return { files }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  editFile: async (event) => {
    const user = event.locals.user
    const domain = event.url.origin

    if (!user) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      path: form.get('path'),
      name: form.get('name'),
      content: form.get('content')
    }

    const result = editFileSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, path, name, content } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin)
      const dir = `files-updater/${profile.slug}` as Dir

      await editFile(dir, path, name, content)
      await cacheFiles(dir)

      const files = await getFiles(domain, dir)
      return { files }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  deleteFiles: async (event) => {
    const domain = event.url.origin
    const user = event.locals.user

    if (!user) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      paths: form.getAll('paths')
    }

    const result = deleteFilesSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, paths } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin)
      const dir = `files-updater/${profile.slug}` as Dir

      for (const path of paths) {
        if (typeof path !== 'string') continue
        await deleteFile(dir, path)
      }

      await cacheFiles(dir)

      const cache = await getCachedFilesParsed(domain, dir)
      return { files: cache }
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  },

  changeLoader: async (event) => {
    const user = event.locals.user

    if (!user) {
      throw error(403, { message: NotificationCode.FORBIDDEN })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      type: form.get('type'),
      minecraftVersion: form.get('minecraft-version'),
      loaderVersion: form.get('loader-version')
    }

    const result = loaderSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, type, minecraftVersion, loaderVersion } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin, 2)

      let file: any = null
      let format: LoaderFormat = ILoaderFormat.CLIENT

      if (type === ILoaderType.VANILLA) {
        checkVanillaLoader(minecraftVersion, loaderVersion)
      } else if (type === ILoaderType.FORGE || type === ILoaderType.NEOFORGE) {
        checkForgeLikeLoader(type, minecraftVersion, loaderVersion)
        const res = await getForgeLikeFile(type, loaderVersion)
        file = res.file
        format = res.format
      } else if (type === ILoaderType.FABRIC || type === ILoaderType.QUILT) {
        checkFabricLikeLoader(type, minecraftVersion, loaderVersion)
      }

      await updateLoader({ type, minecraftVersion, loaderVersion, format, file }, profile.id)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

