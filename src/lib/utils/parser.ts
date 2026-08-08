import { addNotification } from '$lib/stores/notifications'
import { BusinessError, ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'
import type en from '$lib/locales/en'
import type { File as File_ } from '$lib/utils/types'

export interface MissingSpecialFiles {
  assetIndexJson: string | null
  clientJar: string | null
  clientTxt: string | null
  loggingXml: string | null
}

export interface MissingLibrary {
  sha1?: string
  size?: number
  path: string
}

export interface MissingAsset {
  hash: string
  size: number
  path: string
}

function mavenToPath(name: string): string {
  let ext = 'jar'
  let cleanName = name

  if (name.includes('@')) {
    const atIndex = name.lastIndexOf('@')
    ext = name.slice(atIndex + 1)
    cleanName = name.slice(0, atIndex)
  }

  const parts = cleanName.split(':')
  if (parts.length < 3) return name

  const pkg = parts[0].replace(/\./g, '/')
  const artifact = parts[1]
  const version = parts[2]
  const classifier = parts.length > 3 ? `-${parts[3]}` : ''

  const fileName = `${artifact}-${version}${classifier}.${ext}`

  return `${pkg}/${artifact}/${version}/${fileName}`
}

export function getMissingLibrariesFromVersion(jsonString: string, $l?: typeof en): [Map<string, MissingLibrary>, MissingSpecialFiles] {
  let manifest: any
  try {
    manifest = JSON.parse(jsonString)
  } catch (err) {
    console.error('Failed to parse version manifest JSON:', err)
    throw new ServerError('Failed to parse version manifest JSON', err, NotificationCode.INVALID_INPUT, 400)
  }

  const missingFiles: Map<string, MissingLibrary> = new Map()
  const missingSpecialFiles: MissingSpecialFiles = {
    assetIndexJson: null,
    clientJar: null,
    clientTxt: null,
    loggingXml: null
  }

  if (manifest.assetIndex?.url === 'eml://upload') {
    const file = manifest.assetIndex
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*assetIndex.json' })
    missingSpecialFiles.assetIndexJson = file.sha1
  }

  if (manifest.downloads?.client?.url === 'eml://upload') {
    const file = manifest.downloads.client
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*client.jar' })
    missingSpecialFiles.clientJar = file.sha1
  }

  if (manifest.downloads?.client_mappings?.url === 'eml://upload') {
    const file = manifest.downloads.client_mappings
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*client.txt' })
    missingSpecialFiles.clientTxt = file.sha1
  }

  if (manifest.logging?.client?.file?.url === 'eml://upload') {
    const file = manifest.logging.client.file
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*logging.xml' })
    missingSpecialFiles.loggingXml = file.sha1
  }

  if (Array.isArray(manifest.libraries)) {
    for (const lib of manifest.libraries) {
      let isMissing = false

      if (lib.downloads?.artifact?.url === 'eml://upload') {
        missingFiles.set(lib.downloads.artifact.sha1, {
          sha1: lib.downloads.artifact.sha1,
          size: lib.downloads.artifact.size,
          path: lib.downloads.artifact.path
        })
        isMissing = true
      }

      if (lib.downloads?.classifiers) {
        for (const key in lib.downloads.classifiers) {
          const classifier = lib.downloads.classifiers[key]
          if (classifier.url === 'eml://upload') {
            missingFiles.set(classifier.sha1, {
              sha1: classifier.sha1,
              size: classifier.size,
              path: classifier.path
            })
            isMissing = true
          }
        }
      }

      if (!isMissing && lib.url === 'eml://upload') {
        const computedPath = lib.path || (lib.name ? mavenToPath(lib.name) : 'unknown.jar')

        if (!lib.sha1) {
          if ($l) {
            addNotification('ERROR', $l.notifications.INVALID_INPUT)
            return [new Map(), missingSpecialFiles]
          } else {
            throw new BusinessError('Missing SHA-1 for library with eml://upload URL', NotificationCode.INVALID_INPUT)
          }
        }

        missingFiles.set(lib.sha1, {
          sha1: lib.sha1,
          size: lib.size,
          path: computedPath
        })
      }
    }
  }

  return [missingFiles, missingSpecialFiles]
}

export function getMissingAssetsFromIndex(jsonString: string): Map<string, MissingAsset> {
  let manifest: any
  try {
    manifest = JSON.parse(jsonString)
  } catch (err) {
    console.error('Failed to parse assetIndex JSON:', err)
    throw new ServerError('Failed to parse assetIndex JSON', err, NotificationCode.INVALID_INPUT, 400)
  }

  const missingFiles: Map<string, MissingAsset> = new Map()

  if (manifest.objects && typeof manifest.objects === 'object') {
    for (const path in manifest.objects) {
      if (Object.prototype.hasOwnProperty.call(manifest.objects, path)) {
        const node = manifest.objects[path]

        if (typeof node.hash === 'string' && typeof node.size === 'number' && node.url === 'eml://upload') {
          missingFiles.set(node.hash, {
            hash: node.hash,
            size: node.size,
            path: path
          })
        }
      }
    }
  }

  return missingFiles
}

/**
 * @param manifest Parsed version manifest.
 * @param baseUrl Eg. `'{{url}}/files/loaders/${profile.slug}'`
 * @param uploadedFiles Get the uploaded files from `getCachedFilesParsed` and convert it to a Map 
 * with SHA-1 as key.
 */
export function rewriteManifestUrls(
  manifest: any,
  baseUrl: string,
  uploadedFiles: Map<string, File_>
): { manifest: any; pathsToMove: Map<string, string> } {
  const pathsToMove = new Map<string, string>()

  if (manifest.assetIndex?.url === 'eml://upload' && manifest.assetIndex.sha1 && uploadedFiles.has(manifest.assetIndex.sha1)) {
    const destPath = `assets/indexes/${manifest.assetIndex.id}.json`
    manifest.assetIndex.url = `${baseUrl}/${destPath}`
    pathsToMove.set(manifest.assetIndex.sha1, destPath)
  }

  if (manifest.downloads?.client?.url === 'eml://upload' && manifest.downloads.client.sha1 && uploadedFiles.has(manifest.downloads.client.sha1)) {
    const destPath = `versions/${manifest.id}/${manifest.id}.jar`
    manifest.downloads.client.url = `${baseUrl}/${destPath}`
    pathsToMove.set(manifest.downloads.client.sha1, destPath)
  }

  if (
    manifest.downloads?.client_mappings?.url === 'eml://upload' &&
    manifest.downloads.client_mappings.sha1 &&
    uploadedFiles.has(manifest.downloads.client_mappings.sha1)
  ) {
    const destPath = `versions/${manifest.id}/${manifest.id}.txt`
    manifest.downloads.client_mappings.url = `${baseUrl}/${destPath}`
    pathsToMove.set(manifest.downloads.client_mappings.sha1, destPath)
  }

  if (
    manifest.logging?.client?.file?.url === 'eml://upload' &&
    manifest.logging.client.file.sha1 &&
    uploadedFiles.has(manifest.logging.client.file.sha1)
  ) {
    const destPath = `assets/log_configs/${manifest.logging.client.file.id}`
    manifest.logging.client.file.url = `${baseUrl}/${destPath}`
    pathsToMove.set(manifest.logging.client.file.sha1, destPath)
  }

  if (Array.isArray(manifest.libraries)) {
    for (const lib of manifest.libraries) {
      if (lib.downloads?.artifact?.url === 'eml://upload' && lib.downloads.artifact.sha1 && uploadedFiles.has(lib.downloads.artifact.sha1)) {
        const computedPath = lib.downloads.artifact.path || mavenToPath(lib.name)
        const destPath = `libraries/${computedPath}`
        lib.downloads.artifact.url = `${baseUrl}/${destPath}`
        pathsToMove.set(lib.downloads.artifact.sha1, destPath)
      }

      if (lib.downloads?.classifiers) {
        for (const key in lib.downloads.classifiers) {
          const classifier = lib.downloads.classifiers[key]
          if (classifier.url === 'eml://upload' && classifier.sha1 && uploadedFiles.has(classifier.sha1)) {
            const computedPath = classifier.path || mavenToPath(lib.name).replace('.jar', `-${key}.jar`)
            const destPath = `libraries/${computedPath}`
            classifier.url = `${baseUrl}/${destPath}`
            pathsToMove.set(classifier.sha1, destPath)
          }
        }
      }

      if (lib.url === 'eml://upload' && !lib.downloads?.artifact) {
        // Gestion des librairies n'ayant que des checksums (ex: certaines versions de Forge)
        const sha1 = lib.sha1 || (Array.isArray(lib.checksums) ? lib.checksums[0] : undefined)

        if (sha1 && uploadedFiles.has(sha1)) {
          const computedPath = lib.path || mavenToPath(lib.name)
          const destPath = `libraries/${computedPath}`
          lib.url = `${baseUrl}/${destPath}`
          pathsToMove.set(sha1, destPath)
        }
      }
    }
  }

  return { manifest, pathsToMove }
}

/**
 * @param assetIndex Parsed asset index.
 * @param baseUrl Eg. `'{{url}}/files/loaders/${profile.slug}'`
 * @param uploadedFiles Get the uploaded files from `getCachedFilesParsed` and convert it to a Map 
 * with SHA-1 as key.
 */
export function rewriteAssetIndexUrls(
  assetIndex: any,
  baseUrl: string,
  uploadedFiles: Map<string, File_>
): { assetIndex: any; pathsToMove: Map<string, string> } {
  const pathsToMove = new Map<string, string>()

  if (assetIndex.objects && typeof assetIndex.objects === 'object') {
    for (const path in assetIndex.objects) {
      if (Object.prototype.hasOwnProperty.call(assetIndex.objects, path)) {
        const node = assetIndex.objects[path]

        if (node.url === 'eml://upload' && node.hash && uploadedFiles.has(node.hash)) {
          const hash = node.hash
          const subfolder = hash.substring(0, 2)
          const destPath = `assets/objects/${subfolder}/${hash}`

          node.url = `${baseUrl}/${destPath}`
          pathsToMove.set(hash, destPath)
        }
      }
    }
  }

  return { assetIndex, pathsToMove }
}

