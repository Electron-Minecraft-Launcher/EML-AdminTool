<script lang="ts">
  import type { NewsTag } from '@prisma/client'
  import AddEditNewsTagModal from '../modals/AddEditNewsTagModal.svelte'
  import { invalidateAll } from '$app/navigation'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'

  interface Props {
    newsTags: NewsTag[]
    selectedTagId: string | null
    showAddEditTagModal: boolean
  }

  let { newsTags, selectedTagId = $bindable(), showAddEditTagModal = $bindable() }: Props = $props()

  function backgroundColor(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  }

  async function deleteTag(tagId: string) {
    if (!tagId) return
    if (!confirm('Are you sure you want to delete the selected tag?')) return

    const formData = new FormData()
    formData.append('tag-id', tagId)

    await callAction({ url: '/dashboard/news', action: 'deleteTag', formData }, $l)
    invalidateAll()
  }
</script>

{#if showAddEditTagModal}
  <AddEditNewsTagModal bind:show={showAddEditTagModal} {newsTags} {selectedTagId} />
{/if}

<div class="tags">
  {#each newsTags as tag}
    <div class="category">
      <button
        class="no-link"
        onclick={() => {
          selectedTagId = tag.id
          showAddEditTagModal = true
        }}
        style="color: {tag.color}; background-color: {backgroundColor(tag.color)}"
      >
        <i class="fa-solid fa-hashtag"></i>&nbsp;&nbsp;{tag.name}
      </button>
      <button class="remove" onclick={() => deleteTag(tag.id)} aria-label="Delete tag"><i class="fa-solid fa-trash"></i></button>
    </div>
  {/each}
</div>

{#if newsTags.length === 0}
  <p class="nothing">No tag</p>
{/if}

<style lang="scss">
  div.tags {
    margin-top: 30px;
    display: flex;
    gap: 30px;
  }

  p.nothing {
    text-align: center;
    margin-top: 15px;
    color: #606060;
  }

  button {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    vertical-align: bottom;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;

    &:hover {
      background: #eeeeee;
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
        background: #faeeee;
      }
    }
  }
</style>
