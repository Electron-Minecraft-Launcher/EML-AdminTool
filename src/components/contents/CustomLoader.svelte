<script lang="ts">
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import {
    getMissingAssetsFromIndex,
    getMissingLibrariesFromVersion,
    type MissingAsset,
    type MissingLibrary,
    type MissingSpecialFiles
  } from '$lib/utils/parser'
  import type { HashFile } from '$lib/utils/types'
  import { computeSha1Hash, getAllItemEntries } from '$lib/utils/utils'

  interface Props {
    customLoaderStep: number
    customLoaderFiles: {
      version: HashFile | null
      assetIndex: HashFile | null
      libs: Map<string, File>
    }
    missingLibraries: Map<string, MissingLibrary>
    missingSpecialFiles: MissingSpecialFiles
    missingAssets: Map<string, MissingAsset>
    patchLog4Shell: boolean
    missingFilesCount: number
  }

  let {
    customLoaderStep = $bindable(),
    customLoaderFiles = $bindable(),
    missingLibraries = $bindable(),
    missingSpecialFiles = $bindable(),
    missingAssets = $bindable(),
    patchLog4Shell = $bindable(),
    missingFilesCount
  }: Props = $props()

  let isDragOver = $state(false)

  async function handleClick(fileType: 'version' | 'assetIndex' | 'lib') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'version' || fileType === 'assetIndex' ? '.json' : ''
    input.multiple = fileType === 'lib'

    input.onchange = async () => {
      const files = input.files ? [input.files[0]] : []
      await addFiles(files, fileType)
    }

    input.click()
  }

  async function handleDrop(e: DragEvent, fileType: 'version' | 'assetIndex' | 'lib') {
    e.preventDefault()
    isDragOver = false

    if (!e.dataTransfer || e.dataTransfer.items.length === 0) return

    const items = await getAllItemEntries(e.dataTransfer.items)
    const files: File[] = []

    for (const item of items) {
      await new Promise<void>((resolve) => {
        item.file((file) => {
          files.push(new File([file.slice(0, file.size)], item.name, { type: file.type }))
          resolve()
        })
      })
    }

    await addFiles(files, fileType)
  }

  function handleLeave(e: any) {
    e.preventDefault()
    if (!e.currentTarget!.contains(e.relatedTarget)) {
      isDragOver = false
    }
  }

  async function addFiles(files: File[], fileType: 'version' | 'assetIndex' | 'lib') {
    if (files.length === 0) return

    const hashFiles: HashFile[] = []
    for (const file of files) {
      const sha1 = await computeSha1Hash(file)
      hashFiles.push({ file, sha1 })
    }

    switch (fileType) {
      case 'version':
        handleVersionFileChange(hashFiles)
        break
      case 'assetIndex':
        handleAssetIndexFileChange(hashFiles)
        break
      case 'lib':
        handleLibFileChange(hashFiles)
        break
      default:
        console.warn('Unknown file:', fileType)
    }
  }

  function reset(fileType: 'version' | 'assetIndex' | 'lib', sha1?: string) {
    if (fileType === 'version') {
      customLoaderFiles.version = null
      customLoaderFiles.assetIndex = null
      customLoaderFiles.libs.clear()
    } else if (fileType === 'assetIndex') {
      customLoaderFiles.assetIndex = null
      customLoaderFiles.libs.clear()
    } else if (fileType === 'lib') {
      if (sha1) {
        customLoaderFiles.libs.delete(sha1)
      } else {
        customLoaderFiles.libs.clear()
      }
      customLoaderFiles.libs = new Map(customLoaderFiles.libs)
    }
  }

  async function handleVersionFileChange(hashFiles: HashFile[]) {
    customLoaderFiles.version = hashFiles[0]
    const content = await customLoaderFiles.version.file.text()
    const missing = getMissingLibrariesFromVersion(content, $l)
    missingLibraries = missing[0]
    missingSpecialFiles = missing[1]
  }

  async function handleAssetIndexFileChange(hashFiles: HashFile[]) {
    const file = hashFiles[0].file
    const sha1 = hashFiles[0].sha1
    const size = file.size
    const ref = missingLibraries.get(sha1)
    if (!ref || missingSpecialFiles.assetIndexJson !== sha1 || ref.size !== size) {
      addNotification('ERROR', 'Invalid asset index file.')
    } else {
      customLoaderFiles.assetIndex = hashFiles[0]
      const content = await customLoaderFiles.assetIndex.file.text()
      missingAssets = getMissingAssetsFromIndex(content)
    }
  }

  async function handleLibFileChange(hashFiles: HashFile[]) {
    for (const file of hashFiles) {
      const libRef = missingLibraries.get(file.sha1)
      const assetRef = missingAssets.get(file.sha1)
      if ((!libRef || libRef.size !== file.file.size) && (!assetRef || assetRef.size !== file.file.size)) {
        addNotification('WARNING', `File ${file.file.name} does not match any missing library.`)
      } else {
        customLoaderFiles.libs.set(file.sha1, file.file)
      }
    }
    customLoaderFiles.libs = new Map(customLoaderFiles.libs)
  }

  function formatLibPath(path: string) {
    if (path.startsWith('*')) {
      switch (path) {
        case '*client.jar':
          return 'client.jar (your custom client JAR file)'
        case '*client.txt':
          return 'client.txt (your client mappings file)'
        case '*logging.xml':
          return 'logging.xml (your logging configuration file)'
        default:
          return path
      }
    }
    if (path.length > 80) {
      const parts = path.split('/')
      const lastPart = parts[parts.length - 1]
      let result = ''
      for (let i = 0; i < parts.length - 1; i++) {
        if (result.length + parts[i].length + lastPart.length < 80) {
          result += parts[i] + '/'
        } else {
          result += '.../'
          break
        }
      }
      result += lastPart
      return result
    }
    return path
  }

  function formatLibSize(size: number) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
</script>

{#if customLoaderStep === 2}
  <h4>Custom version manifest</h4>
  <p>
    Upload a JSON file containing your version information. This file must respect the <a href="https://minecraft.wiki/w/Client.json" target="_blank">
      Minecraft version schema</a
    >.
  </p>
  <p>
    If you need to upload any extra files (new or modified), you <b>need</b> to compute their SHA-1 hashes, sizes, and add an URL property with the value
    "eml://upload":
  </p>
  <pre>
&#123;
  "sha1": "d98675ecc24364e90b18dbea80390b1345c3f71f", // computed SHA-1 hash
  "size": 123456, // computed size in bytes
  "url": "eml://upload" // added this URL
&#125;</pre>
  <p>
    You will be prompted to upload those files later. <a
      href="https://emlproject.com/docs/eml-admintool/administration-and-features/files-updater#mod-loader-configuration"
      target="_blank">Learn more...</a
    >
  </p>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="upload"
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
    ondrop={(e) => handleDrop(e, 'version')}
    aria-label="Drop files here to upload"
  >
    {#if !customLoaderFiles.version}
      <button type="button" class="upload" onclick={() => handleClick('version')}>
        <i class="fa-solid fa-file-arrow-up"></i>Drag and drop your version manifest file here or click to select a file...
      </button>
    {:else}
      <p class="no-link">{customLoaderFiles.version.file.name}</p>
      <button type="button" class="remove" onclick={() => reset('version')} aria-label="Remove version manifest file">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    {/if}
  </div>
{:else if customLoaderStep === 3}
  <h4>Custom asset index</h4>
  <p>
    Upload a JSON file containing the list of your assets (assetIndex.json). This file must respect the <a
      href="https://minecraft.wiki/w/Resource_pack#Asset_object_store"
      target="_blank"
    >
      Minecraft assetIndex schema</a
    >.
  </p>
  <p>
    If you need to upload any extra files (new or modified), you need to compute their SHA-1 hashes, sizes, and add an URL property with the value
    "eml://upload":
  </p>
  <pre>
"icons/icon_128x128.png": &#123;
  "hash": "b62ca8ec10d07e6bf5ac8dae0c8c1d2e6a1e3356", // computed SHA-1 hash
  "size": 9101, // computed size in bytes
  "url": "eml://upload" // added this URL
&#125;</pre>
  <p>
    You will be prompted to upload those files later. <a
      href="https://emlproject.com/docs/eml-admintool/administration-and-features/files-updater#mod-loader-configuration"
      target="_blank">Learn more...</a
    >
  </p>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="upload"
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
    ondrop={(e) => handleDrop(e, 'assetIndex')}
    aria-label="Drop files here to upload"
  >
    {#if !customLoaderFiles.assetIndex}
      <button type="button" class="upload" onclick={() => handleClick('assetIndex')}>
        <i class="fa-solid fa-file-arrow-up"></i>Drag and drop your asset index file here or click to select a file...
      </button>
    {:else}
      <p class="no-link">{customLoaderFiles.assetIndex.file.name}</p>
      <button type="button" class="remove" onclick={() => reset('assetIndex')} aria-label="Remove asset index file">
        <i class="fa-solid fa-circle-xmark"></i>
      </button>
    {/if}
  </div>
{:else}
  <h4>Missing files</h4>
  <div class="list">
    <div class="list-content">
      {#each missingLibraries as [sha1, lib] (sha1)}
        {#if lib.path !== '*assetIndex.json'}
          <div class="item" class:uploaded={customLoaderFiles.libs.has(sha1)}>
            <div style="flex: 1">
              <span class="path">{formatLibPath(lib.path)}</span>
              <span class="size">{formatLibSize(lib.size!)}</span>
              <span class="hash">{sha1}</span>
            </div>
            {#if customLoaderFiles.libs.has(sha1)}
              <div>
                <button class="remove" type="button" aria-label={`Remove ${lib.path}`} onclick={() => reset('lib', sha1)}>
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
      {#each missingAssets as [sha1, asset] (sha1)}
        <div class="item" class:uploaded={customLoaderFiles.libs.has(sha1)}>
          <div style="flex: 1">
            <span class="path">{formatLibPath(asset.path)}</span>
            <span class="size">{formatLibSize(asset.size!)}</span>
            <span class="hash">{sha1}</span>
          </div>
          {#if customLoaderFiles.libs.has(sha1)}
            <div>
              <button class="remove" type="button" aria-label={`Remove ${asset.path}`} onclick={() => reset('lib', sha1)}>
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          {/if}
        </div>
      {/each}
      {#if (missingLibraries.size === 0 && missingAssets.size === 0) || (missingLibraries.size === 1 && missingAssets.size === 0 && missingSpecialFiles.assetIndexJson)}
        <p class="nothing">No missing files detected.</p>
      {/if}
    </div>
    <div class="bottom">{missingFilesCount} missing files left</div>
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="upload"
    style="margin-top: 30px"
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
    ondrop={(e) => handleDrop(e, 'lib')}
    aria-label="Drop files here to upload"
  >
    <button type="button" class="upload" onclick={() => handleClick('lib')} style="margin: 0">
      <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select files...
    </button>
  </div>
{/if}

<style lang="scss">
  p {
    font-size: 14px;
    color: #505050;

    &.title {
      margin-top: 0;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 10px;
    }
  }

  pre {
    font-size: 13px;
    text-align: left;
    background: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    border: 1px solid var(--border-color);
    margin: 0;
  }

  div.flex {
    display: flex;
    gap: 20px;
    vertical-align: top;

    div {
      flex: 1;
    }
  }

  div.list {
    border: 1px solid var(--border-color);
    border-radius: 7px;
    color: #555;
    position: relative;
    height: calc(100% - 246px);
    overflow: hidden;

    div.list-content {
      max-height: calc(100% - 35px);
      overflow-y: auto;
    }

    div.bottom {
      position: absolute;
      font-size: 14px;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 7px 35px;
      background: white;
      border-top: 1px solid var(--border-color);
    }

    div.item {
      background: #ffe3e3;
      color: #444;
      padding: 10px 35px;
      margin: 0;
      display: flex;
      position: relative;

      &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
      }

      &.uploaded {
        background: #e3ffe3;
      }

      span {
        &.path {
          display: block;
          font-size: 14px;
          font-family: 'Fira Code', monospace;
        }

        &.size {
          display: inline-block;
          font-size: 12px;
          color: #777;
          margin-right: 15px;
        }

        &.hash {
          display: inline-block;
          font-size: 12px;
          color: #777;
          font-family: 'Fira Code', monospace;
        }
      }

      button {
        margin: 0;
      }
    }
  }

  div.upload {
    border: 3px dashed var(--border-color);
    border-radius: 7px;
    padding: 0;
    position: relative;
    height: 90px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    &.drag {
      border: 3px dashed rgba(194, 81, 5, 0.75);
      z-index: 1000;

      button.upload {
        opacity: 0;
      }

      &::after {
        font-size: 50px;
        content: '\e09a';
        background: rgba(194, 81, 5, 0.25);
        font-family: 'FontAwesome';
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgb(194, 81, 5);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }

  p.no-link {
    margin: 0;
    display: inline-block;
    max-width: 700px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
    padding: 8px 0 7px 0;

    :global(.file-separator) {
      color: #777777;
    }
  }

  button.upload {
    margin: 0;
    width: 100%;
    height: 100%;
    background: white;
    color: #555;
    transition: none;

    i.fa-solid {
      font-size: 20px;
      display: block;
      margin: 0 auto 10px auto;
    }

    &:hover:active {
      transform: translateY(0);
    }
  }

  button.remove {
    display: inline-block;
    border-bottom: none;
    margin-top: 0;
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

  p.nothing {
    text-align: center;
    margin-top: 20px;
    color: #606060;
  }
</style>
