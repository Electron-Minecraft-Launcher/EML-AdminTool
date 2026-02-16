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

<div class="info">
  <h4 style="margin-bottom: 0">{selectedInstance.name}</h4>

  <div class="container" style="margin-top: 0;">
    <div>
      <p class="label">{$l.dashboard.emlatSettings.instanceManagement.instanceName}</p>
      <p>{selectedInstance.name}</p>
    </div>
    <div>
      <p class="label">{$l.dashboard.emlatSettings.instanceManagement.instanceSlug}</p>
      <p>{selectedInstance.id}</p>
    </div>
    <div class="flex">
      <div class="ip">
        <p class="label">{$l.dashboard.emlatSettings.instanceManagement.ip}</p>
        <p>{selectedInstance.ip ?? 'unset'}</p>
      </div>
      <div class="separator">
        <p>:</p>
      </div>
      <div class="port">
        <p class="label">{$l.dashboard.emlatSettings.instanceManagement.port}</p>
        <p>{selectedInstance.port ?? 'unset'}</p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  div.info {
    min-height: 200px;
    max-height: 300px;
    overflow-y: auto;
  }

  div.flex {
    display: flex;
    gap: 4px;
    align-items: center;

    .ip {
      text-align: right;
      min-width: 150px;
      width: fit-content;

      p:not(.label) {
      }
    }

    .separator {
      width: 5px;
      margin-top: 57.5px;
    }
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
