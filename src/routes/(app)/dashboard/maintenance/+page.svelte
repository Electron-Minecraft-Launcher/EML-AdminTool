<script lang="ts">
  import getEnv from '$lib/utils/env'
  import { DateTime } from 'luxon'
  import ChangeMaintenanceStatusModal from '../../../../components/modals/ChangeMaintenanceStatusModal.svelte'
  import type { PageProps } from './$types'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'
  import { invalidateAll } from '$app/navigation'
  import getUser from '$lib/utils/user'

  let { data }: PageProps = $props()

  const env = getEnv()
  const user = getUser()

  const startDateInfo = 'Maintenance starts automatically on the date.'
  const endDateInfo = `Maintenance will NOT end on this date; this date is given as an indication for Launcher users.
You will need to disable maintenance manually.`

  let showChangeMaintenanceStatusModal = $state(false)

  async function turnMaintenanceOff() {
    const formData = new FormData()
    await callAction({ url: '/dashboard/maintenance', action: 'changeMaintenanceStatus', formData }, $l)
    invalidateAll()
  }
</script>

<svelte:head>
  <title>Maintenance • {env.name} AdminTool</title>
</svelte:head>

{#if showChangeMaintenanceStatusModal}
  <ChangeMaintenanceStatusModal bind:show={showChangeMaintenanceStatusModal} maintenance={data.maintenance} />
{/if}

<h2>Maintenance</h2>

<section class="section">
  <button class="secondary right" onclick={() => (showChangeMaintenanceStatusModal = true)} aria-label="Change maintenance status"
    ><i class="fa-solid fa-ellipsis"></i></button
  >

  <h3>Maintenance</h3>

  <div class="container">
    <div>
      <p class="label">Status</p>
      {#if !data.maintenance?.startTime}
        <p class="no-link off">OFF</p>
        <button class="off" onclick={() => (showChangeMaintenanceStatusModal = true)}>
          <i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Turn on...
        </button>
      {:else}
        <p class="no-link on">ON</p>
        <button class="on" onclick={turnMaintenanceOff}><i class="fa-solid fa-power-off"></i>&nbsp;&nbsp;Turn off</button>
      {/if}
    </div>

    <div>
      <p class="label">Reason</p>
      {#if data.maintenance?.message && data.maintenance.message.length > 0}
        <p class="no-link">{data.maintenance.message}</p>
      {:else}
        <p class="no-link">-</p>
      {/if}
    </div>

    <div>
      <p class="label">
        Start date ({DateTime.local().zoneName} time)&nbsp;&nbsp;<i class="fa-solid fa-circle-question" title={startDateInfo} style="cursor: help"
        ></i>
      </p>
      {#if data.maintenance?.startTime}
        <p class="no-link">{new Date(data.maintenance.startTime).formatDate()}</p>
      {:else}
        <p class="no-link">-</p>
      {/if}
    </div>

    <div>
      <p class="label">
        End date ({DateTime.local().zoneName} time)&nbsp;&nbsp;<i class="fa-solid fa-circle-question" title={endDateInfo} style="cursor: help"></i>
      </p>
      {#if data.maintenance?.endTime}
        <p class="no-link">{new Date(data.maintenance.endTime).formatDate()}</p>
      {:else if data.maintenance?.startTime}
        <p class="no-link">Undefined</p>
      {:else}
        <p class="no-link">-</p>
      {/if}
    </div>

    {#if user.p_maintenance === 2 || user.isAdmin}
      <div>
        <p class="label">Allowed pseudos</p>
        {#each data.maintenance?.allowedPseudos as pseudo}
          <p class="allowed-pseudo">{pseudo}</p>
        {:else}
          <p>-</p>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  div.container button {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 250px;
    vertical-align: bottom;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;

    &:hover {
      background: #eeeeee;
    }

    &.off {
      display: inline-block;
      border-bottom: none;
      margin-left: 5px;
      position: relative;
      background: none;
      color: var(--green-color);
      vertical-align: middle;

      &:hover {
        background: #eefaee;
      }
    }

    &.on {
      display: inline-block;
      border-bottom: none;
      margin-left: 5px;
      position: relative;
      background: none;
      color: var(--red-color);
      vertical-align: middle;

      &:hover {
        background: #faeeee;
      }
    }
  }

  p.no-link {
    margin: 0px;
    display: inline-block;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  p.allowed-pseudo {
    display: inline-block;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--secondary-color);
    color: #505050;
    margin-right: 5px;
  }
</style>
