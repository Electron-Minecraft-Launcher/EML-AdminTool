<script lang="ts">
  import { l } from '$lib/stores/language'
  import { getCMLanguage } from '$lib/utils/files'
  import type { File as File_ } from '$lib/utils/types'
  import { onDestroy, onMount } from 'svelte'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { EditorView, lineNumbers } from '@codemirror/view'
  import { EditorState } from '@codemirror/state'
  import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
  import { keymap } from '@codemirror/view'
  import { syntaxHighlighting, defaultHighlightStyle, indentOnInput, foldKeymap, bracketMatching } from '@codemirror/language'
  import { defaultKeymap, indentWithTab } from '@codemirror/commands'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import { NotificationCode } from '$lib/utils/notifications'
  import type { Profile } from '@prisma/client'

  interface Props {
    show: boolean
    files: File_[]
    selectedProfile: Profile
    fileToEdit: File_
  }

  let { show = $bindable(), files = $bindable(), selectedProfile, fileToEdit = $bindable() }: Props = $props()

  let showLoader = $state(false)

  let path = $state(fileToEdit.path)
  let name = $state(fileToEdit.name)
  let ext = $derived(name.split('.').pop() ?? '')
  let content = $state('')

  let editorContainer: HTMLDivElement
  let editorView: EditorView
  const editorTheme = EditorView.theme({
    '&, .cm-content *, .cm-gutters *, .cm-editor *': { fontFamily: 'monospace !important', fontSize: '14px' },
    '&': { height: '100%', fontSize: '14px' }
  })

  onMount(async () => {
    if (fileToEdit.url) {
      try {
        const response = await fetch(fileToEdit.url)
        if (!response.ok) {
          console.error('Failed to download file:', response.statusText)
          const message = $l.notifications.INTERNAL_SERVER_ERROR
          addNotification('ERROR', message)
          return
        }
        content = await response.text()
      } catch (err) {
        console.error('Failed to download file:', err)
        const message = $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      }
    }

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        getCMLanguage(ext),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        autocompletion(),
        closeBrackets(),
        indentOnInput(),
        bracketMatching(),
        keymap.of([...defaultKeymap, indentWithTab, ...closeBracketsKeymap, ...completionKeymap, ...foldKeymap]),
        EditorView.lineWrapping,
        editorTheme
      ]
    })

    editorView = new EditorView({
      state,
      parent: editorContainer
    })
  })

  onDestroy(() => {
    editorView.destroy()
  })

  async function download() {
    try {
      const blob = new Blob([content], { type: 'text/plain' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = name.removeUnwantedFilenameChars()
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error(err)
      // TODO
    }
  }

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('path', path)
    formData.set('name', name)
    formData.set('content', editorView.state.doc.toString())
    formData.set('profile-id', selectedProfile.id)

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        files = result.data?.files as File_[]
        show = false
      }

      await applyAction(result)
    }
  }
</script>

<svelte:body
  onkeydown={(e) => {
    if (e.key === 'Escape') {
      if (confirm('Are you sure you want to close the editor? Unsaved changes will be lost.')) {
        show = false
      } else {
        e.stopPropagation()
      }
    }
  }}
/>

<ModalTemplate size={'l'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/editFile" use:enhance={enhanceForm}>
    <h2>Edit file</h2>

    <button class="secondary small right" type="button" onclick={download}>
      <i class="fa-solid fa-cloud-arrow-down"></i>&nbsp;&nbsp;Download file
    </button>

    <p class="label">Files Updater/{path}</p>
    <p class="name">{name}</p>

    <div class="editor" bind:this={editorContainer}></div>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary">{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  button.right {
    opacity: 1 !important;
  }

  label.name {
    margin-top: 5px;
    margin-right: 5px;
    display: inline-block !important;
  }

  p.name {
    font-size: 17px;
    font-weight: 500;
  }

  div.editor {
    height: calc(100vh - 177px - 66px - 27px - 30px - 20px - 69px);
    width: calc(100vw - 162px - 2px);
    border: 1px solid var(--border-color2);
    margin-top: 20px;
    overflow-y: auto;
    overflow-x: auto;
    font-family: 'Courier New', Courier, monospace;
    border-radius: 5px;
  }
</style>
