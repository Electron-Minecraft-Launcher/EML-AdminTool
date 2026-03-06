<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'
  import type { SubmitFunction } from '@sveltejs/kit'
  import type { PageData } from '../../routes/(app)/dashboard/profils/$types'
  import AddEditProfilModal from '../modals/AddEditProfilModal.svelte'

  interface Props {
    selectedProfilId: string
    data: PageData
  }

  let { selectedProfilId = $bindable(), data }: Props = $props()

  let showEditProfilModal = $state(false)
  let selectedProfil = $derived.by(() => data.profils.find((profil) => profil.id === selectedProfilId))!
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

    formData.set('user-id', selectedProfilId)
    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        if (action.search === '?/deleteUserForever') {
          selectedProfilId = data.profils[0]?.id ?? ''
        }
      }

      await applyAction(result)
    }
  }
</script>

{#if showEditProfilModal}
  <AddEditProfilModal bind:show={showEditProfilModal} bind:selectedProfilId={selectedProfilId} {action} {data} />
{/if}

{#if !selectedProfil.isDefault}
  <form method="POST" action="?/deleteProfil" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right refuse" aria-label="Delete profil"><i class="fa-solid fa-trash"></i></button>
  </form>
{/if}
<button
  class="secondary right"
  onclick={() => {
    showEditProfilModal = true
    action = 'EDIT'
  }}
  aria-label="Edit profil"
>
  <i class="fa-solid fa-pen"></i>
</button>

<div class="info">
  <h4 style="margin-bottom: 0">{selectedProfil.name}{@html selectedProfil.isDefault ? ' (default profil)' : ''}</h4>

  <div class="container" style="margin-top: 0;">
    <div>
      <p class="label">{$l.dashboard.emlatSettings.profilManagement.profilName}</p>
      <p>{selectedProfil.name}</p>
    </div>
    <div>
      <p class="label">{$l.dashboard.emlatSettings.profilManagement.profilSlug}</p>
      <p>{selectedProfil.slug}</p>
    </div>
    <div class="flex">
      <div class="ip">
        <p class="label">{$l.dashboard.emlatSettings.profilManagement.ip}</p>
        <p>{selectedProfil.ip ?? '-'}</p>
      </div>
      <div class="separator">
        <p>:</p>
      </div>
      <div class="port">
        <p class="label">{$l.dashboard.emlatSettings.profilManagement.port}</p>
        <p>{selectedProfil.port ?? '-'}</p>
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
