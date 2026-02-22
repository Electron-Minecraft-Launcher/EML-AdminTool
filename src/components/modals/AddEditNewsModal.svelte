<script lang="ts">
  import type { NewsCategory, NewsTag } from '@prisma/client'
  import type { PageData } from '../../routes/(app)/dashboard/news/$types'
  import type { File as File_ } from '$lib/utils/types'
  import { slide } from 'svelte/transition'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { EditorView, keymap, lineNumbers } from '@codemirror/view'
  import { onDestroy, onMount } from 'svelte'
  import { markdown } from '@codemirror/lang-markdown'
  import { bracketMatching, defaultHighlightStyle, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language'
  import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
  import { defaultKeymap, indentWithTab } from '@codemirror/commands'
  import { EditorState } from '@codemirror/state'
  import { l } from '$lib/stores/language'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import { NotificationCode } from '$lib/utils/notifications'
  import NewsViewer from '../contents/NewsViewer.svelte'
  import getUser from '$lib/utils/user'
  import { callAction } from '$lib/utils/call'
  import { invalidateAll } from '$app/navigation'

  interface Props {
    show: boolean
    news: PageData['news']
    newsCategories: NewsCategory[]
    newsTags: NewsTag[]
    images: File_[]
    selectedNewsId: string | null
  }

  let { show = $bindable(), news, newsCategories, newsTags, images, selectedNewsId }: Props = $props()

  const user = getUser()

  let showLoader = $state(false)

  let mode: 'EDIT' | 'PREVIEW' = $state('EDIT')
  let selectedNews = $state(news.find((n) => n.id === selectedNewsId) ?? null)
  let title = $state(selectedNews?.title ?? '')
  let content = $state(selectedNews?.content ?? '')
  let categories = $state(selectedNews?.categories ?? [])
  let tags = $state(selectedNews?.tags ?? [])

  $inspect(categories)

  let editorContainer: HTMLDivElement
  let editorView: EditorView
  const editorTheme = EditorView.theme({
    '&, .cm-content *, .cm-gutters *, .cm-editor *': { fontFamily: 'monospace !important', fontSize: '14px' },
    '&': { height: '100%', fontSize: '14px' }
  })

  let addCategoriesDropdownOpen = $state(false)
  let addTagsDropdownOpen = $state(false)

  onMount(() => {
    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        markdown(),
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
    editorView?.destroy()
  })

  function backgroundColor(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  }

  async function uploadImages() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.click()

    await new Promise((resolve) => {
      input.addEventListener('change', resolve, { once: true })
    })

    const formData = new FormData()
    if (input.files) {
      for (const file of Array.from(input.files)) {
        formData.append('images', file)
      }
    }

    if (formData.get('images') === null) return

    await callAction({ url: '/dashboard/news', action: 'uploadImages', formData }, $l)
    invalidateAll()
  }

  async function copy(image: File_) {
    navigator.clipboard.writeText(`![${image.name}](${image.url})`)
  }

  async function deleteImage(imageName: string) {
    if (!confirm('Are you sure you want to delete this image? It will not be available in the news anymore.')) return
    
    const formData = new FormData()
    formData.set('image-name', imageName)

    await callAction({ url: '/dashboard/news', action: 'deleteImage', formData }, $l)
    invalidateAll()
  }

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('news-id', selectedNewsId ?? '')
    formData.set('content', editorView!.state.doc.toString())
    for (const category of categories) formData.append('categories', category.id)
    for (const tag of tags) formData.append('tags', tag.id)

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        show = false
      }

      await applyAction(result)
    }
  }
</script>

<!--* Images -->

<div class="explorer" transition:slide>
  <h3>Images</h3>

  <div class="list">
    {#each images as image}
      <div class="img" style="background-image: url('{image.url}')">
        <div>
          <button onclick={() => copy(image)} aria-label="Copy image URL"><i class="fa-solid fa-copy"></i></button>
          <button class="remove" onclick={() => deleteImage(image.name)} aria-label="Delete image"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    {:else}
      <p class="nothing">No image</p>
    {/each}
    {#if images?.length % 2 !== 0}
      <div class="img"></div>
    {/if}
  </div>

  <button class="secondary" onclick={uploadImages}><i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Upload images...</button>
</div>

<!--* Modal -->

<svelte:body
  onclick={(e) => {
    // @ts-ignore
    if (addCategoriesDropdownOpen && e.target && !e.target.closest('button.add.categories')) {
      addCategoriesDropdownOpen = false
    }
    // @ts-ignore
    if (addTagsDropdownOpen && e.target && !e.target.closest('button.add.tags')) {
      addTagsDropdownOpen = false
    }
  }}
/>

<ModalTemplate size={'m'} bind:show translateX={'-23%'}>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/addEditNews" use:enhance={enhanceForm}>
    <h2>{selectedNewsId ? 'Edit news' : 'Publish news'}</h2>

    <div style="display: {mode === 'EDIT' ? 'block' : 'none'}">
      <label for="title">Title</label>
      <input type="text" id="title" name="title" bind:value={title} />

      <div class="editor" bind:this={editorContainer}></div>

      <p class="label" style="margin-top: 20px">Categories</p>
      <div class="categories">
        {#each categories as category}
          <span class="category">
            <i class="fa-solid fa-tag"></i>&nbsp;&nbsp;{category.name}
            <button
              type="button"
              class="remove"
              onclick={() => (categories = categories.filter((cat) => cat !== category))}
              aria-label="Remove category"
            >
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </span>
        {/each}
        <span class="add">
          <button
            type="button"
            class="secondary categories add"
            onclick={() => (addCategoriesDropdownOpen = !addCategoriesDropdownOpen)}
            disabled={categories.length === newsCategories.length}
            aria-label="Add category"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
          {#if addCategoriesDropdownOpen}
            <div class="add-category-dropdown" transition:slide={{ duration: 200 }}>
              {#each newsCategories as category}
                {#if !categories.find((cat) => cat.id === category.id)}
                  <button type="button" onclick={() => (categories = [...categories, category])}>
                    <i class="fa-solid fa-tag"></i>&nbsp;&nbsp;{category.name}
                  </button>
                {/if}
              {/each}
            </div>
          {/if}
        </span>
      </div>

      <p class="label" style="margin-top: 20px">Tags</p>
      <div class="tags">
        {#each tags as tag}
          <span class="tags" style="color: {tag.color}; background-color: {backgroundColor(tag.color)}">
            <i class="fa-solid fa-hashtag"></i>&nbsp;&nbsp;{tag.name}
            <button type="button" class="remove" onclick={() => (tags = tags.filter((t) => t !== tag))} aria-label="Remove tag">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </span>
        {/each}
        <span class="add">
          <button
            type="button"
            class="secondary tags add"
            onclick={() => (addTagsDropdownOpen = !addTagsDropdownOpen)}
            disabled={tags.length === newsTags.length}
            aria-label="Add tag"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
          {#if addTagsDropdownOpen}
            <div class="add-tags-dropdown" transition:slide={{ duration: 200 }}>
              {#each newsTags as tag}
                {#if !tags.find((t) => t.id === tag.id)}
                  <button type="button" onclick={() => (tags = [...tags, tag])} style="color: {tag.color}">
                    <i class="fa-solid fa-hashtag"></i>&nbsp;&nbsp;{tag.name}
                  </button>
                {/if}
              {/each}
            </div>
          {/if}
        </span>
      </div>
    </div>

    <div style="display: {mode === 'PREVIEW' ? 'block' : 'none'}">
      <NewsViewer
        {title}
        {content}
        author={selectedNews?.author ?? user}
        {categories}
        {tags}
        createdAt={selectedNews?.createdAt ?? new Date()}
        updatedAt={selectedNews?.updatedAt}
      />
    </div>

    <div class="actions">
      <button
        type="button"
        class="secondary"
        onclick={() => {
          mode = mode === 'EDIT' ? 'PREVIEW' : 'EDIT'
          content = editorView.state.doc.toString()
        }}
      >
        {mode === 'EDIT' ? 'Preview' : 'Edit'}
      </button>
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" disabled={title.trim() === ''}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  div.explorer {
    position: fixed;
    z-index: 10000;

    top: 30px;
    right: 30px;
    width: 20%;
    transition:
      opacity 0.3s,
      transform 0.3s;

    background-color: white;
    padding: 40px;
    border: 1px solid var(--border-color);
    border-radius: 10px;

    box-shadow: 0 5px 50px rgba(0, 0, 0, 0.5);
    margin: auto;

    h3 {
      margin-bottom: 30px;
    }

    div.list {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      position: relative;
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }

    p.nothing {
      text-align: center;
      margin-top: 20px;
      color: #606060;
      width: 100%;
    }

    div.img {
      width: calc(50% - 10px);
      aspect-ratio: 4 / 3;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 5px;
      position: relative;

      div {
        display: flex;
        gap: 5px;
        width: 100%;
        height: 100%;
        align-items: center;
        vertical-align: middle;
        justify-content: center;
        background: #dfdfdfa1;
        border-radius: 5px;
        transition: opacity 0.3s;
        opacity: 0;

        &:hover {
          opacity: 1;
        }
      }
    }

    button:not(:global(.secondary)) {
      display: inline-block;
      margin-top: 0;
      border-bottom: none;
      color: #1e1e1e;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 250px;
      vertical-align: bottom;
      font-family: 'Poppins';
      background: none;
      line-height: 15px;

      &:hover {
        background: #eeeeeeb7;
      }

      &.remove {
        display: inline-block;
        border-bottom: none;
        margin-left: 5px;
        position: relative;
        background: none;
        color: var(--red-color);
        vertical-align: middle;

        &:hover {
          background: #faeeeeb7;
        }
      }
    }
  }

  div.editor {
    height: calc(100vh - 177px - 66px - 27px - 30px - 20px - 69px - 184px);
    width: calc(750px - 2px);
    border: 1px solid var(--border-color2);
    margin-top: 20px;
    overflow-y: auto;
    overflow-x: auto;
    font-family: 'Courier New', Courier, monospace;
    border-radius: 5px;
  }

  button.right {
    opacity: 1;
  }

  span.category,
  span.tags {
    display: inline-block;
    margin-top: 0;
    margin-right: 5px;
    padding-left: 15px;
    border-radius: 5px;
    font-size: 12px;
    background-color: #f0f0f0;
    line-height: 15px;

    i {
      margin-right: 5px;
    }
  }

  button.remove {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;
    margin-left: 5px;
    color: var(--red-color);

    &:hover {
      background: #faeeee;
    }

    i {
      margin-right: 0;
    }
  }

  button.add {
    display: inline-block;
    margin-top: 0;
    position: relative;
  }

  div.categories,
  div.tags {
    max-width: 100%;
    overflow-y: visible;
  }

  span.add {
    position: relative;
  }

  div.add-category-dropdown,
  div.add-tags-dropdown {
    overflow-y: hidden;
    border-radius: 5px;
    transition:
      transform 0.3s ease,
      opacity 0.2s,
      height 0.2s ease,
      display 0s;
    background: white;
    padding: 10px;
    border: 1px solid var(--border-color);
    z-index: 100;
    position: absolute;
    width: 178px;
    top: 42px;
    left: 0;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    max-height: 110px;
    overflow-y: auto;

    button {
      width: 100%;
      position: relative;
      text-align: left;
      font-family: 'Poppins';
      background: none;
      line-height: 15px;

      &:nth-of-type(1) {
        margin-top: 0;
      }

      &:hover {
        background: #eeeeee;
      }
    }
  }
</style>
