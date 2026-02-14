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
    tcpPvn: '',
    updatedAt: new Date(),
    createdAt: new Date()
  }

  let { show = $bindable(), selectedInstanceId = $bindable(), action, data, scroll = $bindable(null) }: Props = $props()

  let selectedInstance = $state(data.instances.find((instance) => instance.id === selectedInstanceId) ?? emptyInstance)
  let name = $state(selectedInstance.name)
  let slug = $state(selectedInstance.slug)
  let ip = $state(selectedInstance.ip)
  let port = $state(selectedInstance.port)
  let tcpProtocol = $state(selectedInstance.tcpProtocol)
  let tcpPvn = $state(selectedInstance.tcpPvn)

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

    <label for="name" style="margin-top: 0">{$l.dashboard.emlatSettings.instanceManagement.modal.instanceName}</label>
    <input type="text" id="name" name="name" bind:value={name} />

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

  div.permission {
    display: flex;
    gap: 20px;
    margin-top: 5px;

    p {
      width: 200px;
      text-align: right;
      font-weight: 500;
    }

    label {
      margin-top: 0;
    }
  }
</style>
