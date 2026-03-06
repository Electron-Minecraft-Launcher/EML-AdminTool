<script lang="ts">
  import type { PageProps } from './$types'
  import { l } from '$lib/stores/language'
  import getEnv from '$lib/utils/env'
  import ProfilManagement from '../../../../components/contents/ProfilManagement.svelte'

  let { data }: PageProps = $props()

  const env = getEnv()

  let selectedProfilId = $state(data.profils[0].id)
</script>

<svelte:head>
  <title>{$l.dashboard.profils.title} • {env.name} AdminTool</title>
</svelte:head>

<h2>{$l.dashboard.profils.title}</h2>

<section class="section">
  <h3>{$l.dashboard.profils.profilManagement.title}</h3>

  <div class="list-container">
    <div class="list small">
      <p class="label">{$l.dashboard.profils.profilManagement.profils}</p>
      {#each data.profils as i}
        <button class="list" class:active={selectedProfilId === i.id} onclick={() => (selectedProfilId = i.id)}>
          {i.name}
          {#if i.isDefault}
            &nbsp; <i class="fa-solid fa-star" title={$l.dashboard.emlatSettings.profilManagement.defaultProfil}></i>
          {/if}
        </button>
      {/each}
    </div>

    <div class="content-list">
      <ProfilManagement bind:selectedProfilId {data} />
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';
  @use '../../../../../static/scss/list.scss';
</style>
