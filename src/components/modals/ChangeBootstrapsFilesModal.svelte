<script lang="ts">
  import { l } from '$lib/stores/language'
  import ModalTemplate from './__ModalTemplate.svelte'
  import getEnv from '$lib/utils/env'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import { NotificationCode } from '$lib/utils/notifications'
  import semver from 'semver'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import type { PageData } from '../../routes/(app)/dashboard/bootstraps/$types'
  import { smartUpload } from '$lib/utils/uploader'
  import { invalidateAll } from '$app/navigation'
  import { extractVersionFromYaml } from '$lib/utils/utils'

  interface Props {
    show: boolean
    bootstraps: PageData['bootstraps']
  }

  let { show = $bindable(), bootstraps }: Props = $props()

  const env = getEnv()

  let showLoader = $state(false)

  let winLabel = $state('')
  let macLabel = $state('')
  let linLabel = $state('')
  let winFiles: File[] = $state([])
  let macFiles: File[] = $state([])
  let linFiles: File[] = $state([])

  let disabled: boolean = $derived(winFiles.length === 0 && macFiles.length === 0 && linFiles.length === 0)

  const accept = {
    win: '.exe,.msi,.yml,.blockmap',
    mac: '.dmg,.zip,.yml,.blockmap',
    lin: '.AppImage,.yml,.blockmap'
  }

  async function uploadFile(platform: 'win' | 'mac' | 'lin') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept[platform]
    input.multiple = true

    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length === 0) return

      const label = files.map((f) => f.name).join(', ')

      switch (platform) {
        case 'win':
          winFiles = files
          winLabel = label
          break
        case 'mac':
          macFiles = files
          macLabel = label
          break
        case 'lin':
          linFiles = files
          linLabel = label
          break
        default:
          console.warn('Unknown platform:', platform)
      }
    }

    input.click()
  }

  function reset(platform: 'win' | 'mac' | 'lin') {
    if (platform === 'win') {
      winFiles = []
      winLabel = ''
    }
    if (platform === 'mac') {
      macFiles = []
      macLabel = ''
    }
    if (platform === 'lin') {
      linFiles = []
      linLabel = ''
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    showLoader = true

    const metadata: Record<string, any> = {}
    let maxVersion = bootstraps?.version ?? '0.0.0'

    // 1. Validation locale avant upload
    const validatePlatform = async (files: File[], platform: string, yamlName: string) => {
      if (files.length === 0) return true

      const yamlFile = files.find((f) => f.name === yamlName)
      if (!yamlFile) {
        addNotification('ERROR', `Missing ${yamlName} for ${platform}`)
        return false
      }

      const content = await yamlFile.text()
      const version = extractVersionFromYaml(content)

      if (!version || !semver.valid(version)) {
        addNotification('ERROR', `Invalid version in ${yamlName}`)
        return false
      }

      if (semver.gt(version, maxVersion)) maxVersion = version

      const mainFile = files.find((f) => f.name.endsWith('.exe') || f.name.endsWith('.dmg') || f.name.endsWith('.AppImage'))

      metadata[platform] = {
        mainFileName: mainFile?.name ?? files[0].name,
        keepFiles: files.map((f) => f.name)
      }

      return true
    }

    const isValid =
      (await validatePlatform(winFiles, 'win', 'latest.yml')) &&
      (await validatePlatform(macFiles, 'mac', 'latest-mac.yml')) &&
      (await validatePlatform(linFiles, 'lin', 'latest-linux.yml'))

    if (!isValid) {
      showLoader = false
      return
    }

    let uploadSuccess = true
    const processUpload = async (files: File[], osName: string) => {
      if (files.length === 0 || !uploadSuccess) return
      uploadSuccess = await smartUpload(files, {
        context: 'bootstraps',
        mode: 'ALL_OR_NOTHING',
        currentPath: osName,
        onError: (fileName, message) => addNotification('ERROR', `Error on ${fileName}: ${message}`)
      })
    }

    await processUpload(winFiles, 'win')
    await processUpload(macFiles, 'mac')
    await processUpload(linFiles, 'lin')

    if (uploadSuccess) {
      const formData = new FormData()
      formData.set('version', maxVersion)
      formData.set('metadata', JSON.stringify(metadata))

      const res = await fetch('?/finalizeBootstraps', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (result.type === 'success') {
        await invalidateAll()
        show = false
      } else {
        addNotification('ERROR', 'Failed to update database')
      }
    }

    showLoader = false
  }
</script>

<ModalTemplate size={'ms'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form onsubmit={handleSubmit}>
    <h2>Change bootstraps</h2>

    <p class="desc">You <b>must</b> upload 3 files files for each platform for which you want to update the bootstrap:</p>
    <ul style="margin-top: 5px; color: #505050; margin-bottom: 5px; padding-left: 20px; font-size: 14px; line-height: 1.6;">
      <li>The installer file (.exe, .dmg, .AppImage)</li>
      <li>The YAML file (latest.yml, latest-mac.yml, latest-linux.yml)</li>
      <li>The blockmap file (.blockmap)</li>
    </ul>
    <p class="desc" style="margin-bottom: 15px; margin-top: 5px;">You must keep the name generated by electron-builder for each file.</p>

    <p class="label" style="margin-top: 20px"><i class="fa-brands fa-microsoft"></i>&nbsp;&nbsp;Windows</p>
    {#if winFiles.length === 0}
      <button type="button" class="secondary upload" onclick={() => uploadFile('win')}>
        <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select files...
      </button>
    {:else}
      <p class="no-link">{winLabel}</p>
      <button type="button" class="remove" onclick={() => reset('win')} aria-label="Remove Windows Bootstrap">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    {/if}

    <p class="label"><i class="fa-brands fa-apple"></i>&nbsp;&nbsp;macOS</p>
    {#if macFiles.length === 0}
      <button type="button" class="secondary upload" onclick={() => uploadFile('mac')}>
        <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select files...
      </button>
    {:else}
      <p class="no-link">{macLabel}</p>
      <button type="button" class="remove" onclick={() => reset('mac')} aria-label="Remove macOS Bootstrap">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    {/if}

    <p class="label"><i class="fa-brands fa-linux"></i>&nbsp;&nbsp;Linux</p>
    {#if linFiles.length === 0}
      <button type="button" class="secondary upload" onclick={() => uploadFile('lin')}>
        <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select files...
      </button>
    {:else}
      <p class="no-link">{linLabel}</p>
      <button type="button" class="remove" onclick={() => reset('lin')} aria-label="Remove Linux Bootstrap">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    {/if}

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" {disabled}>{$l.common.save}</button>
    </div>
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
      background: #faeeee;
    }
  }
</style>
