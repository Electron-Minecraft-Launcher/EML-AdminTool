<script lang="ts">
  import { IUserStatus } from '$lib/utils/db'
  import type { PageData } from '../../routes/(app)/dashboard/emlat-settings/$types'
  import { l } from '$lib/stores/language'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'
  import { applyAction } from '$app/forms'
  import AddEditInstanceModal from '../modals/AddEditInstanceModal.svelte'

  interface Props {
    selectedInstanceId: string
    data: PageData
  }

  let { selectedInstanceId = $bindable(), data }: Props = $props()

  let showEditInstanceModal = $state(false)
  let selectedInstance = $derived.by(() => data.instances.find((instance) => instance.id === selectedInstanceId))!
  let action: 'ADD' | 'EDIT' = $state('ADD')

  const enhanceForm: SubmitFunction = ({ action, formData, cancel }) => {
    const warning =
      action.search === '?/refuseUser'
        ? $l.dashboard.emlatSettings.userManagement.refuseUserWarning
        : action.search === '?/deleteUser'
          ? $l.dashboard.emlatSettings.userManagement.deleteUserWarning
          : $l.dashboard.emlatSettings.userManagement.deleteUserForeverWarning
    if (!confirm(warning)) {
      cancel()
      return
    }

    formData.set('user-id', selectedInstanceId)
    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        if (action.search === '?/deleteUserForever') {
          selectedInstanceId = data.instances[0]?.id ?? ''
        }
      }

      await applyAction(result)
    }
  }
</script>

{#if showEditInstanceModal}
  <AddEditInstanceModal bind:show={showEditInstanceModal} bind:selectedInstanceId={selectedInstanceId} {action} {data} />
{/if}

{#if !selectedInstance.isDefault}
  <form method="POST" action="?/deleteInstance" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right refuse" aria-label="Delete instance"><i class="fa-solid fa-trash"></i></button>
  </form>
{/if}
<button
  class="secondary right"
  onclick={() => {
    showEditInstanceModal = true
    action = 'EDIT'
  }}
  aria-label="Edit instance"
>
  <i class="fa-solid fa-pen"></i>
</button>

<div class="perms">
  <h4>{selectedInstance.name}</h4>

  <!-- <p class="label">{$l.common.username}</p>
  <p>{selectedInstance.username}</p> -->

  <!-- {#if selectedInstance.status === IUserStatus.ACTIVE}
    <p class="label">{$l.dashboard.emlatSettings.userManagement.permissions}</p>
    {#if selectedInstance.isAdmin}
      <p>Admin (all permissions)</p>
    {:else}
      {#if selectedInstance.p_filesUpdater >= 1}
        <p>Add, edit and delete files</p>
      {/if}
      {#if selectedInstance.p_filesUpdater === 2}
        <p>Change Minecraft loader</p>
      {/if}

      {#if selectedInstance.p_bootstraps}
        <p>Change bootstraps files</p>
      {/if}

      {#if selectedInstance.p_maintenance}
        <p>Change maintenance status</p>
      {/if}

      {#if selectedInstance.p_news || selectedInstance.p_newsCategories || selectedInstance.p_newsTags}
        {#if selectedInstance.p_news >= 1}
          <p>Add news, edit and delete news they created</p>
        {/if}
        {#if selectedInstance.p_news === 2}
          <p>Delete any news</p>
        {/if}
        {#if selectedInstance.p_newsCategories}
          <p>Add, edit and delete news categories</p>
        {/if}
        {#if selectedInstance.p_newsTags}
          <p>Add, edit and delete news tags</p>
        {/if}
      {/if}

      {#if selectedInstance.p_backgrounds}
        <p>Change backgrounds</p>
      {/if}

      {#if selectedInstance.p_stats === 1}
        <p>View stats</p>
      {:else if selectedInstance.p_stats === 2}
        <p>View and delete stats</p>
      {/if}

      {#if !selectedInstance.p_filesUpdater && !selectedInstance.p_bootstraps && !selectedInstance.p_maintenance && !selectedInstance.p_news && !selectedInstance.p_newsCategories && !selectedInstance.p_newsTags && !selectedInstance.p_backgrounds && !selectedInstance.p_stats}
        <p>No permissions</p>
      {/if}
    {/if}
  {/if} -->
</div>

<style lang="scss">
  div.perms {
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;
  }

  button.right {
    position: absolute;
    right: 0;
    top: 30px;
  }

  button.accept {
    color: #266e26;
  }

  button.refuse {
    right: 58px;
    color: #6e2626;
  }

  button.delete {
    color: #6e2626;
  }
</style>
