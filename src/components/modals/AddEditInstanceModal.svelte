<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { PageData, SubmitFunction } from '../../routes/(app)/dashboard/emlat-settings/$types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import type { NotificationCode } from '$lib/utils/notifications'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import type { Instance } from '@prisma/client'

  interface Props {
    show: boolean
    selectedInstanceId: string
    action: 'ADD' | 'EDIT'
    data: PageData
    scroll?: HTMLDivElement | null
  }

  const emptyInstance: Instance = {
    id: '',
    name: '',
    slug: '',
    isDefault: false,
    ip: '',
    port: 25565,
    tcpProtocol: '',
    updatedAt: new Date(),
    createdAt: new Date()
  }

  let { show = $bindable(), selectedInstanceId = $bindable(), action, data, scroll = $bindable(null) }: Props = $props()

  let selectedInstance = $state(data.instances.find((instance) => instance.id === selectedInstanceId) ?? emptyInstance)
  let name = $state(selectedInstance.name)
  let slug = $derived.by(() => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
  })
  let ip = $state(selectedInstance.ip)
  let port = $state(selectedInstance.port ?? 25565)
  let tcpProtocol = $state(selectedInstance.tcpProtocol ?? 'modern')

  let showLoader = $state(false)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('user-id', selectedInstanceId)

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

  <form method="POST" action="?/addEditInstance" use:enhance={enhanceForm}>
    <h2>
      {action === 'ADD' ? $l.dashboard.emlatSettings.instanceManagement.modal.addInstance : $l.dashboard.emlatSettings.instanceManagement.modal.title}
    </h2>

    <div class="flex">
      <div>
        <label for="name" style="margin-top: 0">{$l.dashboard.emlatSettings.instanceManagement.modal.instanceName}</label>
        <input type="text" id="name" name="name" bind:value={name} />
      </div>
      <div>
        <label for="slug" style="margin-top: 0">{$l.dashboard.emlatSettings.instanceManagement.modal.instanceSlug}</label>
        <input type="text" id="slug" name="slug" bind:value={slug} disabled />
      </div>
    </div>

    <div class="flex">
      <div style="display: flex; flex: 1; gap: 7px; align-items: flex-end">
        <div style="flex: 1">
          <label for="ip">{$l.dashboard.emlatSettings.instanceManagement.modal.ip}</label>
          <input type="text" id="ip" name="ip" bind:value={ip} />
        </div>
        <div style="width: 5px; flex: 0; align-self: self-end; margin-bottom: 10px">
          <p class="port-separator">:</p>
        </div>
        <div style="flex: 0.5">
          <label for="port">{$l.dashboard.emlatSettings.instanceManagement.modal.port}</label>
          <input type="number" id="port" name="port" bind:value={port} min="1" max="65535" />
        </div>
      </div>
      <div style="flex: 0.5;">
        <label for="mc-version"
          >{$l.dashboard.emlatSettings.instanceManagement.modal.minecraftVersion}&nbsp;&nbsp;<i
            class="fa-solid fa-circle-question"
            style="cursor: help"
            title={$l.dashboard.emlatSettings.instanceManagement.modal.minecraftVersionInfo}
          ></i></label
        >
        <select id="mc-version" name="minecraftVersion" bind:value={tcpProtocol} style="width: 100%">
          <option value="modern">Modern (1.7+)</option>
          <option value="1.6">Legacy (1.6.x)</option>
          <option value="1.4-1.5">Legacy (1.4.x to 1.5.x)</option>
          <option value="beta1.8-1.3">Legacy (beta 1.8 to 1.3)</option>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary">{$l.common.save}</button>
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
