import { ServerError } from '$lib/utils/errors'
import { NotificationCode } from '$lib/utils/notifications'

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

export function getMissingLibrariesFromVersion(jsonString: string): [Map<string, MissingLibrary>, MissingSpecialFiles] {
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

  if (manifest.assetIndex?.url === '') {
    const file = manifest.assetIndex
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*assetIndex.json' })
    missingSpecialFiles.assetIndexJson = file.sha1
  }

  if (manifest.downloads?.client?.url === '') {
    const file = manifest.downloads.client
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*client.jar' })
    missingSpecialFiles.clientJar = file.sha1
  }

  if (manifest.downloads?.client_mappings?.url === '') {
    const file = manifest.downloads.client_mappings
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*client.txt' })
    missingSpecialFiles.clientTxt = file.sha1
  }

  if (manifest.logging?.client?.file?.url === '') {
    const file = manifest.logging.client.file
    missingFiles.set(file.sha1, { sha1: file.sha1, size: file.size, path: '*logging.xml' })
    missingSpecialFiles.loggingXml = file.sha1
  }

  if (Array.isArray(manifest.libraries)) {
    for (const lib of manifest.libraries) {
      let isMissing = false

      if (lib.downloads?.artifact?.url === '') {
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
          if (classifier.url === '') {
            missingFiles.set(classifier.sha1, {
              sha1: classifier.sha1,
              size: classifier.size,
              path: classifier.path
            })
            isMissing = true
          }
        }
      }

      if (!isMissing && lib.url === '') {
        const computedPath = lib.path || (lib.name ? mavenToPath(lib.name) : 'unknown.jar')

        missingFiles.set(lib.sha1 || (Array.isArray(lib.checksums) ? lib.checksums[0] : undefined), {
          sha1: lib.sha1 || (Array.isArray(lib.checksums) ? lib.checksums[0] : undefined),
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

        if (typeof node.hash === 'string' && typeof node.size === 'number' && node.url === '') {
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

export function rewriteManifestUrls(manifest: any, baseUrl: string): any {
  if (manifest.assetIndex?.url === '') {
    manifest.assetIndex.url = `${baseUrl}/assets/indexes/${manifest.assetIndex.id}.json`
  }

  if (manifest.downloads?.client?.url === '') {
    manifest.downloads.client.url = `${baseUrl}/versions/${manifest.id}/client.jar`
  }

  if (manifest.downloads?.client_mappings?.url === '') {
    manifest.downloads.client_mappings.url = `${baseUrl}/versions/${manifest.id}/client_mappings.txt`
  }

  if (manifest.logging?.client?.file?.url === '') {
    manifest.logging.client.file.url = `${baseUrl}/assets/log_configs/${manifest.logging.client.file.id}`
  }

  if (Array.isArray(manifest.libraries)) {
    for (const lib of manifest.libraries) {
      if (lib.downloads?.artifact?.url === '') {
        lib.downloads.artifact.url = `${baseUrl}/libraries/${lib.downloads.artifact.path}`
      }

      if (lib.downloads?.classifiers) {
        for (const key in lib.downloads.classifiers) {
          const classifier = lib.downloads.classifiers[key]
          if (classifier.url === '') {
            classifier.url = `${baseUrl}/libraries/${classifier.path}`
          }
        }
      }

      if (lib.url === '' && !lib.downloads?.artifact) {
        const computedPath = lib.path || mavenToPath(lib.name)
        lib.url = `${baseUrl}/libraries/${computedPath}`
      }
    }
  }

  return manifest
}

export function rewriteAssetIndexUrls(assetIndex: any, baseUrl: string): any {
  if (assetIndex.objects && typeof assetIndex.objects === 'object') {
    for (const path in assetIndex.objects) {
      if (Object.prototype.hasOwnProperty.call(assetIndex.objects, path)) {
        const node = assetIndex.objects[path]

        if (node.url === '') {
          const hash = node.hash
          const subfolder = hash.substring(0, 2)
          node.url = `${baseUrl}/assets/objects/${subfolder}/${hash}`
        }
      }
    }
  }

  return assetIndex
}

