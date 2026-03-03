<script lang="ts">
  import { uploader } from '$lib/stores/upload.svelte'

  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (uploader.isUploading) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  function truncatePath(path: string, maxLength: number = 35): string {
    if (path.length <= maxLength) return path
    const charsToShow = maxLength - 3
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return path.substring(0, frontChars) + '...' + path.substring(path.length - backChars)
  }
</script>

<svelte:window onbeforeunload={handleBeforeUnload} />

{#if uploader.isUploading || uploader.queueLength > 0}
  <div class="upload-widget">
    <div class="icon">
      <i class="fa-solid fa-cloud-arrow-up"></i>
    </div>
    
    <div class="info">
      <p class="filename" title={uploader.currentFile}>
        {uploader.currentFile ? truncatePath(uploader.currentFile) : 'Preparing...'}
      </p>
      <div class="progress-bar">
        <div class="fill" style="width: {uploader.globalProgress}%"></div>
      </div>
    </div>

    <div class="count">
      {uploader.globalProgress}% ({uploader.queueLength} remaining)
    </div>
  </div>
{/if}

<style lang="scss">
  .upload-widget {
    position: fixed;
    top: 20px;
    right: 25px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 15px 20px;
    z-index: 9999;
    gap: 20px;
    font-family: 'Poppins', sans-serif;
    width: 450px; 
    flex-shrink: 0;

    .icon {
      color: var(--primary-color);
      font-size: 20px;
    }

    .info {
      flex-grow: 1;
      overflow: hidden;
      width: 350px;

      p.filename {
        margin: 0 0 5px 0;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #eee;
        border-radius: 3px;
        overflow: hidden;

        .fill {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.2s ease-out;
        }
      }
    }

    .count {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      text-align: right;
      width: 170px;
    }
  }
</style>
