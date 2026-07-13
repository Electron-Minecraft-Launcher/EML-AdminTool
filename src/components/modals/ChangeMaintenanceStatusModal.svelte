<script lang="ts">
  import ModalTemplate from './__ModalTemplate.svelte'
  import Toggle from '../layouts/Toggle.svelte'
  import { l } from '$lib/stores/language'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import { NotificationCode } from '$lib/utils/notifications'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { DateTime } from 'luxon'
  import AllowedPseudos from '../contents/AllowedPseudos.svelte'
  import type { PageData } from '../../routes/(app)/dashboard/maintenance/$types'
  import getUser from '$lib/utils/user'

  interface Props {
    maintenance: PageData['maintenance']
    show: boolean
  }

  let { maintenance, show = $bindable() }: Props = $props()

  const user = getUser()

  const startDateInfo = 'Maintenance starts automatically on the date.'
  const endDateInfo = `Maintenance will NOT end on this date; this date is given as an indication for Launcher users.
You will need to disable maintenance manually.`

  let showLoader = $state(false)

  let status = $state(Boolean(maintenance.startTime))
  let message = $state(maintenance.message ?? '')
  let startTime = $state(maintenance.startTime ? new Date(maintenance.startTime).formatDateInput() : '')
  let endTime = $state(maintenance.endTime ? new Date(maintenance.endTime).formatDateInput() : '')
  let allowedPseudos = $state(maintenance.allowedPseudos ?? [])

  $effect(() => {
    if (!status) {
      startTime = ''
      endTime = ''
      message = ''
    }
  })

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    const utcStartTime = DateTime.fromISO(startTime, { zone: 'local' }).toUTC().toISO() ?? ''
    const utcEndTime = DateTime.fromISO(endTime, { zone: 'local' }).toUTC().toISO() ?? ''
    formData.set('start-time', utcStartTime)
    formData.set('end-time', utcEndTime)
    for (const pseudo of allowedPseudos) formData.append('allowed-pseudos', pseudo)

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

  <form method="POST" action="?/changeMaintenanceStatus" use:enhance={enhanceForm}>
    <h2>Change maintenance status</h2>

    <div class="flex">
      <div style="flex: 0.6">
        <p class="label" style="margin-top: 0">Maintenance status</p>
        <Toggle bind:status />
      </div>
      <div>
        <label for="message" style="margin-top: 0">Reason</label>
        <input type="text" name="message" id="message" bind:value={message} disabled={!status} />
      </div>
    </div>

    <div class="flex">
      <div>
        <label for="start-time">
          Start time ({DateTime.local().zoneName} time)&nbsp;&nbsp;<i class="fa-solid fa-circle-question" title={startDateInfo} style="cursor: help"
          ></i>
        </label>
        <input type="datetime-local" name="start-time" id="start-time" bind:value={startTime} disabled={!status} />
      </div>
      <div>
        <label for="end-time">
          End time ({DateTime.local().zoneName} time)&nbsp;&nbsp;<i class="fa-solid fa-circle-question" title={endDateInfo} style="cursor: help"></i>
        </label>
        <input type="datetime-local" name="end-time" id="end-time" bind:value={endTime} disabled={!status} />
      </div>
    </div>

    {#if user.p_maintenance === 2 || user.isAdmin}
      <div class="flex">
        <div class="note" style="flex: 0.7">
          <p class="note"><i class="fa-solid fa-circle-info"></i>&nbsp;&nbsp;Note</p>
          <p>
            Enabling maintenance is not a security measure. It only displays a maintenance screen to users and can be easily bypassed by anyone.
            Allowed pseudos will never see the maintenance screen. <a
              href="https://emlproject.com/docs/eml-admintool/administration-and-features/maintenance"
              target="_blank">Learn more...</a
            >
          </p>
        </div>
        <div>
          <AllowedPseudos bind:allowedPseudos={allowedPseudos} label="Allowed pseudos to bypass maintenance" />
        </div>
      </div>
    {/if}

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary">{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  div.flex {
    display: flex;
    gap: 20px;
    vertical-align: top;

    div {
      flex: 1;
    }
  }

  div.note {
    margin-top: 10px;
    height: 226px;

    p {
      font-size: 14px;
      color: #505050;
      margin: 0;
    }

    p.note {
      color: #0869da;
      font-weight: 600;
      margin-bottom: 5px;
      margin-top: 30px;
    }
  }
</style>
