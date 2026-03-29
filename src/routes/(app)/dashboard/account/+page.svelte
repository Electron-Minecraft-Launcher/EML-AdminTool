<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import getEnv from '$lib/utils/env'
  import getUser from '$lib/utils/user'
  import type { SubmitFunction } from '@sveltejs/kit'
  import type { NotificationCode } from '$lib/utils/notifications'
  import EditAccountModal from '../../../../components/modals/EditAccountModal.svelte'

  const env = getEnv()
  const user = getUser()

  let showEditAccountModal = $state(false)

  const enhanceForm: SubmitFunction = ({ formData, cancel }) => {
    if (!confirm($l.dashboard.account.dangerZone.deleteAccountWarning)) {
      cancel()
      return
    }

    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        goto('/login')
      }

      await applyAction(result)
    }
  }
</script>

<svelte:head>
  <title>{$l.dashboard.account.title} • {env.name} AdminTool</title>
</svelte:head>

{#if showEditAccountModal}
  <EditAccountModal bind:show={showEditAccountModal} />
{/if}

<h2>{$l.dashboard.account.title}</h2>

<section class="section">
  <button class="secondary right" onclick={() => (showEditAccountModal = true)} aria-label="Edit account"><i class="fa-solid fa-pen"></i></button>
  <h3>{$l.dashboard.account.info.title}</h3>

  <div class="container">
    <div>
      <p class="label">{$l.common.username}</p>
      <p>{user.username}</p>
    </div>

    <div>
      <p class="label">{$l.common.password}</p>
      <p>••••••••••</p>
    </div>

    <div>
      <p class="label">{$l.dashboard.account.info.accountType}</p>
      <p>{user.isAdmin ? 'Administrator' : 'Standard'}</p>
    </div>
  </div>
</section>

<section class="section">
  <h3>{$l.dashboard.account.permissions.title}</h3>

  <div class="container">
    <div>
      <p class="label">Files updater</p>
      <!-- {#if user.p_filesUpdater}
        {#if user.p_filesUpdater >= 1}
          <p>Add, edit and delete files</p>
        {/if}
        {#if user.p_filesUpdater === 2}
          <p>Change Minecraft loader</p>
        {/if} -->
      {#if user.isAdmin}
        <p>All permissions</p>
      {:else if user.profilePermissions.length > 0}
        {#each user.profilePermissions as perm}
          {#if perm && perm.permission >= 1}
            <p>{perm.name}: Add, edit and delete files{perm.permission === 2 ? ', change loader' : ''}</p>
          {/if}
        {/each}
      {:else}
        <p>-</p>
      {/if}
    </div>

    <div>
      <p class="label">Bootstraps</p>
      {#if user.p_bootstraps}
        <p>Change bootstraps files</p>
      {:else}
        <p>-</p>
      {/if}
    </div>

    <div>
      <p class="label">Maintenance</p>
      {#if user.p_maintenance}
        <p>Change maintenance status</p>
      {:else}
        <p>-</p>
      {/if}
    </div>

    <div>
      <p class="label">News</p>
      {#if user.p_news || user.p_newsCategories || user.p_newsTags}
        {#if user.p_news >= 1}
          <p>Add news, edit and delete your news</p>
        {/if}
        {#if user.p_news === 2}
          <p>Delete any news</p>
        {/if}
        {#if user.p_newsCategories}
          <p>Add, edit and delete news categories</p>
        {/if}
        {#if user.p_newsTags}
          <p>Add, edit and delete news tags</p>
        {/if}
      {:else}
        <p>-</p>
      {/if}
    </div>

    <div>
      <p class="label">Background</p>
      {#if user.p_backgrounds}
        <p>Change backgrounds</p>
      {:else}
        <p>-</p>
      {/if}
    </div>

    <div>
      <p class="label">Stats</p>
      {#if user.p_stats === 1}
        <p>View stats</p>
      {:else if user.p_stats === 2}
        <p>View and delete stats</p>
      {:else}
        <p>-</p>
      {/if}
    </div>
  </div>
</section>

{#if !user.isAdmin}
  <section class="section">
    <h3>{$l.dashboard.account.dangerZone.title}</h3>

    <div class="container">
      <div>
        <form method="POST" action="?/delete" use:enhance={enhanceForm}>
          <button type="submit" class="primary danger">{$l.dashboard.account.dangerZone.deleteAccount}</button>
        </form>
      </div>
    </div>
  </section>
{/if}

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';
</style>
