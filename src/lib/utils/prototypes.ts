export {}

declare global {
  interface String {
    /**
     * Replace all `\` with `/` and remove leading slashes.
     */
    formatPath(): string
    /**
     * Remove all forbidden chars in a filename.
     */
    removeUnwantedFilenameChars(): string
    /**
     * Capitalize the first char of the string and make the rest lowercase.
     */
    firstCharToUpperCase(): string
  }

  interface Date {
    /**
     * Format the date to a human-readable string.
     */
    formatDate(): string
    /**
     * Format the date to a short human-readable string.
     */
    shortFormatDate(): string
    /**
     * Format the date to a string suitable for input fields.
     */
    formatDateInput(): string
    /**
     * Format the date to a string suitable for logs.
     */
    formatDateLogs(): string
  }
}

String.prototype.formatPath = function (): string {
  return this.split('\\').join('/').replace(/^\/+/, '')
}

String.prototype.removeUnwantedFilenameChars = function (): string {
  return this.replace(/[\x00-\x1F\x7F"*/:<>?\\|]/g, '')
    .replace(/^\.{2,}/, '')
    .replace(/\.+$/, '')
    .trim()
}

String.prototype.firstCharToUpperCase = function (): string {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
}

Date.prototype.formatDate = function (): string {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  return dateFormatter.format(this)
}

Date.prototype.shortFormatDate = function (): string {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  return dateFormatter.format(this)
}

Date.prototype.formatDateInput = function (): string {
  let year = this.getFullYear()
  let month = ('0' + (this.getMonth() + 1)).slice(-2)
  let day = ('0' + this.getDate()).slice(-2)
  let hours = ('0' + this.getHours()).slice(-2)
  let minutes = ('0' + this.getMinutes()).slice(-2)
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

Date.prototype.formatDateLogs = function (): string {
  const year = this.getFullYear()
  const month = String(this.getMonth() + 1).padStart(2, '0')
  const day = String(this.getDate()).padStart(2, '0')

  const hours = String(this.getHours()).padStart(2, '0')
  const minutes = String(this.getMinutes()).padStart(2, '0')
  const seconds = String(this.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

