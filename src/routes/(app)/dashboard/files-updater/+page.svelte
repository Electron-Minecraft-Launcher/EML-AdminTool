<script lang="ts">
  import { onMount } from 'svelte'
  import type { PageProps } from './$types'
  import getEnv from '$lib/utils/env'
  import FilesUpdater from '../../../../components/contents/FilesUpdater.svelte'
  import type { File as File_ } from '$lib/utils/types'
  import ChangeLoaderModal from '../../../../components/modals/ChangeLoaderModal.svelte'
  import getUser from '$lib/utils/user'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import { ILoaderFormat, ILoaderType } from '$lib/utils/db'
  import type { Loader } from '@prisma/client'
  import { invalidateAll } from '$app/navigation'
  import { smartUpload } from '$lib/utils/uploader'

  let { data }: PageProps = $props()

  const env = getEnv()
  const user = getUser()

  let files = $state(data.files)

  let filesReady = $state(true)
  let isDragOver = $state(false)
  let path: HTMLSpanElement | undefined = $state()
  let oldPath = $state('')
  let currentPath = $state('')

  let showChangeLoaderModal = $state(false)

  let currentPathSplit = $derived(currentPath.split('/'))

  let sL = $state(false)
  let sR = $state(false)

  onMount(() => {
    oldPath = path!.innerHTML

    path!.addEventListener('scroll', () => {
      sL = path!.scrollLeft > 0
      sR = path!.scrollLeft < path!.scrollWidth - path!.clientWidth - 1
    })
  })

  function handleLeave(e: any) {
    e.preventDefault()
    if (!e.currentTarget!.contains(e.relatedTarget)) {
      isDragOver = false
    }
  }

  async function getData() {
    filesReady = false
    await invalidateAll()
    filesReady = true
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault()
    isDragOver = false

    if (!e.dataTransfer || e.dataTransfer.items.length === 0) return
    filesReady = false

    const items = await getAllEntries(e.dataTransfer.items)
    let entries: File[] = []

    for (const item of items) {
      await new Promise<void>((resolve) => {
        item.file((file) => {
          entries.push(new File([file.slice(0, file.size)], item.fullPath.replace(/^\/+/, ''), { type: file.type }))
          resolve()
        })
      })
    }

    if (entries.length > 0) {
      const success = await smartUpload(entries, {
        context: 'files-updater',
        mode: 'BEST_EFFORT',
        currentPath: currentPath,
        promptOverwrite: async (fileName) => confirm(`Overwrite ${fileName}?`),
        onFileComplete: (newFile) => {
          const index = files.findIndex((f) => f.name === newFile.name && f.path === newFile.path)
          if (index !== -1) {
            files[index] = newFile
          } else {
            files = [...files, newFile]
          }
        },
        onError: (fileName, message) => addNotification('ERROR', `Error on ${fileName}: ${message}`)
      })

      if (success) await invalidateAll()
    }

    filesReady = true
  }

  async function getAllEntries(items: DataTransferItemList) {
    let entries: FileSystemFileEntry[] = []
    let queue: FileSystemEntry[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i]) queue.push(items[i].webkitGetAsEntry()!)
    }

    while (queue.length > 0) {
      const entry = queue.shift()
      if (entry) {
        if (entry.isFile) {
          entries.push(entry as FileSystemFileEntry)
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader()
          queue.push(...(await readAllDirectoryEntries(reader)))
        }
      }
    }

    return entries
  }

  async function readAllDirectoryEntries(reader: FileSystemDirectoryReader) {
    let entries = []
    let readEntries = await readDirectoryEntries(reader)

    while (readEntries.length > 0) {
      entries.push(...readEntries)
      readEntries = await readDirectoryEntries(reader)
    }

    return entries
  }

  async function readDirectoryEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    try {
      return await new Promise((resolve, reject) => reader.readEntries(resolve, reject))
    } catch (error) {
      console.error(error)
      return []
    }
  }

  $effect(() => {
    files = data.files
  })

  $effect(() => {
    if (oldPath !== path!.innerHTML) {
      oldPath = path!.innerHTML
      path!.scrollLeft = path!.scrollWidth
    }

    if (!files.find((file) => `${file.path}${file.name}/` === currentPath)) {
      currentPath = ''
    }
  })
</script>

<svelte:head>
  <title>Files Updater • {env.name} AdminTool</title>
</svelte:head>

{#if showChangeLoaderModal}
  <ChangeLoaderModal
    bind:show={showChangeLoaderModal}
    loader={data.loader as unknown as Loader}
    fabricLoaderVersions={data.fabricLoaderVersions}
    quiltLoaderVersions={data.quiltLoaderVersions}
    loaderList={data.loaderList}
  />
{/if}

<h2>Files Updater</h2>

<section
  class="section explorer"
  style="position: relative;"
  class:drag={isDragOver}
  ondragover={(e) => {
    e.preventDefault()
    isDragOver = true
  }}
  ondragenter={(e) => {
    e.preventDefault()
    isDragOver = true
  }}
  ondragleave={handleLeave}
  ondrop={handleDrop}
  aria-label="Files Updater Explorer"
>
  <h3>
    <button style="margin-right: 5px" onclick={getData} aria-label="Refresh Files Updater"><i class="fa-solid fa-rotate-right"></i></button><span
      bind:this={path}
      class:scrolled-left={sL}
      class:scrolled-right={sR}
      ><button onclick={() => (currentPath = '')}>Files Updater</button>{#each currentPathSplit as dir, i}{#if dir !== ''}<i
            class="fa-solid fa-caret-right"
          ></i><button onclick={() => (currentPath = currentPathSplit.slice(0, i + 1).join('/') + '/')}>{dir}</button>
        {/if}
      {/each}
    </span>
  </h3>

  <FilesUpdater bind:files bind:currentPath bind:ready={filesReady} />
</section>

{#if user.p_filesUpdater === 2}
  <section class="section">
    <button class="secondary right" onclick={() => (showChangeLoaderModal = true)} aria-label="Change Minecraft loader">
      <i class="fa-solid fa-ellipsis"></i>
    </button>

    <h3>Minecraft loader</h3>

    <div class="container">
      <div>
        <p class="label">Minecraft version</p>
        <p>
          {data.loader.minecraftVersion === 'latest_release'
            ? 'Latest release'
            : data.loader.minecraftVersion === 'latest_snapshot'
              ? 'Latest snapshot'
              : data.loader.minecraftVersion}
        </p>
      </div>

      <div>
        <p class="label">Loader</p>
        <p>
          {data.loader.type === ILoaderType.FORGE
            ? 'Forge'
            : data.loader.type === ILoaderType.NEOFORGE
              ? 'NeoForge'
              : data.loader.type === ILoaderType.FABRIC
                ? 'Fabric'
                : data.loader.type === ILoaderType.QUILT
                  ? 'Quilt'
                  : 'Vanilla'}
        </p>
      </div>

      <div>
        <p class="label">Loader version</p>
        <p>
          {data.loader.loaderVersion === 'latest_release'
            ? 'Latest release'
            : data.loader.loaderVersion === 'latest_snapshot'
              ? 'Latest snapshot'
              : data.loader.loaderVersion}
        </p>
      </div>

      <div>
        <p class="label">
          Format (auto)&nbsp;&nbsp;<i
            class="fa-solid fa-circle-question"
            title="This field is automatically deduced from the loader version."
            style="cursor: help"
          ></i>
        </p>
        <p>
          {data.loader.format === ILoaderFormat.INSTALLER ? 'Installer' : data.loader.format === ILoaderFormat.UNIVERSAL ? 'Universal' : 'Client'}
        </p>
      </div>
    </div>
  </section>
{/if}

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  section.section.explorer {
    &.drag::after {
      content: '\e09a';
      font-family: 'FontAwesome';
      font-size: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(194, 81, 5);
      position: absolute;
      top: 10px;
      left: 10px;
      width: calc(100% - 26px);
      height: calc(100% - 26px);
      background: rgba(194, 81, 5, 0.25);
      border-radius: 7px;
      border: 3px dashed rgba(194, 81, 5, 0.75);
      z-index: 1000;
    }

    h3 {
      span {
        display: inline-block;
        max-width: 730px;
        overflow-x: auto;
        overflow-y: hidden;
        height: 53px;
        white-space: nowrap;
        vertical-align: top;

        i.fa-solid.fa-caret-right {
          margin: 0 5px;
          display: inline-block;
          line-height: 29px;
          padding: 10px 0;
        }

        &.scrolled-left::before {
          content: '';
          position: absolute;
          top: 50px;
          left: 103px;
          width: 60px;
          height: 53px;
          background: linear-gradient(to right, white, transparent);
          z-index: 10;
        }

        &.scrolled-right::after {
          content: '';
          position: absolute;
          top: 50px;
          left: 774px;
          width: 60px;
          height: 53px;
          background: linear-gradient(to right, transparent, white);
          z-index: 10;
        }
      }

      button {
        display: inline;
        border-bottom: none;
        color: black;
        font-size: 18.72px;
        border-radius: 5px;
        padding: 10px 15px;
        font-weight: bold;
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        font-family: 'Poppins';
        background: none;
        vertical-align: top;
        line-height: 28.72px;

        &:hover {
          color: var(--primary-color-hover);
          background: #eeeeee;
          color: black;
        }

        &.active {
          background: #f5f5f5;
        }
      }
    }
  }
</style>
