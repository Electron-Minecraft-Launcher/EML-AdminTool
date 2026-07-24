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
  const parts = name.split(':')
  if (parts.length < 3) return name

  const pkg = parts[0].replace(/\./g, '/')
  const artifact = parts[1]
  const version = parts[2]

  const classifier = parts.length > 3 ? `-${parts[3]}` : ''

  return `${pkg}/${artifact}/${version}/${artifact}-${version}${classifier}.jar`
}

export function getMissingLibrariesFromVersion(jsonString: string): MissingLibrary[] {
  const manifest = JSON.parse(jsonString)
  const missingFiles: MissingLibrary[] = []

  if (manifest.assetIndex?.url === '') {
    missingFiles.push({ sha1: manifest.assetIndex.sha1, size: manifest.assetIndex.size, path: '*assetIndex.json' })
  }

  if (manifest.downloads?.client?.url === '') {
    missingFiles.push({ sha1: manifest.downloads.client.sha1, size: manifest.downloads.client.size, path: '*client.jar' })
  }

  if (manifest.downloads?.client_mappings?.url === '') {
    missingFiles.push({ sha1: manifest.downloads.client_mappings.sha1, size: manifest.downloads.client_mappings.size, path: '*client.txt' })
  }

  if (manifest.logging?.client?.file?.url === '') {
    missingFiles.push({ sha1: manifest.logging.client.file.sha1, size: manifest.logging.client.file.size, path: '*logging' })
  }

  if (Array.isArray(manifest.libraries)) {
    for (const lib of manifest.libraries) {
      let isMissing = false

      if (lib.downloads?.artifact?.url === '') {
        missingFiles.push({
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
            missingFiles.push({
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

        missingFiles.push({
          sha1: lib.sha1 || (Array.isArray(lib.checksums) ? lib.checksums[0] : undefined),
          size: lib.size,
          path: computedPath
        })
      }
    }
  }

  return missingFiles
}

export function getMissingAssetsFromIndex(jsonString: string): MissingAsset[] {
  const manifest = JSON.parse(jsonString)
  const missingFiles: MissingAsset[] = []

  if (manifest.objects && typeof manifest.objects === 'object') {
    for (const path in manifest.objects) {
      if (Object.prototype.hasOwnProperty.call(manifest.objects, path)) {
        const node = manifest.objects[path]

        if (typeof node.hash === 'string' && typeof node.size === 'number' && node.url === '') {
          missingFiles.push({
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

