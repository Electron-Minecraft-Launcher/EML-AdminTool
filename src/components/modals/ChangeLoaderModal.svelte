<script lang="ts">
  import { ILoaderType, type LoaderType, type Loader } from '$lib/utils/db'
  import type { LoaderVersion } from '$lib/utils/types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { l } from '$lib/stores/language'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { NotificationCode } from '$lib/utils/notifications'
  import { addNotification } from '$lib/stores/notifications'

  interface Props {
    show: boolean
    loader: Loader
    fabricLoaderVersions: string[]
    quiltLoaderVersions: string[]
    loaderList: { [key: string]: LoaderVersion[] }
  }

  let { show = $bindable(), loader, fabricLoaderVersions, quiltLoaderVersions, loaderList }: Props = $props()

  const latestInfo = 'Choosing this version will always force the Launcher to download the latest release.'

  let showLoader = $state(false)

  let jsonLabel = $state('')
  let jsonFile: File | null = $state(null)
  let jarLabel = $state('')
  let jarFile: File | null = $state(null)

  let type: LoaderType = $state(loader.type ?? ILoaderType.VANILLA)
  let majorVersion = $state(
    loader.minecraftVersion?.includes('latest') ? 'Latest' : (loader.minecraftVersion?.split('.').slice(0, 2).join('.') ?? '')
  )
  let minecraftVersion = $state(loader.minecraftVersion ?? '')
  let loaderVersion = $state(loader.loaderVersion ?? '')

  let minecraftVersions = $derived([...new Set(loaderList[type]?.map((version) => version.majorVersion))])
  let visibleVersions = $derived(loaderList[type]?.filter((l) => l.majorVersion === majorVersion) || [])

  let isFormValid = $derived.by(() => {
    return minecraftVersion && loaderVersion && type
  })
  let tempFabricLoaderVersion: string = $state(
    loader.type === ILoaderType.FABRIC && loader.loaderVersion ? loader.loaderVersion : (fabricLoaderVersions[0] ?? '')
  )
  let tempQuiltLoaderVersion: string = $state(
    loader.type === ILoaderType.QUILT && loader.loaderVersion ? loader.loaderVersion : (quiltLoaderVersions[0] ?? '')
  )

  function switchType(newType: LoaderType) {
    type = newType
    minecraftVersion = minecraftVersions[0]
    loaderVersion = ''
  }

  function switchMinecraftVersion(newVersion: string) {
    majorVersion = newVersion
    loaderVersion = ''
  }

  function setVersion(selectedType: LoaderType, selectedVersion: LoaderVersion) {
    type = selectedType
    minecraftVersion = selectedVersion.minecraftVersion
    loaderVersion =
      type === ILoaderType.FABRIC ? tempFabricLoaderVersion : type === ILoaderType.QUILT ? tempQuiltLoaderVersion : selectedVersion.loaderVersion
  }

  function isActive(selectedVersion: LoaderVersion) {
    if (type === ILoaderType.FABRIC) {
      return selectedVersion.minecraftVersion === minecraftVersion && loaderVersion === tempFabricLoaderVersion
    }
    if (type === ILoaderType.QUILT) {
      return selectedVersion.minecraftVersion === minecraftVersion && loaderVersion === tempQuiltLoaderVersion
    }
    return selectedVersion.loaderVersion === loaderVersion
  }

  function formatVersionName(version: LoaderVersion): string {
    const mcVer = version.minecraftVersion
    if (type === ILoaderType.FORGE) {
      const forgeVer = version.loaderVersion.split('-').slice(1).join('-')
      return `Minecraft ${mcVer} (Forge ${forgeVer})`
    }
    if (type === ILoaderType.NEOFORGE) {
      const neoForgeVer = version.loaderVersion
      return `Minecraft ${mcVer} (NeoForge ${neoForgeVer})`
    }
    if (type === ILoaderType.FABRIC) {
      return `Minecraft ${mcVer} (Fabric ${tempFabricLoaderVersion})`
    }
    if (type === ILoaderType.QUILT) {
      return `Minecraft ${mcVer} (Quilt ${tempQuiltLoaderVersion})`
    }
    if (version.loaderVersion === 'latest_release') return 'Latest Minecraft release'
    if (version.loaderVersion === 'latest_snapshot') return 'Latest Minecraft snapshot'
    return `Minecraft ${version.loaderVersion}`
  }

  function getGroupedVersions(type: LoaderType, versions: LoaderVersion[]) {
    const groups: { label: string; versions: LoaderVersion[] }[] = []

    if (type === ILoaderType.VANILLA || type === ILoaderType.FABRIC || type === ILoaderType.QUILT) {
      const releases = versions.filter((v) => v.type.includes('release'))
      if (releases.length) groups.push({ label: 'Releases', versions: releases })

      const snapshots = versions.filter((v) => v.type.includes('snapshot'))
      if (snapshots.length) groups.push({ label: 'Snapshots', versions: snapshots })
    } else if (type === ILoaderType.FORGE) {
      const recommended = versions.filter((v) => v.type.includes('recommended'))
      if (recommended.length) groups.push({ label: 'Recommended', versions: recommended })

      const latest = versions.filter((v) => v.type.includes('latest'))
      if (latest.length) groups.push({ label: 'Latest', versions: latest })

      if (versions.length) groups.push({ label: 'All versions', versions })
    } else if (type === ILoaderType.NEOFORGE) {
      const stable = versions.filter((v) => !v.type.includes('beta') && !v.type.includes('alpha'))
      if (stable.length) groups.push({ label: 'Stable', versions: stable })

      const ba = versions.filter((v) => v.type.includes('beta') || v.type.includes('alpha'))
      if (ba.length) groups.push({ label: 'Beta & Alpha', versions: ba })
    }

    return groups
  }

  function isOldFabricVersion(version: string) {
    const [maj, min, pat] = version.split('.').map((v) => parseInt(v))
    return maj <= 0 && min < 15
  }

  function formatH4Title(type: LoaderType, majorVersion: string) {
    if (type === ILoaderType.FORGE) {
      return `Minecraft Forge ${majorVersion === 'Latest' || majorVersion === 'Snapshots' ? majorVersion : `${majorVersion}.x`}`
    }
    if (type === ILoaderType.FABRIC) {
      return `Minecraft Fabric ${majorVersion === 'Latest' || majorVersion === 'Snapshots' ? majorVersion : `${majorVersion}.x`}`
    }
    if (type === ILoaderType.NEOFORGE) {
      return `Minecraft NeoForge ${majorVersion === 'Latest' || majorVersion === 'Snapshots' ? majorVersion : `${majorVersion}.x`}`
    }
    return `Minecraft Vanilla ${majorVersion === 'Latest' || majorVersion === 'Snapshots' ? majorVersion : `${majorVersion}.x`}`
  }

  async function uploadFile(fileType: 'json' | 'jar') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'json' ? '.json' : '.jar'
    input.multiple = false

    input.onchange = () => {
      const files = input.files ? [input.files[0]] : []
      if (files.length === 0) return

      const label = files[0].name

      switch (fileType) {
        case 'json':
          jsonFile = files[0]
          jsonLabel = label
          break
        case 'jar':
          jarFile = files[0]
          jarLabel = label
          break
        default:
          console.warn('Unknown file:', fileType)
      }
    }

    input.click()
  }

  function reset(fileType: 'json' | 'jar') {
    if (fileType === 'json') {
      jsonFile = null
      jsonLabel = ''
    }
    if (fileType === 'jar') {
      jarFile = null
      jarLabel = ''
    }
  }

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('type', type)
    formData.set('minecraft-version', minecraftVersion)
    formData.set('loader-version', loaderVersion)

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

  $effect(() => {
    if (!minecraftVersions.includes(majorVersion)) {
      majorVersion = minecraftVersions[0]
    }
  })
</script>

<ModalTemplate size={'ml'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/changeLoader" use:enhance={enhanceForm}>
    <h2>Change loader</h2>

    <div class="list-container">
      <div class="list loader-list">
        <p class="label sticky-header">Loaders</p>
        <button class="list" type="button" class:active={type === ILoaderType.VANILLA} onclick={() => switchType(ILoaderType.VANILLA)}>
          Vanilla
        </button>
        <button class="list" type="button" class:active={type === ILoaderType.FORGE} onclick={() => switchType(ILoaderType.FORGE)}>Forge</button>
        <button class="list" type="button" class:active={type === ILoaderType.NEOFORGE} onclick={() => switchType(ILoaderType.NEOFORGE)}>
          NeoForge
        </button>
        <button class="list" type="button" class:active={type === ILoaderType.FABRIC} onclick={() => switchType(ILoaderType.FABRIC)}>Fabric</button>
        <button class="list" type="button" class:active={type === ILoaderType.QUILT} onclick={() => switchType(ILoaderType.QUILT)}>Quilt</button>
        <button class="list" type="button" class:active={type === ILoaderType.CUSTOM} onclick={() => switchType(ILoaderType.CUSTOM)}>Custom</button>
      </div>

      {#if type !== ILoaderType.CUSTOM}
        <div class="list version-list">
          {#if type === ILoaderType.FABRIC}
            <label for="loader-version" class="sticky-header" style="z-index: 100">Loader version</label>
            <select name="loader-version" id="loader-version" class="loader-list-select" bind:value={tempFabricLoaderVersion}>
              {#each fabricLoaderVersions as version}
                <option
                  value={version}
                  title={isOldFabricVersion(version) ? 'Old Fabric Loader version may not support recent Minecraft versions.' : ''}
                  class:old={isOldFabricVersion(version)}>{version}</option
                >
              {/each}
            </select>
          {:else if type === ILoaderType.QUILT}
            <label for="loader-version" class="sticky-header" style="z-index: 100">Loader version</label>
            <select name="loader-version" id="loader-version" class="loader-list-select" bind:value={tempQuiltLoaderVersion}>
              {#each quiltLoaderVersions as version}
                <option value={version}>{version}</option>
              {/each}
            </select>
          {/if}
          <p class="label sticky-header" style="z-index: 100">Minecraft versions</p>
          {#each minecraftVersions as version}
            <button class="list" type="button" class:active={majorVersion === version} onclick={() => switchMinecraftVersion(version)}>
              {version}
            </button>
          {/each}
        </div>

        <div class="list content-list">
          <h4>{formatH4Title(type, majorVersion)}</h4>

          {#each getGroupedVersions(type, visibleVersions) as group}
            <p class="label">{group.label}</p>
            {#each group.versions as version}
              <button type="button" class:active={isActive(version)} onclick={() => setVersion(type, version)}>
                {formatVersionName(version)}
                {#if version.loaderVersion === 'latest_release' || version.loaderVersion === 'latest_snapshot'}
                  &nbsp;&nbsp;<i class="fa-solid fa-circle-question" title={latestInfo} style="cursor: help"></i>
                {/if}
              </button>
            {:else}
              <p class="no-link">-</p>
            {/each}
          {:else}
            <p class="no-link">-</p>
          {/each}
        </div>
      {:else}
        <div class="list content-list">
          <h4>Custom Loader</h4>
          <p class="desc">You can upload your own version of Minecraft here (modified with MCP, for example).</p>
          <ol style="margin-top: 5px; color: #505050; margin-bottom: 5px; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li>
              Upload your custom <code>&lt;version&gt;.json</code> file, with the same format as Vanilla or Forge Minecraft's
              <code>&lt;version&gt;.json</code>
              (example
              <a
                href="https://piston-meta.mojang.com/v1/packages/30bb79802dcf36de95322ef6a055960c88131d2b/1.21.11.json"
                target="_blank"
                rel="noopener noreferrer">here</a
              >).
            </li>
            <li>Upload your modified <code>&lt;version&gt;.jar</code>.</li>
            <li>
              If needed, you can also upload other files required by you custom version via the Files Updater interface. Ensure de strictly following
              the required format of your <code>&lt;version&gt;.json</code> file. You may need to create a <code>libraries/</code>,
              <code>assets/</code>, or other folders as specified in your JSON file.
            </li>
          </ol>

          <p class="label" style="margin-top: 20px"><i class="fa-solid fa-bars-staggered"></i>&nbsp;&nbsp;version.json</p>
          {#if !jsonFile}
            <button type="button" class="secondary upload" onclick={() => uploadFile('json')}>
              <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select file...
            </button>
          {:else}
            <p class="no-link">{jsonLabel}</p>
            <button type="button" class="remove" onclick={() => reset('json')} aria-label="Remove version.json">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          {/if}

          <p class="label" style="margin-top: 20px"><i class="fa-brands fa-java"></i>&nbsp;&nbsp;version.jar</p>
          {#if !jarFile}
            <button type="button" class="secondary upload" onclick={() => uploadFile('jar')}>
              <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select file...
            </button>
          {:else}
            <p class="no-link">{jarLabel}</p>
            <button type="button" class="remove" onclick={() => reset('jar')} aria-label="Remove version.jar">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" disabled={!isFormValid}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';
  @use '../../../static/scss/list.scss';

  p.sticky-header,
  label.sticky-header {
    margin-top: 0;
    position: sticky;
    top: 0;
    background: white;
  }

  div.list {
    min-height: calc(100vh - 175px - 30px - 35px - 71px) !important;
    max-height: calc(100vh - 175px - 30px - 35px - 71px) !important;
    overflow-y: auto;

    &.loader-list {
      flex: unset !important;
      width: 140px !important;
    }

    &.version-list {
      flex: 0.35 !important;

      select.loader-list-select {
        display: block;
        width: 100%;
        margin-bottom: 20px;

        option.old {
          color: #912020;
        }
      }
    }

    &.content-list {
      flex: 1 !important;

      h4 {
        margin-top: 0;
        position: sticky;
        top: 0;
        background: white;
        z-index: 100;
      }
    }

    button:not(.remove):not(.upload) {
      display: block;
      border-bottom: none;
      color: #1e1e1e;
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-family: 'Poppins';
      background: none;
      width: 100% !important;
      line-height: 15px;
      text-align: left;

      i {
        color: #1e1e1e;
      }

      &.active {
        background: #f5f5f5;
      }

      &:hover {
        background: #eeeeee;
      }
    }
  }

  code {
    background: #f4f4f4;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 13px;
  }

  button.secondary.upload {
    margin-top: 0;
  }
</style>
