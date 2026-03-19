<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'
  import type { SubmitFunction } from '@sveltejs/kit'
  import AddEditProfileModal from '../modals/AddEditProfileModal.svelte'
  import type { Profile } from '@prisma/client'

  interface Props {
    profiles: Profile[]
    selectedProfileId: string
    selectedProfileIdModal: string | null
    showAddEditProfileModal: boolean
  }

  let { profiles, selectedProfileId = $bindable(), selectedProfileIdModal = $bindable(null), showAddEditProfileModal: showEditProfileModal = $bindable(false) }: Props = $props()

  let selectedProfile = $derived.by(() => profiles.find((profile) => profile.id === selectedProfileId))!

  const tcpProtocols = {
    modern: 'Modern (1.7+)',
    '1.6': 'Legacy (1.6.x)',
    '1.4-1.5': 'Legacy (1.4.x-1.5.x)',
    'beta1.8-1.3': 'Legacy (Beta 1.8-1.3)'
  }

  const enhanceForm: SubmitFunction = ({ action, formData, cancel }) => {
    // TODO
    const warning =
      'Are you sure you want to delete this profile? This action cannot be undone, and all users using this profile will be switched to the default profile. All data associated with this profile will be permanently deleted.'
    if (!confirm(warning)) {
      cancel()
      return
    }

    formData.set('profile-id', selectedProfileId ?? '')
    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      }

      await applyAction(result)
    }
  }
</script>

{#if showEditProfileModal}
  <AddEditProfileModal bind:show={showEditProfileModal} bind:selectedProfileId={selectedProfileIdModal} {profiles} />
{/if}

{#if !selectedProfile.isDefault}
  <form method="POST" action="?/deleteProfile" use:enhance={enhanceForm}>
    <button type="submit" class="secondary right refuse" aria-label="Delete profile"><i class="fa-solid fa-trash"></i></button>
  </form>
{/if}
<button
  class="secondary right"
  onclick={() => {
    selectedProfileIdModal = selectedProfileId
    showEditProfileModal = true
  }}
  aria-label="Edit profile"
>
  <i class="fa-solid fa-pen"></i>
</button>

<div class="info">
  <h4 style="margin-bottom: 0">{selectedProfile.name}{@html selectedProfile.isDefault ? ' (default profile)' : ''}</h4>

  <div class="container" style="margin-top: 0;">
    <div>
      <p class="label">{$l.dashboard.emlatSettings.profileManagement.profileName}</p>
      <p>{selectedProfile.name}</p>
    </div>
    <div>
      <p class="label">{$l.dashboard.emlatSettings.profileManagement.profileSlug}</p>
      <p>{selectedProfile.slug}</p>
    </div>
    <div class="flex">
      <div class="ip">
        <p class="label">{$l.dashboard.emlatSettings.profileManagement.ip}</p>
        <p>{selectedProfile.ip || '-'}</p>
      </div>
      <div class="separator">
        <p>:</p>
      </div>
      <div class="port">
        <p class="label">{$l.dashboard.emlatSettings.profileManagement.port}</p>
        <p>{selectedProfile.port || '-'}</p>
      </div>
      <div class="version">
        <p class="label">{$l.dashboard.emlatSettings.profileManagement.minecraftVersion}</p>
        <p>{selectedProfile.tcpProtocol ? tcpProtocols[selectedProfile.tcpProtocol as keyof typeof tcpProtocols] : '-'}</p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  div.info {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
  }

  div.flex {
    flex: 1;
    display: flex;
    gap: 4px;
    align-items: center;

    .ip {
      text-align: right;
      min-width: 150px;
      width: fit-content;
    }

    .separator {
      width: 5px;
      margin-top: 57.5px;
    }

    .port {
      width: 80px;

      p:not(.label) {
        text-align: left;
      }
    }

    .version {
      padding-left: 15px;
      flex: 1;
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
