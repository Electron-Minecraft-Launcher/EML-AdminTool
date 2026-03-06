<script lang="ts">
  import type { PageProps } from './$types'
  import { l } from '$lib/stores/language'
  import getEnv from '$lib/utils/env'
  import ProfileManagement from '../../../../components/contents/ProfileManagement.svelte'

  let { data }: PageProps = $props()

  const env = getEnv()

  let selectedProfileId = $state(data.profiles[0].id)
</script>

<svelte:head>
  <title>{$l.dashboard.profiles.title} • {env.name} AdminTool</title>
</svelte:head>

<h2>{$l.dashboard.profiles.title}</h2>

<section class="section warning">
  <p><i class="fa-solid fa-warning"></i>&nbsp;&nbsp;You cannot add or remove profiles at this time. You can only modify the default profile.</p>
</section>

<section class="section">
  <h3>{$l.dashboard.profiles.profileManagement.title}</h3>

  <div class="list-container">
    <div class="list small">
      <p class="label">{$l.dashboard.profiles.profileManagement.profiles}</p>
      {#each data.profiles as i}
        <button class="list" class:active={selectedProfileId === i.id} onclick={() => (selectedProfileId = i.id)}>
          {i.name}
          {#if i.isDefault}
            &nbsp; <i class="fa-solid fa-star" title={$l.dashboard.profiles.profileManagement.defaultProfile}></i>
          {/if}
        </button>
      {/each}
    </div>

    <div class="content-list">
      <ProfileManagement bind:selectedProfileId {data} />
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';
  @use '../../../../../static/scss/list.scss';

  section.warning {
    padding: 15px 20px;
    background-color: #fff3cd;
    border: 1px solid #d4c084;
    color: #4d3c0a;
  }

  i.fa-solid.fa-star {
    font-size: 10px;
  }
</style>
