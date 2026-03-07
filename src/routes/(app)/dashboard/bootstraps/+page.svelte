<script lang="ts">
  import getEnv from '$lib/utils/env'
  import type { File as File_ } from '$lib/utils/types'
  import type { PageProps } from './$types'
  import ChangeBootstrapsFilesModal from '../../../../components/modals/ChangeBootstrapsFilesModal.svelte'
  import LoadingSplash from '../../../../components/layouts/LoadingSplash.svelte'
  import { l } from '$lib/stores/language'
  import { callAction } from '$lib/utils/call'
  import { invalidateAll } from '$app/navigation'
  import { addNotification } from '$lib/stores/notifications'

  let { data }: PageProps = $props()

  const env = getEnv()

  let showLoader = $state(false)
  let showChangeBootstrapFileModal: boolean = $state(false)

  async function download(file: File_) {
    try {
      const response = await fetch(file.url)
      if (!response.ok) throw new Error(response.statusText)

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = file.name
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Failed to download file:', err)
      addNotification('ERROR', $l.notifications.INTERNAL_SERVER_ERROR)
    }
  }

  async function deleteBootstrap(platform: 'win' | 'mac' | 'lin') {
    const loaderPlatformName = { win: 'Windows', mac: 'macOS', lin: 'Linux' }[platform]
    if (!confirm(`Are you sure you want to delete ${loaderPlatformName} Bootstrap?`)) return

    showLoader = true
    const formData = new FormData()
    formData.append('platform', platform)

    await callAction({ url: '/dashboard/bootstraps', action: 'deleteBootstrap', formData }, $l)
    invalidateAll()
    showLoader = false
  }
</script>

<svelte:head>
  <title>Bootstraps • {env.name} AdminTool</title>
</svelte:head>

{#if showChangeBootstrapFileModal}
  <ChangeBootstrapsFilesModal bind:show={showChangeBootstrapFileModal} bootstraps={data.bootstraps} />
{/if}

<h2>Bootstraps</h2>

<section class="section" style="position: relative;">
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}
  <button class="secondary right" onclick={() => (showChangeBootstrapFileModal = true)} aria-label="Change Bootstrap Files">
    <i class="fa-solid fa-ellipsis"></i>
  </button>

  <h3>Bootstraps and Launcher version</h3>

  <div class="container">
    <div style="width: 100%">
      <p class="label">Version</p>
      <p class="no-link">{data.bootstraps.version ?? '-'}</p>
    </div>

    <div class="files-container">
      <p class="label"><i class="fa-brands fa-microsoft"></i>&nbsp;&nbsp;Windows Bootstrap</p>
      <div class="buttons">
        {#if data.bootstraps.winFiles && data.bootstraps.winFiles.length > 0}
          <div class="file-list">
            {#each data.bootstraps.winFiles as file}
              <button onclick={() => download(file)} title={file.name}>
                <i class="fa-solid fa-cloud-arrow-down"></i>&nbsp;&nbsp;{file.name}
              </button>
            {/each}
          </div>
          <button class="remove" onclick={() => deleteBootstrap('win')} aria-label="Delete All Windows Files">
            <i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete all
          </button>
        {:else}
          <p class="no-link">-</p>
        {/if}
      </div>
    </div>

    <div class="files-container">
      <p class="label"><i class="fa-brands fa-apple"></i>&nbsp;&nbsp;macOS Bootstrap</p>
      <div class="buttons">
        {#if data.bootstraps.macFiles && data.bootstraps.macFiles.length > 0}
          <div class="file-list">
            {#each data.bootstraps.macFiles as file}
              <button onclick={() => download(file)} title={file.name}>
                <i class="fa-solid fa-cloud-arrow-down"></i>&nbsp;&nbsp;{file.name}
              </button>
            {/each}
          </div>
          <button class="remove" onclick={() => deleteBootstrap('mac')} aria-label="Delete All macOS Files">
            <i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete all
          </button>
        {:else}
          <p class="no-link">-</p>
        {/if}
      </div>
    </div>

    <div class="files-container">
      <p class="label"><i class="fa-brands fa-linux"></i>&nbsp;&nbsp;Linux Bootstrap</p>
      <div class="buttons">
        {#if data.bootstraps.linFiles && data.bootstraps.linFiles.length > 0}
          <div class="file-list">
            {#each data.bootstraps.linFiles as file}
              <button onclick={() => download(file)} title={file.name}>
                <i class="fa-solid fa-cloud-arrow-down"></i>&nbsp;&nbsp;{file.name}
              </button>
            {/each}
          </div>
          <button class="remove" onclick={() => deleteBootstrap('lin')} aria-label="Delete All Linux Files">
            <i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete all
          </button>
        {:else}
          <p class="no-link">-</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  div.container {
    div.files-container {
      width: auto !important;
      flex: 1;
    }

    div.file-list {
      display: flex;
      flex-direction: column;
      width: auto;
      gap: 5px;
    }

    div.buttons {
      width: 100%;
      gap: 0;
    }

    button {
      text-align: left;
      display: inline-block;
      margin-top: 0;
      border-bottom: none;
      color: #1e1e1e;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 100%;
      vertical-align: bottom;
      font-family: 'Poppins';
      background: none;
      line-height: 15px;

      &:hover {
        background: #eeeeee;
      }

      &.remove {
        border-bottom: none;
        position: relative;
        background: none;
        color: var(--red-color);
        vertical-align: middle;
        align-self: flex-start;
        text-overflow: clip;
        width: 100%;

        &:hover {
          background: #faeeee;
        }
      }
    }
  }
</style>
