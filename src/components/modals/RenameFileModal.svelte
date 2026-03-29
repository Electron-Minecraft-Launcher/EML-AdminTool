<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import type { File as File_ } from '$lib/utils/types'
  import type { SubmitFunction } from '@sveltejs/kit'
  import ModalTemplate from './__ModalTemplate.svelte'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { NotificationCode } from '$lib/utils/notifications'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import { onMount } from 'svelte'
  import type { Profile } from '@prisma/client'

  interface Props {
    show: boolean
    files: File_[]
    selectedItems: File_[]
    selectedProfile: Profile
  }

  let { show = $bindable(), files = $bindable(), selectedItems = $bindable(), selectedProfile }: Props = $props()

  let showLoader = $state(false)
  let path = $state(selectedItems[0].path)
  let name = $state(selectedItems[0].name)
  let newName = $state(selectedItems[0].name)
  let type = $state(selectedItems[0].type)
  let newNameInput: HTMLInputElement | undefined = $state()

  onMount(() => {
    if (selectedItems.length !== 1) show = false
    newNameInput?.focus()
  })

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('path', path)
    formData.set('name', name)
    formData.set('profile-id', selectedProfile.id)

    return async ({ result }) => {
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

<ModalTemplate size={'s'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/renameFile" use:enhance={enhanceForm}>
    <h2>Rename {type === 'FOLDER' ? 'folder' : 'file'}</h2>

    <label for="new-name">Files Updater/{path}</label>
    <input type="text" id="new-name" name="new-name" bind:value={newName} bind:this={newNameInput} />

    <div class="actions">
      <button class="secondary" onclick={() => (show = false)} type="button">{$l.common.cancel}</button>
      <button class="primary" disabled={newName.replaceAll(' ', '').replaceAll('.', '') === ''}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  p.label {
    margin-top: 15px;
  }
</style>
