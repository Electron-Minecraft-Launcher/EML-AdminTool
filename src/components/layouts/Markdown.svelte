<script lang="ts">
  import { marked } from 'marked'
  import { markedHighlight } from 'marked-highlight'
  import markedAlert from 'marked-alert'
  import DOMPurify from 'isomorphic-dompurify'
  import hljs from 'highlight.js'

  interface Props {
    source: string
  }

  let { source }: Props = $props()

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

  const purifyConfig = {
    ADD_TAGS: ['span', 'div', 'p', 'pre', 'code'], 
    ADD_ATTR: ['class', 'style'],
  }
</script>

<div class="markdown-body">
  {@html DOMPurify.sanitize(marked.parse(source) as string, purifyConfig)}
</div>

<style lang="scss" global>
  @use 'highlight.js/styles/github.css';

  :global(div.markdown-body) {
    & > *:first-child {
      margin-top: 0;
    }

    & > *:last-child {
      margin-bottom: 0 !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5 {
      margin-top: 24px;
      margin-bottom: 18px;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      position: relative;
      scroll-margin-top: 80px;
    }

    h1 {
      font-size: 2.1rem;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 700 !important;
    }

    h2 {
      font-size: 1.55rem;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-color);
    }

    h3 {
      font-size: 1.27rem;
      padding-bottom: 2px;
      border-bottom: 1px solid var(--border-color);
    }

    h4 {
      font-size: 1.02rem;
      padding-bottom: 0px;
    }

    h5 {
      font-size: 0.88rem;
      padding-bottom: 0;
    }

    p,
    li {
      font-size: 15px;
      line-height: 1.7;
      word-wrap: break-word;
    }

    ul,
    ol {
      padding-left: 25px;
    }

    a {
      line-height: 1.2;
    }

    strong {
      font-weight: 600;
    }

    blockquote {
      border-left: 4px solid var(--border-color2);
      padding-left: 16px;
      color: #555;
      margin: 16px 0;
    }

    hr {
      border: none;
      border-top: 3px solid var(--border-color);
      margin: 2rem 0;
    }

    img {
      max-width: 100%;
      border-radius: 5px;
      margin: 16px 0;
      text-align: center;
    }

    /* --- Code --- */
    code {
      background: var(--background-color);
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 90%;
      font-family: 'Fira Code', monospace;
      line-height: 1.7;

      * {
        font-family: inherit;
        line-height: inherit;
      }
    }

    pre {
      overflow-x: auto;
      max-width: 100%;
      margin: 0;

      code.hljs {
        display: block;
        padding: 1em;
        background: #f3f4f6;
        border-radius: 5px;

        * {
          font-size: 14px;
        }
      }
    }

    /* --- Tableaux --- */
    table {
      width: auto;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 15px;
      line-height: 1.7;

      th,
      td {
        border: 1px solid var(--border-color);
        padding: 6px 13px;
        text-align: left;
      }

      th {
        background-color: var(--background-color);
        font-weight: 600;
        text-align: center;
      }
    }

    /* --- Admonitions (Alerts) --- */
    .markdown-alert {
      padding: 8px 0 8px 20px;
      margin: 16px 0;
      border-radius: 0;
      border-left-width: 5px;
      border-left-style: solid;

      p {
        margin: 0;
      }

      & > *:first-child {
        margin-top: 0;
      }

      & > *:last-child {
        margin-bottom: 0;
      }

      .markdown-alert-title {
        margin-bottom: 12px;
        font-size: 1rem;
        font-weight: 600;
        display: flex;
        align-items: center;

        &::before {
          font-family: 'Font Awesome 7 Free';
          font-weight: 900;
          margin-right: 10px;
        }
      }

      /* Variantes explicites (Pas de boucle each) */
      &.markdown-alert-note {
        border-left-color: #0869da;

        .markdown-alert-title {
          color: #0869da;

          &::before {
            content: '\f05a';
          }
        }
      }

      &.markdown-alert-tip {
        border-left-color: #1b7f38;

        .markdown-alert-title {
          color: #1b7f38;

          &::before {
            content: '\f0eb';
          }
        }
      }

      &.markdown-alert-important {
        border-left-color: #8251de;

        .markdown-alert-title {
          color: #8251de;

          &::before {
            content: '\f06a';
          }
        }
      }

      &.markdown-alert-warning {
        border-left-color: #9a6700;

        .markdown-alert-title {
          color: #9a6700;

          &::before {
            content: '\f071';
          }
        }
      }

      &.markdown-alert-caution {
        border-left-color: #cf232e;

        .markdown-alert-title {
          color: #cf232e;

          &::before {
            content: '\f06a';
          }
        }
      }
    }

    /* --- Navigation Doc (Prev/Next) --- */
    .doc-nav {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);

      .nav-button {
        display: flex;
        flex-direction: column;
        flex-basis: 48%;
        padding: 16px 20px !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 5px;
        text-decoration: none;
        transition: all 0.2s ease;
        line-height: 1.3 !important;

        span {
          font-size: 0.9rem;
          color: #808080;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        strong {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary-color);
          transition: color 0.2s ease;
        }

        i {
          font-size: 0.8rem;
        }

        &:hover {
          border-color: var(--primary-color);
          background-color: var(--background-light-color);

          strong {
            color: var(--primary-color-hover);
          }
        }

        &.prev {
          span {
            justify-content: flex-start;
          }

          strong {
            text-align: left;
          }

          i {
            margin-right: 8px;
          }
        }

        &.next {
          margin-left: auto;
          text-align: right;

          span {
            justify-content: flex-end;
          }

          strong {
            text-align: right !important;
          }

          i {
            margin-left: 8px;
          }
        }
      }
    }

    /* --- Code Switcher --- */
    .code-switch-container {
      margin: 16px 0;
      border-radius: 5px;
      overflow: hidden;
      background-color: var(--background-color);

      .code-switch-header {
        display: flex;
        background-color: #f3f4f6;
        border-bottom: 1px solid var(--border-color);
        padding: 0;
      }

      .code-switch-button {
        padding: 8px 16px;
        font-size: 13px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        color: #666;
        background: transparent;
        border: none;
        border-radius: 5px 5px 0 0 !important;
        cursor: pointer;
        border-bottom: 2px solid transparent !important;
        transition: all 0.2s ease;
        opacity: 0.7;

        &:hover {
          opacity: 1;
          background-color: rgba(0, 0, 0, 0.03);
        }

        &.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color) !important;
          opacity: 1;
        }
      }

      .code-switch-body {
        position: relative;
        background: #f3f4f6;
      }

      .code-switch-pane {
        display: none;

        &.active {
          display: block;
          animation: fadeIn 0.2s ease;
        }

        pre {
          margin: 0 !important;
          border: none !important;
          border-radius: 0 !important;

          code.hljs {
            border-radius: 0 0 6px 6px !important;
            padding: 1.2em !important;
            border: none !important;
          }
        }
      }
    }
  }
</style>
