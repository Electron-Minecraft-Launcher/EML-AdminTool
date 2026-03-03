import { xml } from '@codemirror/lang-xml'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { markdown } from '@codemirror/lang-markdown'
import type { LanguageSupport } from '@codemirror/language'

export const readableFiles: string[] = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'html',
  'css',
  'xml',
  'json',
  'yaml',
  'yml',
  'md',
  'sql',
  'sh',
  'py',
  'config',
  'log',
  'txt',
  'ini',
  'conf',
  'options',
  'properties'
]

export function getFileLanguage(ext: string): string {
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'xml':
      return 'xml'
    case 'json':
      return 'json'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'md':
      return 'markdown'
    case 'sql':
      return 'sql'
    case 'sh':
      return 'shell'
    case 'py':
      return 'python'
    case 'config':
      return 'config'
    case 'log':
      return 'log'
    default:
      return 'plaintext'
  }
}

export function getCMLanguage(ext: string): LanguageSupport | [] {
  switch (ext) {
    case 'html':
    case 'xml':
      return xml()
    case 'json':
      return json()
    case 'yaml':
    case 'yml':
      return yaml()
    case 'md':
      return markdown()
    default:
      return []
  }
}