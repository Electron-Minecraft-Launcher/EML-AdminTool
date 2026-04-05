import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import markedAlert from 'marked-alert'
import hljs from 'highlight.js'

let configured = false

export function getMarked() {
  if (!configured) {
    marked.use(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        }
      })
    )

    marked.use(
      markedAlert({
        variants: [
          { icon: '', type: 'note' },
          { icon: '', type: 'tip' },
          { icon: '', type: 'important' },
          { icon: '', type: 'warning' },
          { icon: '', type: 'caution' }
        ]
      })
    )

    marked.use({
      breaks: true,
      gfm: true
    })

    configured = true
  }

  return marked
}

