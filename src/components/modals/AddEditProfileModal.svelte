<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { SubmitFunction } from '@sveltejs/kit'
  import ModalTemplate from './__ModalTemplate.svelte'
  import type { NotificationCode } from '$lib/utils/notifications'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import type { Profile } from '@prisma/client'

  interface Props {
    show: boolean
    selectedProfileId: string | null
    profiles: Profile[]
  }

  const emptyProfile: Profile = {
    id: '',
    name: '',
    slug: '',
    isDefault: false,
    ip: '',
    port: null,
    tcpProtocol: '',
    updatedAt: new Date(),
    createdAt: new Date()
  }

  let { show = $bindable(), selectedProfileId = $bindable(), profiles }: Props = $props()

  let selectedProfile = $state(profiles.find((profile) => profile.id === selectedProfileId) ?? emptyProfile)
  let name = $state(selectedProfile.name)
  let slug = $derived.by(() => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
  })
  let ip = $state(selectedProfile.ip)
  let port = $state(selectedProfile.port)
  let tcpProtocol = $state(selectedProfile.tcpProtocol ?? 'modern')

  let disabled = $derived.by(() => {
    if (selectedProfileId && profiles.some((profile) => (profile.slug === slug || profile.name === name) && profile.id !== selectedProfileId)) {
      return true
    } else if (!selectedProfileId && profiles.some((profile) => profile.slug === slug || profile.name === name)) {
      return true
    }
  })

  let showLoader = $state(false)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('profile-id', selectedProfileId ?? '')

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        show = false
      }

      await applyAction(result)
    }
  }
</script>

<ModalTemplate size={'ms'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/addEditProfile" use:enhance={enhanceForm}>
    <h2>
      {selectedProfileId ? $l.dashboard.emlatSettings.profileManagement.modal.addProfile : $l.dashboard.emlatSettings.profileManagement.modal.title}
    </h2>

    <div class="flex">
      <div>
        <label for="name" style="margin-top: 0">{$l.dashboard.emlatSettings.profileManagement.modal.profileName}</label>
        <input type="text" id="name" name="name" bind:value={name} />
      </div>
      <div>
        <label for="slug" style="margin-top: 0">{$l.dashboard.emlatSettings.profileManagement.modal.profileSlug}</label>
        <input type="text" id="slug" name="slug" bind:value={slug} disabled />
      </div>
    </div>

    <div class="flex">
      <div style="display: flex; flex: 1; gap: 7px; align-items: flex-end">
        <div style="flex: 1">
          <label for="ip">{$l.dashboard.emlatSettings.profileManagement.modal.ip}</label>
          <input type="text" id="ip" name="ip" bind:value={ip} />
        </div>
        <div style="width: 5px; flex: 0; align-self: self-end; margin-bottom: 10px">
          <p class="port-separator">:</p>
        </div>
        <div style="flex: 0.5">
          <label for="port">{$l.dashboard.emlatSettings.profileManagement.modal.port}</label>
          <input type="number" id="port" name="port" bind:value={port} min="1" max="65535" placeholder="25565" />
        </div>
      </div>
      <div style="flex: 0.5;">
        <label for="tcp-protocol">
          {$l.dashboard.emlatSettings.profileManagement.modal.minecraftVersion}&nbsp;&nbsp;<i
            class="fa-solid fa-circle-question"
            style="cursor: help"
            title={$l.dashboard.emlatSettings.profileManagement.modal.minecraftVersionInfo}
          ></i>
        </label>
        <select id="tcp-protocol" name="tcp-protocol" bind:value={tcpProtocol} style="width: 100%">
          <option value="modern">Modern (1.7+)</option>
          <option value="1.6">Legacy (1.6.x)</option>
          <option value="1.4-1.5">Legacy (1.4.x to 1.5.x)</option>
          <option value="beta1.8-1.3">Legacy (beta 1.8 to 1.3)</option>
        </select>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" {disabled}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  p.label {
    margin-top: 15px;
  }

  label.p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: black;
  }

  div.flex {
    display: flex;
    gap: 20px;
    vertical-align: top;
    div {
      flex: 1;
    }
  }
</style>
