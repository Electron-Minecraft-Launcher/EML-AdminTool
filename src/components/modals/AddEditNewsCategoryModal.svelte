<script lang="ts">
  import type { NewsCategory } from '@prisma/client'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { l } from '$lib/stores/language'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    show: boolean
    newsCategories: NewsCategory[]
    selectedCategoryId: string | null
  }

  let { show = $bindable(), newsCategories, selectedCategoryId }: Props = $props()

  let showLoader = $state(false)

  let selectedCategory = $state(newsCategories.find((c) => c.id === selectedCategoryId) ?? null)
  let name = $state(selectedCategory?.name ?? '')

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('category-id', selectedCategoryId ?? '')

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

<ModalTemplate size={'s'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}
  
  <form method="POST" action="?/addEditCategory" use:enhance={enhanceForm}>
    <h2>{selectedCategoryId ? 'Edit category' : 'Create a category'}</h2>

    <label for="name">Category name</label>
    <input type="text" id="name" name="name" bind:value={name} />

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" disabled={name.trim().replaceAll('.', '') === ''}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';
</style>
