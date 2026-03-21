import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import fs from 'node:fs/promises'
import path_ from 'node:path'
import type { Dir, File as File_ } from '$lib/utils/types'
import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'

const root = path_.join(process.cwd())

/**
 * Get files in a directory.
 * @param domain Domain to use for file URLs. Can be an empty string if URLs are not needed.
 * @param dir Directory to get files from.
 * @param profileSlug Slug of the profile to get files for.
 */
export async function getFiles(domain: string, dir: Dir, profileSlug?: string): Promise<File_[]> {
  const resolvedDir = profileSlug ? getProfileDir(profileSlug) : dir
  await fs.mkdir(path_.join(root, 'files', resolvedDir), { recursive: true })
  const filesArray: File_[] = []
  await browse(filesArray, resolvedDir, '', domain)
  return filesArray
}

/**
 * Get cached files for a directory. If the cache does not exist, it will be generated.
 * @param domain Domain to use for file URLs. Can be an empty string if URLs are not needed.
 * @param dir Directory to get cached files from.
 * @param profileSlug Slug of the profile to get cached files for.
 */
export async function getCachedFiles(domain: string, dir: Dir, profileSlug?: string): Promise<string> {
  const cacheKey = profileSlug ? getProfileCacheKey(profileSlug) : dir
  const target = sanitizePath('files', 'cache', `${cacheKey}.json`)
  let cache
  try {
    cache = (await fs.readFile(target, 'utf-8')).replaceAll('{{url}}', domain)
  } catch {
    console.warn('Cache file not found, generating new cache.')
    await cacheFiles(dir, profileSlug)
    cache = (await fs.readFile(target, 'utf-8')).replaceAll('{{url}}', domain)
  }

  return cache
}

/**
 * Get cached files for a directory and parse them. If the cache does not exist, it will be generated.
 * @param domain Domain to use for file URLs. Can be an empty string if URLs are not needed.
 * @param dir Directory to get cached files from.
 * @param profileSlug Slug of the profile to get cached files for.
 */
export async function getCachedFilesParsed(domain: string, dir: Dir, profileSlug?: string): Promise<File_[]> {
  const cache = await getCachedFiles(domain, dir, profileSlug)
  try {
    return JSON.parse(cache) as File_[]
  } catch (err) {
    console.error('Failed to parse cached files:', err)
    throw new ServerError('Failed to parse cached files', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * Upload a file to the server.
 * @param dir Directory to upload the file to.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param file File object to upload.
 * @param profileSlug Slug of the profile to upload the file for.
 */
export async function uploadFile(dir: Dir, path: string, file: File, profileSlug?: string): Promise<void> {
  if (!file) return

  const resolvedDir = profileSlug ? getProfileDir(profileSlug) : dir

  let target, name, buffer
  try {
    target = sanitizePath('files', resolvedDir, path)
    name = path_.basename(file.name).removeUnwantedFilenameChars()
    buffer = Buffer.from(await file.arrayBuffer())
  } catch (err) {
    console.warn('Invalid path:', path, err)
    throw new BusinessError('Invalid path', NotificationCode.INVALID_REQUEST, 400)
  }

  try {
    await fs.mkdir(target, { recursive: true })
    await fs.writeFile(path_.join(target, name), buffer)
  } catch (err) {
    console.error('Error writing file:', err)
    throw new ServerError('Failed to write file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * Create an empty file.
 * @param dir Directory where the file to create is.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param name Name of the file to create.
 */
export async function createFile(dir: Dir, path: string, name: string | undefined): Promise<void> {
  let target
  try {
    target = sanitizePath('files', dir, path)
  } catch (err) {
    console.warn('Invalid path:', path, err)
    throw new BusinessError('Invalid path', NotificationCode.INVALID_REQUEST, 400)
  }

  try {
    await fs.mkdir(target, { recursive: true })
  } catch (err) {
    console.error('Error creating directory:', err)
    throw new ServerError('Failed to create directory', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }

  if (name) {
    try {
      name = name.removeUnwantedFilenameChars()
      await fs.writeFile(path_.join(target, name), '')
    } catch (err) {
      console.error('Error creating file:', err)
      throw new ServerError('Failed to create file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
    }
  }
}

/**
 * Edit a file's content.
 * @param dir Directory where the file to edit is.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param name Name of the file to edit.
 * @param content New content for the file.
 */
export async function editFile(dir: Dir, path: string, name: string, content: string): Promise<void> {
  let fullPath
  try {
    name = name.removeUnwantedFilenameChars()
    fullPath = sanitizePath('files', dir, path, name)
  } catch (err) {
    console.warn('Invalid path:', path, err)
    throw new BusinessError('Invalid path', NotificationCode.INVALID_REQUEST, 400)
  }

  try {
    await fs.access(fullPath)
  } catch {
    console.warn('File does not exist:', fullPath)
    throw new BusinessError('File does not exist', NotificationCode.NOT_FOUND, 404)
  }

  try {
    await fs.writeFile(fullPath, content)
  } catch (err) {
    console.error('Error editing file:', err)
    throw new ServerError('Failed to edit file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * @param dir Directory where the file to rename is.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param name Current name of the file.
 * @param newName New name of the file.
 * @param throwError Whether to throw an error if the file does not exist.
 */
export async function renameFile(dir: Dir, path: string, name: string, newName: string, throwError: boolean = true): Promise<void> {
  let fullPath, newFullPath
  try {
    name = name.removeUnwantedFilenameChars()
    fullPath = sanitizePath('files', dir, path, name)
    newFullPath = sanitizePath('files', dir, path, newName)
  } catch (err) {
    console.warn('Invalid path:', path, err)
    throw new BusinessError('Invalid path', NotificationCode.INVALID_REQUEST, 400)
  }

  try {
    await fs.access(fullPath)
  } catch {
    console.warn('File does not exist:', fullPath)
    if (throwError) {
      throw new BusinessError('File does not exist', NotificationCode.NOT_FOUND, 404)
    } else {
      return // no need to rename anything
    }
  }

  try {
    await fs.mkdir(path_.dirname(newFullPath), { recursive: true })
  } catch (err) {
    console.error('Error creating parent directory:', err)
    throw new ServerError('Failed to create parent directory', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }

  try {
    await fs.rename(fullPath, newFullPath)
  } catch (err) {
    console.error('Error renaming file:', err)
    throw new ServerError('Failed to rename file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * Delete a file or folder.
 * @param dir Directory where the file to delete is.
 * @param path Path to the file, relative to the directory, **including** the file name.
 * @param throwError Whether to throw an error if the file does not exist.
 */
export async function deleteFile(dir: Dir, path: string, throwError: boolean = true): Promise<void> {
  try {
    path = sanitizePath('files', dir, path)
  } catch (err) {
    console.warn('Invalid path:', path, err)
    throw new BusinessError('Invalid path', NotificationCode.INVALID_REQUEST, 400)
  }

  try {
    await fs.access(path)
  } catch {
    console.warn('File does not exist:', path)
    if (throwError) {
      throw new BusinessError('File does not exist', NotificationCode.NOT_FOUND, 404)
    }
    return
  }

  try {
    await fs.rm(path, { recursive: true })
  } catch (err) {
    console.error('Error deleting file:', err)
    throw new ServerError('Failed to delete file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * Sanitize a path by resolving it and ensuring it is within the root directory. This prevents directory traversal attacks.
 * @param path Segments of the path to sanitize. They will be joined together and resolved.
 */
export function sanitizePath(...path: string[]): string {
  const sanitizedPath = path_.resolve(root, path_.join(...path).replace(/^\\+/, ''))
  if (!sanitizedPath.startsWith(root)) throw new Error('Invalid path')
  return sanitizedPath
}

/**
 * Generate a cache file for a directory by browsing the directory and saving the file metadata in a JSON file.
 * The cache file will be saved in `files/cache/{dir}.json`.
 * @param dir Directory to generate the cache for. This should be the same directory used in `getCachedFiles` and `getCachedFilesParsed`.
 * @param profileSlug Slug of the profile to generate the cache for.
 */
export async function cacheFiles(dir: Dir, profileSlug?: string): Promise<void> {
  const resolvedDir = profileSlug ? getProfileDir(profileSlug) : dir
  const cacheKey = profileSlug ? getProfileCacheKey(profileSlug) : dir
  const files = await getFiles('{{url}}', resolvedDir as Dir)
  await fs.mkdir(path_.join(root, 'files', 'cache'), { recursive: true })
  await fs.writeFile(path_.join(root, 'files', 'cache', `${cacheKey}.json`), JSON.stringify(files, null, 2))
}

/**
 * Browse files in a directory and add them to the filesArray.
 * @param filesArray Array to store the files in.
 * @param dir Directory to browse.
 * @param subdir Subdirectory to browse.
 * @param domain Domain to use for file URLs.
 */
async function browse(filesArray: File_[], dir: Dir, subdir: string, domain: string): Promise<void> {
  const fullDir = subdir === '' ? dir : `${dir}/${subdir}`
  const absDir = `${root}/files/${fullDir}`

  try {
    const entries = await fs.readdir(absDir)

    for (const name of entries) {
      const abs = `${root}/files/${fullDir}/${name}`
      const path = `${subdir}/`.formatPath()
      const url = `${domain}/files/${fullDir}/${name}`.replace(/\\/g, '/')
      const type = await getType(path_.join(absDir, name))

      if (type === 'FOLDER') {
        await browse(filesArray, dir, `${subdir}/${name}`.replace(/^\/+/, ''), domain)
        filesArray.push({ name, path, url, type })
      } else {
        const size = (await fs.stat(abs)).size
        const sha1 = await getFileSha1(abs)
        filesArray.push({ name, path, size, sha1, url, type })
      }
    }
  } catch (err) {
    console.warn('Error reading directory:', absDir, err)
  }
}

/**
 * Get the directory for a profile based on its slug. This is used to store files for each profile in a separate directory.
 * @param profileSlug Slug of the profile to get the directory for.
 */
function getProfileDir(profileSlug: string): Dir {
  return `files-updater/${profileSlug}` as Dir
}

/**
 * Get the cache key for a profile based on its slug. This is used to store the cache for each profile in a separate file.
 * @param profileSlug Slug of the profile to get the cache key for.
 */
function getProfileCacheKey(profileSlug: string): string {
  return `files-updater-${profileSlug}`
}

/**
 * Get the type of a file based on its path.
 * @param path Path to the file.
 */
async function getType(path: string): Promise<'FOLDER' | 'ASSET' | 'LIBRARY' | 'MOD' | 'CONFIG' | 'BOOTSTRAP' | 'BACKGROUND' | 'IMAGE' | 'OTHER'> {
  if ((await fs.stat(path)).isDirectory()) return 'FOLDER'
  if (path.includes('assets')) return 'ASSET'
  if (path.includes('lib')) return 'LIBRARY'
  if (path.includes('mods')) return 'MOD'
  if (path.includes('config')) return 'CONFIG'
  if (path.includes('bootstraps')) return 'BOOTSTRAP'
  if (path.includes('backgrounds')) return 'BACKGROUND'
  if (path.includes('images')) return 'IMAGE'
  return 'OTHER'
}

/**
 * Get the SHA-1 hash of a file. This is used to check if a file has changed without having to read the entire file content.
 * @param path Path to the file.
 */
async function getFileSha1(path: string): Promise<string> {
  const hash = crypto.createHash('sha1')
  const stream = createReadStream(path)

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}




