<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import { l } from '$lib/stores/language'
  import { callAction } from '$lib/utils/call'
  import getEnv from '$lib/utils/env'
  import AddEditBackgroundModal from '../../../../components/modals/AddEditBackgroundModal.svelte'
  import type { PageProps } from './$types'

  let { data = $bindable() }: PageProps = $props()

  const env = getEnv()

  let showAddEditBackgroundModal = $state(false)
  let selectedBackgroundId: string | null = $state(null)

  async function enable(backgroundId: string) {
    const formData = new FormData()
    formData.set('background-id', backgroundId)

    await callAction({ url: '/dashboard/backgrounds', action: 'enableBackground', formData }, $l)
    invalidateAll()
    selectedBackgroundId = null
  }

  async function deleteBackground(backgroundId: string) {
    if (!confirm('Are you sure you want to delete this image? It will not be available in the news anymore.')) return

    const formData = new FormData()
    formData.set('background-id', backgroundId)

    await callAction({ url: '/dashboard/backgrounds', action: 'deleteBackground', formData }, $l)
    invalidateAll()
    selectedBackgroundId = null
  }
</script>

<svelte:head>
  <title>Backgrounds • {env.name} AdminTool</title>
</svelte:head>

{#if showAddEditBackgroundModal}
  <AddEditBackgroundModal bind:show={showAddEditBackgroundModal} backgrounds={data.backgrounds} {selectedBackgroundId} />
{/if}

<h2>Backgrounds</h2>

<section class="section">
  <button
    class="secondary right"
    onclick={() => {
      selectedBackgroundId = null
      showAddEditBackgroundModal = true
    }}
    aria-label="Add background"
  >
    <i class="fa-solid fa-file-arrow-up"></i>
  </button>

  <h3>Backgrounds</h3>

  <div class="container">
    {#each data.backgrounds as background}
      <div style="background-image: url('{background.file!.url}')" class="img" class:active={background.status === 'ACTIVE'}>
        <div>
          {#if background.status === 'INACTIVE'}
            <button onclick={() => enable(background.id)}><i class="fa-solid fa-bolt"></i>&nbsp;&nbsp;Enable</button><br />
          {/if}
          <button
            onclick={() => {
              selectedBackgroundId = background.id
              showAddEditBackgroundModal = true
            }}
            aria-label="Edit background"
          >
            <i class="fa-solid fa-pen"></i>
          </button>
          <button
            disabled={background.status === 'ACTIVE'}
            title={background.status === 'ACTIVE' ? 'You cannot delete the active background.' : ''}
            class="remove"
            onclick={() => deleteBackground(background.id)}
            aria-label="Delete background"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <p class="title">{background.name}</p>
      </div>
    {/each}
  </div>

  {#if data.backgrounds.length === 0}
    <p class="nothing">No background</p>
  {/if}
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  div.container {
    margin-top: 30px;
  }

  p.no-link {
    margin: 0px;
    display: inline-block;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  p.nothing {
    text-align: center;
    margin-top: 15px;
    color: #606060;
  }

  div.img {
    width: 280px;
    aspect-ratio: 4 / 3;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
    position: relative;
    margin-bottom: 30px;
    transition: all 0.1s;

    &.active {
      outline: 4px solid var(--primary-color);
    }

    p.title {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      padding: 5px;
      background: #353535a1;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      color: white;
      font-weight: 500;
      font-size: 16px;
      text-align: center;
      z-index: 0;
    }

    div {
      position: absolute;
      display: flex;
      gap: 5px;
      width: 100%;
      height: 100%;
      align-items: center;
      vertical-align: middle;
      justify-content: center;
      background: #dfdfdfa1;
      border-radius: 5px;
      transition: opacity 0.3s;
      opacity: 0;
      z-index: 10;

      &:hover {
        opacity: 1;
      }
    }
  }

  button:not(:global(.secondary)) {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 250px;
    vertical-align: bottom;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;

    &:hover {
      background: #eeeeeeb7;
    }

    &.remove {
      display: inline-block;
      border-bottom: none;
      margin-left: 5px;
      position: relative;
      background: none;
      color: var(--red-color);
      vertical-align: middle;

      &:hover {
        background: #faeeeeb7;
      }
    }
  }
</style>
