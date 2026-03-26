import { smartUpload } from '$lib/utils/uploader'
import { invalidateAll } from '$app/navigation'
import { addNotification } from '$lib/stores/notifications'
import type { File as File_ } from '$lib/utils/types'

class UploadStore {
  isUploading = $state(false)
  currentFile = $state('')
  queueLength = $state(0)

  totalBytes = $state(0)
  uploadedBytes = $state(0)
  globalProgress = $derived(this.totalBytes === 0 ? 0 : Math.floor((this.uploadedBytes / this.totalBytes) * 100))

  private fileSizes = new Map<string, number>()
  private fileProgress = new Map<string, number>()

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
      context: `files-updater/${slug}`,
      mode: 'BEST_EFFORT',
      currentPath,
      promptOverwrite: async (fileName) => confirm(`File "${fileName}" already exists. Do you want to overwrite it?`),
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

export const uploader = new UploadStore()

