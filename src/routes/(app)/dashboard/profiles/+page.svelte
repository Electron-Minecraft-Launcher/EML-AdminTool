<script lang="ts">
  import type { PageProps } from './$types'
  import { l } from '$lib/stores/language'
  import getEnv from '$lib/utils/env'
  import ProfileManagement from '../../../../components/contents/ProfileManagement.svelte'

  let { data }: PageProps = $props()

  const env = getEnv()

  let selectedProfileId: string = $state(data.profiles[0].id)
  let selectedProfileIdModal: string | null = $state(null)
  let showAddEditProfileModal = $state(false)
  let profiles = $state(data.profiles)
  let users = $state(data.users)
  let userPermissions = $state(data.userPermissions)

  $effect(() => {
    if (data.profiles) profiles = data.profiles
    if (data.users) users = data.users
    if (data.userPermissions) userPermissions = data.userPermissions
  })
</script>

<svelte:head>
  <title>{$l.dashboard.profiles.title} • {env.name} AdminTool</title>
</svelte:head>

<h2>{$l.dashboard.profiles.title}</h2>

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
      <button
        class="secondary add"
        onclick={() => {
          selectedProfileIdModal = null
          showAddEditProfileModal = true
        }}
      >
        <i class="fa-solid fa-plus"></i>&nbsp;&nbsp;{$l.dashboard.profiles.profileManagement.addProfile}
      </button>
    </div>

    <div class="content-list">
      <ProfileManagement bind:showAddEditProfileModal bind:selectedProfileId bind:selectedProfileIdModal {data} />
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

  div.list-container {
    div.list {
      max-height: 500px !important;
      overflow-x: hidden;
      overflow-y: auto;
      padding-bottom: 10px;
    }
  }

  button.add {
    margin-top: 10px;
    width: 100%;
  }
</style>
