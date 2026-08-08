import type { PageServerLoad } from './$types'
import type { Loader } from '@prisma/client'
import type { FileDir, File as File_ } from '$lib/utils/types'
import { error, redirect, type Actions } from '@sveltejs/kit'
import { fail } from '$lib/server/action'
import { NotificationCode } from '$lib/utils/notifications'
import { createFileSchema, editFileSchema, renameFileSchema, loaderSchema, deleteFilesSchema, customLoaderSchema } from '$lib/utils/validations'
import { cacheFiles, createFile, deleteFile, editFile, getCachedFilesParsed, getFiles, moveFile, renameFile, sanitizePath } from '$lib/server/files'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { db } from '$lib/server/db'
import { ILoaderFormat, ILoaderType } from '$lib/utils/db'
import { updateLoader } from '$lib/server/loader'
import { checkVanillaLoader, getVanillaVersions } from '$lib/server/loaders/vanilla'
import { checkForgeLikeLoader, getForgeLikeVersions } from '$lib/server/loaders/forgelike'
import { checkFabricLikeLoader, getFabricLikeGameVersions, getFabricLikeLoaderVersions } from '$lib/server/loaders/fabriclike'
import { getAccessibleProfiles, resolveProfile } from '$lib/server/profile'
import { computeSha1Hash, getDomain } from '$lib/utils/utils'
import { getMissingLibrariesFromVersion, rewriteAssetIndexUrls, rewriteManifestUrls } from '$lib/utils/parser'
import fs from 'node:fs/promises'
import path_ from 'node:path'
import { existsSync } from 'node:fs'

export const load = (async (event) => {
  const domain = getDomain(event)
  const user = event.locals.user

  if (!user?.profilePermissions.some((p) => p.permission > 0) && !user?.isAdmin) {
    throw redirect(303, '/')
  }

  try {
    const profiles = await getAccessibleProfiles(user.id, user.isAdmin)
    const requestedProfileSlug = event.url.searchParams.get('profile')
    const selectedProfile = (requestedProfileSlug ? profiles.find((p) => p.slug === requestedProfileSlug) : null) ?? profiles[0]

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
          file: null,
          customVersion: null,
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
    const domain = getDomain(event)
    const user = event.locals.user

    if (!user) {
      throw error(401, { message: NotificationCode.UNAUTHORIZED })
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
      const dir = `files-updater/${profile.slug}` as FileDir

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
    const domain = getDomain(event)
    const user = event.locals.user

    if (!user) {
      throw error(401, { message: NotificationCode.UNAUTHORIZED })
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
      const dir = `files-updater/${profile.slug}` as FileDir

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
    const domain = getDomain(event)
    const user = event.locals.user

    if (!user) {
      throw error(401, { message: NotificationCode.UNAUTHORIZED })
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
      const dir = `files-updater/${profile.slug}` as FileDir

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
    const domain = getDomain(event)
    const user = event.locals.user

    if (!user) {
      throw error(401, { message: NotificationCode.UNAUTHORIZED })
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
      const dir = `files-updater/${profile.slug}` as FileDir

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
    const domain = getDomain(event)

    if (!user) {
      throw error(401, { message: NotificationCode.UNAUTHORIZED })
    }

    const form = await event.request.formData()
    const raw = {
      profileId: form.get('profile-id'),
      type: form.get('type'),
      minecraftVersion: form.get('minecraft-version'),
      loaderVersion: form.get('loader-version'),
      customLoaderVersionSha1: form.get('custom-loader-version-sha1')
    }

    const result = loaderSchema.safeParse(raw)
    if (!result.success) {
      return fail(event, 400, { failure: JSON.parse(result.error.message)[0].message })
    }

    const { profileId, type, minecraftVersion, loaderVersion, customLoaderVersionSha1 } = result.data

    try {
      const profile = await resolveProfile(profileId, user.id, user.isAdmin, 2)

      let file: any = null
      let customVersion: string | null = null

      if (type === ILoaderType.VANILLA) {
        checkVanillaLoader(minecraftVersion, loaderVersion)
      } else if (type === ILoaderType.FORGE || type === ILoaderType.NEOFORGE) {
        checkForgeLikeLoader(type, minecraftVersion, loaderVersion)
      } else if (type === ILoaderType.FABRIC || type === ILoaderType.QUILT) {
        checkFabricLikeLoader(type, minecraftVersion, loaderVersion)
      }

      if (existsSync(sanitizePath('files', 'loaders', profile.slug))) {
        await deleteFile(`loaders/${profile.slug}`, '', false)
      }

      if (customLoaderVersionSha1?.length === 40) {
        const baseUrl = `${domain}/files/loaders/${profile.slug}`
        const basePath = path_.join('files', '.staging-loader', profile.slug)
        const cachedFiles = await getCachedFilesParsed(domain, `.staging-loader/${profile.slug}/${customLoaderVersionSha1}`)
        const files: Map<string, File_> = new Map(cachedFiles.map((f) => [f.sha1!, f]))
        let pathsToMove: Map<string, string> = new Map()

        const versionFile = files.get(customLoaderVersionSha1)
        if (!versionFile) {
          throw new BusinessError('Custom loader version file not found', NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND, 400)
        }
        const versionString = (await fs.readFile(sanitizePath(basePath, versionFile.path, versionFile.name))).toString('utf-8')
        const versionJson = JSON.parse(versionString)
        const missingSpecialFiles = getMissingLibrariesFromVersion(versionString)[1]

        if (missingSpecialFiles.assetIndexJson) {
          const assetIndexFile = files.get(missingSpecialFiles.assetIndexJson)
          if (!assetIndexFile) {
            throw new BusinessError('Custom loader asset index file not found', NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND, 400)
          }

          const assetIndexString = (await fs.readFile(sanitizePath(basePath, assetIndexFile.path, assetIndexFile.name))).toString('utf-8')
          const assetIndexJson = JSON.parse(assetIndexString)
          const assetsRes = rewriteAssetIndexUrls(assetIndexJson, baseUrl, files)

          const finalAssetIndex = JSON.stringify(assetsRes.assetIndex, null, 0).replace(/\n\s*/g, ' ')
          const finalAssetIndexFile = new File([finalAssetIndex], assetIndexFile.name, { type: 'application/json' })
          const finalAssetIndexSha1 = await computeSha1Hash(finalAssetIndexFile)
          const finalAssetIndexSize = finalAssetIndexFile.size

          files.delete(versionJson.assetIndex.sha1)
          versionJson.assetIndex.sha1 = finalAssetIndexSha1
          versionJson.assetIndex.size = finalAssetIndexSize
          versionJson.assetIndex.id = finalAssetIndexSha1.slice(0, 8)
          versionJson.assets = finalAssetIndexSha1.slice(0, 8)
          files.set(finalAssetIndexSha1, {
            name: assetIndexFile.name,
            path: assetIndexFile.path,
            sha1: finalAssetIndexSha1,
            size: finalAssetIndexSize,
            url: assetIndexFile.url,
            type: assetIndexFile.type
          })
          pathsToMove = new Map([...pathsToMove, ...assetsRes.pathsToMove])

          await createFile(`loaders/${profile.slug}`, `assets/indexes`, `${versionJson.assets}.json`)
          await editFile(`loaders/${profile.slug}`, `assets/indexes`, `${versionJson.assets}.json`, finalAssetIndex)
        }

        const librariesRes = rewriteManifestUrls(versionJson, baseUrl, files)

        const finalVersion = JSON.stringify(librariesRes.manifest, null, 2)
        const finalVersionFile = new File([finalVersion], versionFile.name, { type: 'application/json' })
        const finalVersionSha1 = await computeSha1Hash(finalVersionFile)
        const finalVersionSize = finalVersionFile.size
        
        pathsToMove = new Map([...pathsToMove, ...librariesRes.pathsToMove])
        pathsToMove.delete(librariesRes.manifest.assetIndex?.sha1 ?? '')
        customVersion = librariesRes.manifest.id!

        await createFile(`loaders/${profile.slug}`, `versions/${customVersion}`, `${customVersion}.json`)
        await editFile(`loaders/${profile.slug}`, `versions/${customVersion}`, `${customVersion}.json`, finalVersion)
        await deleteFile(`.staging-loader/${profile.slug}`, `${customLoaderVersionSha1}/${versionFile.name}`)

        for (const [sha1, destPath] of pathsToMove) {
          const fileToMove = files.get(sha1)
          if (!fileToMove) continue
          const oldPath = path_.join(fileToMove.path, fileToMove.name)
          const newPath = path_.join(destPath)
          await moveFile(`.staging-loader/${profile.slug}`, oldPath, `loaders/${profile.slug}`, newPath)
        }

        file = {
          name: `${customVersion}.json`,
          path: `versions/${customVersion}/`,
          sha1: finalVersionSha1,
          size: finalVersionSize,
          url: `{{url}}/files/loaders/${profile.slug}/versions/${customVersion}/${customVersion}.json`,
          type: 'OTHER'
        }
      }

      await updateLoader({ type, minecraftVersion, loaderVersion, file, customVersion }, profile.id)
    } catch (err) {
      if (err instanceof BusinessError) return fail(event, err.httpStatus, { failure: err.message })
      if (err instanceof ServerError) throw error(err.httpStatus, { message: err.message })

      console.error('Unknown error:', err)
      throw error(500, { message: NotificationCode.INTERNAL_SERVER_ERROR })
    }
  }
}

