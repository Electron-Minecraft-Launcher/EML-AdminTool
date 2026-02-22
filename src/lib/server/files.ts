import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import fs from 'node:fs/promises'
import path_ from 'node:path'
import type { Dir, File as File_ } from '$lib/utils/types'
import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'

const root = path_.join(process.cwd())

export async function getFiles(domain: string, dir: Dir) {
  await fs.mkdir(path_.join(root, 'files', dir), { recursive: true })
  const filesArray: File_[] = []
  await browse(filesArray, dir, '', domain)
  return filesArray
}

export async function getCachedFiles(domain: string, dir: Dir) {
  const target = sanitizePath('files', 'cache', `${dir}.json`)
  let cache
  try {
    cache = (await fs.readFile(target, 'utf-8')).replaceAll('{{url}}', domain)
  } catch (err) {
    console.warn('Cache file not found, generating new cache:', err)
    await cacheFiles('files-updater')
    cache = (await fs.readFile(target, 'utf-8')).replaceAll('{{url}}', domain)
  }

  return cache
}

export async function getCachedFilesParsed(domain: string, dir: Dir) {
  const cache = await getCachedFiles(domain, dir)
  try {
    return JSON.parse(cache) as File_[]
  } catch (err) {
    console.error('Failed to parse cached files:', err)
    throw new ServerError('Failed to parse cached files', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * @param dir Directory to upload the file to.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param file File object to upload.
 */
export async function uploadFile(dir: Dir, path: string, file: File) {
  if (!file) return

  let target, name, buffer
  try {
    target = sanitizePath('files', dir, path)
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
export async function createFile(dir: Dir, path: string, name: string | undefined) {
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
 * @param dir Directory where the file to edit is.
 * @param path Path to the file, relative to the directory, without the file name.
 * @param name Name of the file to edit.
 * @param content New content for the file.
 */
export async function editFile(dir: Dir, path: string, name: string, content: string) {
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
 */
export async function renameFile(dir: Dir, path: string, name: string, newName: string) {
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
    throw new BusinessError('File does not exist', NotificationCode.NOT_FOUND, 404)
  }

  try {
    await fs.rename(fullPath, newFullPath)
  } catch (err) {
    console.error('Error renaming file:', err)
    throw new ServerError('Failed to rename file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

/**
 * @param dir Directory where the file to delete is.
 * @param path Path to the file, relative to the directory, **including** the file name.
 */
export async function deleteFile(dir: Dir, path: string) {
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
    throw new BusinessError('File does not exist', NotificationCode.NOT_FOUND, 404)
  }

  try {
    await fs.rm(path, { recursive: true })
  } catch (err) {
    console.error('Error deleting file:', err)
    throw new ServerError('Failed to delete file', err, NotificationCode.INTERNAL_SERVER_ERROR, 500)
  }
}

export function sanitizePath(...path: string[]): string {
  const sanitizedPath = path_.resolve(root, path_.join(...path).replace(/^\\+/, ''))
  if (!sanitizedPath.startsWith(root)) throw new Error('Invalid path')
  return sanitizedPath
}

export async function cacheFiles(dir: Dir) {
  const files = await getFiles('{{url}}', dir)
  await fs.mkdir(path_.join(root, 'files', 'cache'), { recursive: true })
  await fs.writeFile(path_.join(root, 'files', 'cache', `${dir}.json`), JSON.stringify(files, null, 2))
}

/**
 * Browse files in a directory and add them to the filesArray.
 * @param filesArray Array to store the files in.
 * @param dir Directory to browse.
 * @param subdir Subdirectory to browse.
 * @param domain Domain to use for file URLs.
 */
async function browse(filesArray: File_[], dir: Dir, subdir: string, domain: string) {
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

async function getFileSha1(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha1')
  const stream = createReadStream(filePath)

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

