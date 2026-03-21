<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { SubmitFunction } from '@sveltejs/kit'
  import ModalTemplate from './__ModalTemplate.svelte'
  import type { NotificationCode } from '$lib/utils/notifications'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import type { Profile } from '@prisma/client'
  import type { PageData } from '../../routes/(app)/dashboard/profiles/$types'

  interface Props {
    show: boolean
    selectedProfileIdModal: string | null
    selectedProfileId: string
    data: PageData
  }

  let { show = $bindable(), selectedProfileIdModal = $bindable(null), selectedProfileId = $bindable(), data }: Props = $props()

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

  let selectedProfile = $state(data.profiles.find((profile) => profile.id === selectedProfileIdModal) ?? emptyProfile)
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
  let permissions = $state(
    data.users.map((u) => {
      const existing = data.userPermissions.find((p) => p.profileId === selectedProfileId && p.userId === u.id)
      return {
        userId: u.id,
        p1: (existing?.permission ?? 0) >= 1,
        p2: (existing?.permission ?? 0) === 2
      }
    })
  )

  let disabled = $derived.by(() => {
    if (
      selectedProfileIdModal &&
      data.profiles.some((profile) => (profile.slug === slug || profile.name === name) && profile.id !== selectedProfileIdModal)
    ) {
      return true
    } else if (!selectedProfileIdModal && data.profiles.some((profile) => profile.slug === slug || profile.name === name)) {
      return true
    }
  })

  let showLoader = $state(false)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    const serializedPermissions = permissions.map((p) => ({
      userId: p.userId,
      permission: p.p2 ? 2 : p.p1 ? 1 : 0
    }))

    formData.set('profile-id', selectedProfileIdModal ?? '')
    formData.set('permissions', JSON.stringify(serializedPermissions))

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        selectedProfileId = result.data?.profileId ?? selectedProfileId
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
      {selectedProfileIdModal
        ? $l.dashboard.emlatSettings.profileManagement.modal.addProfile
        : $l.dashboard.emlatSettings.profileManagement.modal.title}
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

    {#if data.users.length > 0}
      <p class="label" style="margin-top: 20px">{$l.dashboard.emlatSettings.userManagement.modal.permissions}</p>
      <div class="permissions">
        {#each data.users as user, i}
          <div class="permission">
            <p>{user.username}</p>
            <div class="right">
              <label class="p" for="perm-{user.id}-1">
                <input
                  type="checkbox"
                  id="perm-{user.id}-1"
                  bind:checked={permissions[i].p1}
                  onchange={() => {
                    if (!permissions[i].p1) permissions[i].p2 = false
                  }}
                />
                Add, edit and delete files
              </label>
              <label class="p" for="perm-{user.id}-2">
                <input
                  type="checkbox"
                  id="perm-{user.id}-2"
                  bind:checked={permissions[i].p2}
                  onchange={() => {
                    if (permissions[i].p2) permissions[i].p1 = true
                  }}
                />
                Change Minecraft loader
              </label>
            </div>
          </div>
        {/each}
      </div>
    {/if}

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

  div.permissions {
    max-height: 200px;
    overflow-y: auto;
  }
  
  div.permission {
    display: flex;
    gap: 20px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    padding: 5px;
    margin-top: 5px;

    &:first-child {
      margin-top: 0;
    }

    p {
      width: 150px;
      text-align: right;
      font-weight: 500;
      margin: 0;
    }

    label {
      margin-top: 0;
    }
  }
</style>
