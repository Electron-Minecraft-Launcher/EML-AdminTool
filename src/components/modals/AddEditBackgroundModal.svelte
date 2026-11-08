<script lang="ts">
  import { IBackgroundStatus } from '$lib/utils/db'
  import type { PageData } from '../../routes/(app)/dashboard/backgrounds/$types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import Toggle from '../layouts/Toggle.svelte'
  import { l } from '$lib/stores/language'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    show: boolean
    backgrounds: PageData['backgrounds']
    selectedBackgroundId: string | null
  }

  let { show = $bindable(), backgrounds, selectedBackgroundId }: Props = $props()

  let showLoader = $state(false)

  let selectedBackground = $state(backgrounds.find((b) => b.id === selectedBackgroundId) ?? null)
  let name = $state(selectedBackground?.name ?? '')
  let status = $state(selectedBackground?.status === IBackgroundStatus.ACTIVE)
  let disableStatus = $state(selectedBackground?.status === IBackgroundStatus.ACTIVE)
  let fileName = $state('')
  let file: File | null = $state(null)

  async function uploadFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = () => {
      const file_ = input.files?.[0]
      if (!file_) return

      file = file_
      fileName = file_.name
    }

    input.click()
  }

  function reset() {
    fileName = ''
    file = null
  }

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('background-id', selectedBackgroundId ?? '')
    formData.set('status', status ? IBackgroundStatus.ACTIVE : IBackgroundStatus.INACTIVE)
    formData.set('file', file ?? '')

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

  <form method="POST" action="?/addEditBackground" use:enhance={enhanceForm} enctype="multipart/form-data">
    <h2>{selectedBackgroundId ? 'Edit background name' : 'Upload a background'}</h2>

    <label for="name" style="margin-top: 0">Background name</label>
    <input type="text" id="name" name="name" bind:value={name} />

    {#if !selectedBackgroundId}
      <p class="label" style="margin-top: 20px">Background</p>
      {#if !file}
        <button class="secondary upload" onclick={uploadFile} type="button">
          <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select a file...
        </button>
      {:else}
        <p class="no-link">{fileName}</p>
        <button class="remove" onclick={reset} type="button" aria-label="Remove background file"><i class="fa-solid fa-circle-xmark"></i></button>
      {/if}
    {/if}

    <p class="label">Background status</p>
    <Toggle bind:status text={['Active', 'Inactive']} disabled={disableStatus} />

    <div class="actions">
      <button class="secondary" onclick={() => (show = false)} type="button">{$l.common.cancel}</button>
      <button class="primary" disabled={!name || name == '' || (!file && !selectedBackgroundId)}>{$l.common.save}</button>
    </div>

    <input type="file" id="background" accept="image/*" style="display: none" />
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  button.secondary.upload {
    margin-top: 0;
  }

  p.no-link {
    margin: 0px;
    display: inline-block;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    padding: 8px 0 7px 0;
  }

  button.remove {
    display: inline-block;
    border-bottom: none;
    margin-left: 5px;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    background: none;
    color: var(--red-color);
    vertical-align: middle;

    &:hover {
      background: var(--danger-surface-color);
    }
  }
</style>
