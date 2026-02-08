<script lang="ts">
  import { IUserStatus } from '$lib/utils/db'
  import type { PageData } from '../../routes/(app)/dashboard/emlat-settings/$types'
  import { emptyUser } from '$lib/stores/user'
  import { l } from '$lib/stores/language'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'
  import { applyAction } from '$app/forms'
  import EditUserModal from '../modals/EditUserModal.svelte'

  interface Props {
    selectedUserId: string
    data: PageData
  }

  let { selectedUserId = $bindable(), data }: Props = $props()

  let showEditUserModal = $state(false)
  let selectedUser = $derived.by(() => data.users.find((user) => user.id === selectedUserId) ?? emptyUser)
  let action: 'ACCEPT' | 'EDIT' = $state('ACCEPT')

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

    formData.set('user-id', selectedUserId)
    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        if (action.search === '?/deleteUserForever') {
          selectedUserId = data.users[0]?.id ?? ''
        }
      }

      await applyAction(result)
    }
  }
</script>

{#if showEditUserModal}
  <EditUserModal bind:show={showEditUserModal} bind:selectedUserId {action} {data} />
{/if}

{#if !selectedUser.isAdmin && selectedUser.status === IUserStatus.ACTIVE}
  <form method="POST" action="?/deleteUser" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right refuse" aria-label="Delete user"><i class="fa-solid fa-trash"></i></button>
  </form>
  <button
    class="secondary right"
    onclick={() => {
      showEditUserModal = true
      action = 'EDIT'
    }}
    aria-label="Edit user"
  >
    <i class="fa-solid fa-pen"></i>
  </button>
{:else if selectedUser.status === IUserStatus.PENDING}
  <form method="POST" action="?/refuseUser" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right refuse" aria-label="Refuse user"><i class="fa-solid fa-times"></i></button>
  </form>
  <button
    class="secondary right accept"
    onclick={() => {
      showEditUserModal = true
      action = 'ACCEPT'
    }}
    aria-label="Accept user"
  >
    <i class="fa-solid fa-check"></i>
  </button>
{:else if selectedUser.status && (selectedUser.status === IUserStatus.DELETED || selectedUser.status === IUserStatus.SPAM)}
  <form method="POST" action="?/deleteUserForever" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right delete" aria-label="Delete user forever"><i class="fa-solid fa-trash"></i></button>
  </form>
{/if}

<div class="perms">
  <h4>{$l({ username: selectedUser.username }).dashboard.emlatSettings.userManagement.infoOf}</h4>

  <p class="label">{$l.common.username}</p>
  <p>{selectedUser.username}</p>

  {#if selectedUser.status === IUserStatus.ACTIVE}
    <p class="label">{$l.dashboard.emlatSettings.userManagement.permissions}</p>
    {#if selectedUser.isAdmin}
      <p>Admin (all permissions)</p>
    {:else}
      {#if selectedUser.p_filesUpdater >= 1}
        <p>Add, edit and delete files</p>
      {/if}
      {#if selectedUser.p_filesUpdater === 2}
        <p>Change Minecraft loader</p>
      {/if}

      {#if selectedUser.p_bootstraps}
        <p>Change bootstraps files</p>
      {/if}

      {#if selectedUser.p_maintenance}
        <p>Change maintenance status</p>
      {/if}

      {#if selectedUser.p_news || selectedUser.p_newsCategories || selectedUser.p_newsTags}
        {#if selectedUser.p_news >= 1}
          <p>Add news, edit and delete news they created</p>
        {/if}
        {#if selectedUser.p_news === 2}
          <p>Delete any news</p>
        {/if}
        {#if selectedUser.p_newsCategories}
          <p>Add, edit and delete news categories</p>
        {/if}
        {#if selectedUser.p_newsTags}
          <p>Add, edit and delete news tags</p>
        {/if}
      {/if}

      {#if selectedUser.p_backgrounds}
        <p>Change backgrounds</p>
      {/if}

      {#if selectedUser.p_stats === 1}
        <p>View stats</p>
      {:else if selectedUser.p_stats === 2}
        <p>View and delete stats</p>
      {/if}

      {#if !selectedUser.p_filesUpdater && !selectedUser.p_bootstraps && !selectedUser.p_maintenance && !selectedUser.p_news && !selectedUser.p_newsCategories && !selectedUser.p_newsTags && !selectedUser.p_backgrounds && !selectedUser.p_stats}
        <p>No permissions</p>
      {/if}
    {/if}
  {/if}
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
