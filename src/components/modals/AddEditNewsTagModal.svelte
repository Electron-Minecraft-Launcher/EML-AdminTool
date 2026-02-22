<script lang="ts">
  import type { NewsTag } from '@prisma/client'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { l } from '$lib/stores/language'
  import { applyAction, enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    show: boolean
    newsTags: NewsTag[]
    selectedTagId: string | null
  }

  let { show = $bindable(), newsTags, selectedTagId }: Props = $props()

  let showLoader = $state(false)

  let selectedTag = $state(newsTags.find((t) => t.id === selectedTagId) ?? null)
  let name = $state(selectedTag?.name ?? '')
  let color = $state(selectedTag?.color ?? '')

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('tag-id', selectedTagId ?? '')

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

  <form method="POST" action="?/addEditTag" use:enhance={enhanceForm}>
    <h2>{selectedTagId ? 'Edit tag' : 'Create a tag'}</h2>

    <label for="name">Tag name</label>
    <input type="text" id="name" name="name" bind:value={name} />

    <label for="color">
      Color&nbsp;&nbsp;<i class="fa-solid fa-question-circle" style="cursor: help" title="You should use a dark color to make it readable."></i>
    </label>
    <input type="color" id="color" name="color" bind:value={color} />

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" disabled={name.trim().replaceAll('.', '') === ''}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  input[type='color'] {
    width: 100%;
    height: 40px;
    padding: 7px 10px;
  }
</style>
