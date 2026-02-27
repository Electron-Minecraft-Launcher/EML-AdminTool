import { goto } from '$app/navigation'
import type { File as File_ } from '$lib/utils/types'

/**
 * @param duration Sleep duration in ms.
 */
export function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

/**
 * Pings the server and reloads the page if successful. The function first waits for `sleepDuration` before attempting to ping the server.
 * @param retrying Number of times to retry pinging the server. Default is `10`, so the client will retry for about 1 minute.
 * @param reload Whether to reload the page upon successful ping. If a string is provided, it will redirect to that URL instead. Default is `true`.
 * @param oldVersion The old version string to compare against. If provided, the function will only reload/redirect if the server version has changed.
 */
export async function waitForServerRestart(retrying: number = 10, reload: boolean | string = true, oldVersion?: string) {
  let delay = 1000

  for (let i = 0; i < retrying; i++) {
    await sleep(delay)
    delay = Math.min(delay * 1.5, 10000)

    try {
      const response = await fetch(`/api/ping?t=${Date.now()}`)

      if (response.ok) {
        if (oldVersion) {
          const newVersion = await response.text()

          if (newVersion.trim() === oldVersion.trim()) {
            console.log(`Server is up but version is still ${oldVersion}. Waiting for update...`)
            continue
          }
        }

        if (typeof reload === 'string') window.location.href = reload
        else if (reload) window.location.reload()
        return
      } else {
        console.warn(`Server responded with status ${response.status}, waiting...`)
      }
    } catch (err) {
      console.log(`Server unreachable (attempt ${i + 1}/${retrying}), retrying in ${Math.round(delay)}ms...`)
    }
  }

  console.error('Failed to contact server after multiple attempts.')
  alert('The server seems to be taking a long time to restart. Please try refreshing the page manually.')
}

/**
 * Returns the appropriate FontAwesome icon class for a given file based on its type or extension.
 * @param file The file object containing its name and type.
 */
export function getFileIcon(file: File_) {
  if (file.type === 'FOLDER') return 'fa-solid fa-folder'
  switch (file.name.split('.').slice(-1)[0]) {
    case 'pdf':
      return 'fa-solid fa-file-pdf'
    case 'txt':
      return 'fa-solid fa-file-lines'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return 'fa-solid fa-image'
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
    case 'm4a':
      return 'fa-solid fa-music'
    case 'mp4':
    case 'avi':
    case 'mkv':
    case 'mov':
    case 'wmv':
    case 'flv':
      return 'fa-solid fa-film'
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'fa-solid fa-file-zipper'
    case 'html':
    case 'xml':
    case 'json':
    case 'yaml':
    case 'yml':
    case 'properties':
    case 'config':
      return 'fa-solid fa-code'
    case 'jar':
      return 'fa-brands fa-java'
    case 'py':
      return 'fa-brands fa-python'
    case 'md':
      return 'fa-brands fa-markdown'
    case 'doc':
    case 'docx':
    case 'odt':
    case 'rtf':
      return 'fa-solid fa-file-word'
    case 'xls':
    case 'xlsx':
    case 'ods':
    case 'csv':
      return 'fa-solid fa-file-excel'
    case 'ppt':
    case 'pptx':
    case 'odp':
      return 'fa-solid fa-file-powerpoint'
    case 'exe':
    case 'msi':
    case 'ssh':
    case 'sh':
    case 'bat':
    case 'cmd':
    case 'ps1':
      return 'fa-solid fa-terminal'
    default:
      return 'fa-solid fa-file'
  }
}

export function extractVersionFromYaml(content: string) {
  const match = content.match(/^version:\s*(.+)$/m)
  return match ? match[1].trim() : null
}