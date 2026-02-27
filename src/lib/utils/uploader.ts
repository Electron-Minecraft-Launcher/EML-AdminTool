interface InitUploadRequest {
  context: 'files-updater' | 'bootstraps' | 'backgrounds' | 'news'
  files: {
    id: string
    path: string
    size: number
    sha256: string
    overwrite: boolean
  }[]
}

interface CommitUploadRequest {
  uuid: string
  token: string
  context: 'files-updater' | 'bootstraps' | 'backgrounds' | 'news'
}

