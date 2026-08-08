import { smartUpload } from '$lib/utils/uploader'
import { invalidateAll } from '$app/navigation'
import { addNotification } from '$lib/stores/notifications'
import type { Context, File as File_, FileDir } from '$lib/utils/types'

class UploadStore {
  isUploading = $state(false)
  currentFile = $state('')
  queueLength = $state(0)

  totalBytes = $state(0)
  uploadedBytes = $state(0)
  globalProgress = $derived(this.totalBytes === 0 ? 0 : Math.floor((this.uploadedBytes / this.totalBytes) * 100))

  private fileSizes = new Map<string, number>()
  private fileProgress = new Map<string, number>()

  private home: 'files-updater' | '.staging-loader'
  private mode: 'BEST_EFFORT' | 'ALL_OR_NOTHING'
  private currentPath: string
  private promptOverwrite: (fileName: string) => Promise<boolean>

  constructor(
    home: 'files-updater' | '.staging-loader',
    mode: 'BEST_EFFORT' | 'ALL_OR_NOTHING',
    currentPath: string,
    promptOverwrite: (fileName: string) => Promise<boolean>
  ) {
    this.home = home
    this.mode = mode
    this.currentPath = currentPath
    this.promptOverwrite = promptOverwrite
  }

  async startUpload(files: File[], currentPath: string, slug: string, onFileUploaded?: (newFile: File_) => void) {
    if (files.length === 0) return

    this.isUploading = true
    this.queueLength += files.length

    const batchSize = files.reduce((acc, f) => acc + f.size, 0)
    this.totalBytes += batchSize

    files.forEach((f) => {
      this.fileSizes.set(f.name, f.size)
      this.fileProgress.set(f.name, 0)
    })

    const success = await smartUpload(files, {
      context: `${this.home}/${slug}`,
      mode: this.mode,
      currentPath,
      promptOverwrite: this.promptOverwrite,
      onProgress: (fileName, percentage) => {
        this.currentFile = fileName

        const size = this.fileSizes.get(fileName) || 0
        this.fileProgress.set(fileName, (percentage / 100) * size)

        let total = 0
        for (const val of this.fileProgress.values()) total += val
        this.uploadedBytes = total
      },
      onFileComplete: (newFile: File_) => {
        this.queueLength--
        if (onFileUploaded) onFileUploaded(newFile)
      },
      onError: (fileName, message) => {
        addNotification('ERROR', `Error on ${fileName}: ${message}`)
      }
    })

    if (success) {
      await invalidateAll()
    }

    if (this.queueLength <= 0) {
      this.isUploading = false
      this.queueLength = 0
      this.currentFile = ''
      this.totalBytes = 0
      this.uploadedBytes = 0
      this.fileSizes.clear()
      this.fileProgress.clear()
    }
  }
}

export const filesUpdaterUploader = new UploadStore('files-updater', 'BEST_EFFORT', '', async (fileName) =>
  confirm(`File "${fileName}" already exists. Do you want to overwrite it?`)
)

export type { UploadStore }

export const customLoaderUploader = new UploadStore('.staging-loader', 'ALL_OR_NOTHING', '', async () => true)

