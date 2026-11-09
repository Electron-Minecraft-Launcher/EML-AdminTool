<script lang="ts">
  import DOMPurify from 'isomorphic-dompurify'
  import { onMount } from 'svelte'
  import { getMarked } from '$lib/utils/marked'

  interface Props {
    source: string
  }

  let { source }: Props = $props()

  const parser = getMarked()
  const purifyConfig = {
    ADD_TAGS: ['span', 'div', 'p', 'pre', 'code'],
    ADD_ATTR: ['class', 'style'],
    FORBID_ATTR: ['style', 'onerror', 'onload']
  }

  onMount(() => {})
</script>

<div class="markdown-body">
  {@html DOMPurify.sanitize(parser.parse(source) as string, purifyConfig)}
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
      border-bottom: 1px solid var(--border-subtle);
      font-weight: 700 !important;
    }

    h2 {
      font-size: 1.55rem;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-subtle);
    }

    h3 {
      font-size: 1.27rem;
      padding-bottom: 2px;
      border-bottom: 1px solid var(--border-subtle);
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
      border-left: 4px solid var(--border-default);
      padding-left: 16px;
      color: var(--text-secondary);
      margin: 16px 0;
    }

    hr {
      border: none;
      border-top: 3px solid var(--border-subtle);
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
      background: var(--surface-page);
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
      margin: 0;

      code.hljs {
        display: block;
        padding: 1em;
        background: var(--surface-code-background);
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
        border: 1px solid var(--border-subtle);
        padding: 6px 13px;
        text-align: left;
      }

      th {
        background-color: var(--surface-page);
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
        border-left-color: var(--link-color);

        .markdown-alert-title {
          color: var(--link-color);

          &::before {
            content: '\f05a';
          }
        }
      }

      &.markdown-alert-tip {
        border-left-color: var(--markdown-note-success);

        .markdown-alert-title {
          color: var(--markdown-note-success);

          &::before {
            content: '\f0eb';
          }
        }
      }

      &.markdown-alert-important {
        border-left-color: var(--markdown-note-tip);

        .markdown-alert-title {
          color: var(--markdown-note-tip);

          &::before {
            content: '\f06a';
          }
        }
      }

      &.markdown-alert-warning {
        border-left-color: var(--markdown-note-warning);

        .markdown-alert-title {
          color: var(--markdown-note-warning);

          &::before {
            content: '\f071';
          }
        }
      }

      &.markdown-alert-caution {
        border-left-color: var(--markdown-note-danger);

        .markdown-alert-title {
          color: var(--markdown-note-danger);

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
      border-top: 1px solid var(--border-subtle);

      .nav-button {
        display: flex;
        flex-direction: column;
        flex-basis: 48%;
        padding: 16px 20px !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: 5px;
        text-decoration: none;
        transition: all 0.2s ease;
        line-height: 1.3 !important;

        span {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        strong {
          font-size: 1rem;
          font-weight: 600;
          color: var(--accent-color);
          transition: color 0.2s ease;
        }

        i {
          font-size: 0.8rem;
        }

        &:hover {
          border-color: var(--accent-color);
          background-color: var(--surface-white);

          strong {
            color: var(--accent-hover-color);
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
      background-color: var(--surface-page);

      .code-switch-header {
        display: flex;
        background-color: var(--surface-code-background);
        border-bottom: 1px solid var(--border-subtle);
        padding: 0;
      }

      .code-switch-button {
        padding: 8px 16px;
        font-size: 13px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        color: var(--text-secondary);
        background: var(--transparent-color);
        border: none;
        border-radius: 5px 5px 0 0 !important;
        cursor: pointer;
        border-bottom: 2px solid var(--transparent-color) !important;
        transition: all 0.2s ease;
        opacity: 0.7;

        &:hover {
          opacity: 1;
          background-color: var(--surface-hover-subtle);
        }

        &.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color) !important;
          opacity: 1;
        }
      }

      .code-switch-body {
        position: relative;
        background: var(--surface-code-background);
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
