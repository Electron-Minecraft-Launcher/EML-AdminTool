<script lang="ts">
  import type { File as File_ } from '$lib/utils/types'
  import type { SubmitFunction } from '@sveltejs/kit'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { NotificationCode } from '$lib/utils/notifications'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import { applyAction, enhance } from '$app/forms'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { onMount } from 'svelte'
  import { readableFiles } from '$lib/utils/files'
  import type { Profile } from '@prisma/client'

  interface Props {
    show: boolean
    showEditFileModal: boolean
    files: File_[]
    currentPath: string
    selectedProfile: Profile
    type: 'FOLDER' | 'FILE'
    fileToEdit?: File_
  }

  let {
    show = $bindable(),
    showEditFileModal = $bindable(),
    files = $bindable(),
    currentPath,
    selectedProfile,
    type,
    fileToEdit = $bindable(undefined)
  }: Props = $props()

  let showLoader = $state(false)
  let name: string = $state('')
  let newFileInput: HTMLInputElement | undefined = $state()

  onMount(() => {
    newFileInput?.focus()
  })

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('profile-id', selectedProfile.id)
    name = name.removeUnwantedFilenameChars()
    if (type === 'FOLDER') {
      formData.set('path', `${currentPath}${name}`)
    } else {
      formData.set('path', currentPath)
      formData.set('name', name)
    }

    return async ({ result }) => {
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        files = result.data?.files as File_[]
        if (type === 'FILE') {
          const ext = name.split('.').pop() ?? ''
          if (readableFiles.includes(ext)) {
            fileToEdit = files.find((file) => file.name === name && file.path === currentPath)
            showEditFileModal = true
          } else {
            fileToEdit = undefined
          }
        }
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

  <form method="POST" action="?/createFile" use:enhance={enhanceForm}>
    <h2>New {type === 'FOLDER' ? 'folder' : 'file'}</h2>

    <label for="name">Files Updater/{currentPath}</label>
    <input type="text" id="name" bind:value={name} bind:this={newFileInput} />

    <div class="actions">
      <button class="secondary" onclick={() => (show = false)} type="button">{$l.common.cancel}</button>
      <button class="primary" disabled={name.replaceAll(' ', '').replaceAll('.', '') === ''}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  p.label {
    margin-top: 15px;
  }
</style>
