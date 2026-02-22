<script lang="ts">
  import type { NewsCategory } from '@prisma/client'
  import AddEditNewsCategoryModal from '../modals/AddEditNewsCategoryModal.svelte'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'
  import { invalidateAll } from '$app/navigation'

  interface Props {
    newsCategories: NewsCategory[]
    selectedCategoryId: string | null
    showAddEditCategoryModal: boolean
  }

  let { newsCategories, selectedCategoryId = $bindable(), showAddEditCategoryModal = $bindable() }: Props = $props()

  async function deleteCategory(categoryId: string) {
    if (!categoryId) return
    if (!confirm('Are you sure you want to delete the selected category?')) return

    const formData = new FormData()
    formData.append('category-id', categoryId)

    await callAction({ url: '/dashboard/news', action: 'deleteCategory', formData }, $l)
    invalidateAll()
  }
</script>

{#if showAddEditCategoryModal}
  <AddEditNewsCategoryModal bind:show={showAddEditCategoryModal} {newsCategories} {selectedCategoryId} />
{/if}

<div class="categories">
  {#each newsCategories as category}
    <div class="category">
      <button
        class="no-link"
        title="{category.name} (created on {category.createdAt.shortFormatDate()})"
        onclick={() => {
          selectedCategoryId = category.id
          showAddEditCategoryModal = true
        }}
      >
        <i class="fa-solid fa-tag"></i>&nbsp;&nbsp;{category.name} <span class="date">(created on {category.createdAt.shortFormatDate()})</span>
      </button>
      <button class="remove" onclick={() => deleteCategory(category.id)} aria-label="Delete category"><i class="fa-solid fa-trash"></i></button>
    </div>
  {/each}
</div>

{#if newsCategories.length === 0}
  <p class="nothing">No category</p>
{/if}

<style lang="scss">
  div.categories {
    margin-top: 30px;
    display: flex;
    gap: 30px;
  }

  div.category {
    display: flex;
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
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 230px;
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
        position: relative;
        background: none;
        color: var(--red-color);
        vertical-align: middle;

        &:hover {
          background: #faeeee;
        }
      }
    }

  span.date {
    color: #909090;
  }
</style>
