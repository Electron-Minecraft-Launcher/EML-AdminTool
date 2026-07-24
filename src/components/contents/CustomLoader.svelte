<script lang="ts">
  let isDragOver = $state(false)

  async function uploadFile(fileType: 'version' | 'assetIndex' | 'client' | 'jar') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'version' || fileType === 'assetIndex' ? '.json' : '.jar'
    input.multiple = input.accept === '.jar'

    input.onchange = () => {
      const files = input.files ? [input.files[0]] : []
      if (files.length === 0) return

      const label = files[0].name

      switch (fileType) {
        // case 'json':
        //   jsonFile = files[0]
        //   jsonLabel = label
        //   break
        // case 'jar':
        //   jarFile = files[0]
        //   jarLabel = label
        //   break
        // default:
        //   console.warn('Unknown file:', fileType)
      }
    }

    input.click()
  }

  function reset(fileType: 'json' | 'jar') {
    // if (fileType === 'json') {
    //   jsonFile = null
    //   jsonLabel = ''
    // }
    // if (fileType === 'jar') {
    //   jarFile = null
    //   jarLabel = ''
    // }
  }

  function handleLeave(e: any) {
    e.preventDefault()
    if (!e.currentTarget!.contains(e.relatedTarget)) {
      isDragOver = false
    }
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault()
    isDragOver = false

    if (!e.dataTransfer || e.dataTransfer.items.length === 0) return

    // const items = await getAllEntries(e.dataTransfer.items)
    // let entries: File[] = []

    // for (const item of items) {
    //   await new Promise<void>((resolve) => {
    //     item.file((file) => {
    //       entries.push(new File([file.slice(0, file.size)], item.fullPath.replace(/^\/+/, ''), { type: file.type }))
    //       resolve()
    //     })
    //   })
    // }

    // if (entries.length > 0) {
    //   const optimisticFolders: File_[] = []

    //   entries.forEach((file) => {
    //     const parts = file.name.split('/')
    //     parts.pop()

    //     let buildPath = currentPath

    //     parts.forEach((folderName) => {
    //       const alreadyExists =
    //         files.some((f) => f.type === 'FOLDER' && f.path === buildPath && f.name === folderName) ||
    //         optimisticFolders.some((f) => f.type === 'FOLDER' && f.path === buildPath && f.name === folderName)

    //       if (!alreadyExists) {
    //         optimisticFolders.push({
    //           name: folderName,
    //           path: buildPath,
    //           type: 'FOLDER',
    //           size: 0,
    //           sha1: '',
    //           url: ''
    //         })
    //       }
    //       buildPath += `${folderName}/`
    //     })
    //   })

    //   if (optimisticFolders.length > 0) {
    //     files = [...files, ...optimisticFolders]
    //   }

    //   uploader.startUpload(entries, currentPath, selectedProfile.slug, (newFile: File_) => {
    //     files = [...files.filter((f) => f.name !== newFile.name || f.path !== newFile.path), newFile]
    //   })
    // }
  }
</script>

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
  ondrop={(e) => handleDrop(e)}
  aria-label="Drop files here to upload"
>
  <p class="title">Upload your version manifest</p>
  <p>
    Upload a JSON file containing your version information. This file must respect the Minecraft version schema (see example <a
      href="https://piston-meta.mojang.com/v1/packages/d98675ecc24364e90b18dbea80390b1345c3f71f/26.2.json"
      target="_blank">here</a
    >).
  </p>
  <p>If you need to upload any extra files (new or modified), you need to compute their SHA1 hashes, sizes, and remove the URL:</p>
  <pre>
&#123;
  "sha1": "d98675ecc24364e90b18dbea80390b1345c3f71f", // computed SHA1 hash
  "size": 123456, // computed size in bytes
  "url": "" // removed URL
&#125;</pre>
  <p>
    You will be prompted to upload those files later. <a
      href="https://emlproject.com/docs/eml-admintool/administration-and-features/files-updater#mod-loader-configuration"
      target="_blank">Learn more...</a
    >
  </p>
  <button type="button" class="secondary upload" onclick={() => uploadFile('version')}>
    <i class="fa-solid fa-file-arrow-up"></i>&nbsp;&nbsp;Select file...
  </button>
</div>

<style lang="scss">
  div.upload {
    border: 3px dashed var(--border-color);
    border-radius: 7px;
    padding: 30px;
    color: #555;
    position: relative;

    p {
      font-size: 14px;

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

    &.drag {
      font-size: 50px;
      border: 3px dashed rgba(194, 81, 5, 0.75);
      z-index: 1000;

      &::after {
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
