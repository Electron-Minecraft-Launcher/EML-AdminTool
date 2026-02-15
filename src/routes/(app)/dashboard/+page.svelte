<script lang="ts">
  import { l } from '$lib/stores/language'
  import getEnv from '$lib/utils/env'
  import getUser from '$lib/utils/user'
  import type { PageProps } from './$types'
  import { onDestroy, onMount } from 'svelte'

  let { data }: PageProps = $props()

  const env = getEnv()
  const user = getUser()

  let displayTime = $state('')
  let interval: ReturnType<typeof setInterval>

  const timeDelta = data.timeInfo.time - Date.now()

  const clockFormatter = new Intl.DateTimeFormat($l.language, {
    timeZone: data.timeInfo.zone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const dateFormatter = new Intl.DateTimeFormat($l.language, {
    timeZone: data.timeInfo.zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  function updateClock() {
    const currentServerTime = Date.now() + timeDelta
    displayTime = clockFormatter.format(new Date(currentServerTime))
  }
  updateClock()

  onMount(() => {
    interval = setInterval(updateClock, 1000)
  })

  onDestroy(() => {
    clearInterval(interval)
  })
</script>

<svelte:head>
  <title>{env.name} AdminTool</title>
</svelte:head>

<h2>{$l.common.home}</h2>

<h3>{$l({ username: user.username }).dashboard.welcome}</h3>

<div class="flex">
  <div class="widgets">
    <div class="widget">
      <h4>{$l.dashboard.time}</h4>
      <p class="time">{displayTime}</p>
      <p class="zone">{data.timeInfo.zone}</p>
    </div>
    <div class="widget">
      <h4>{$l.dashboard.serverStatus}</h4>
      {#if data.serverStatus}
        {#await data.streamed.pingServer}
          <p class="top">
            <span class="servername">{data.serverStatus.name}</span><span class="server-status-indicator pinging">-</span>
          </p>
          <p class="label">Players</p>
          <p>-</p>
        {:then serverStatus}
          {#if serverStatus}
            <p class="top">
              <span class="servername">{serverStatus.name}</span><span
                class="server-status-indicator"
                class:online={serverStatus.ping >= 0 && serverStatus.ping !== Infinity}
                class:offline={serverStatus.ping === Infinity}>{serverStatus.ping !== Infinity ? `${serverStatus.ping} ms` : '-'}</span
              >
            </p>
            <p class="label">Players</p>
            {#if serverStatus.ping !== Infinity && serverStatus.ping >= 0}
              <p>{serverStatus.players.online} / {serverStatus.players.max}</p>
            {:else}
              <p>-</p>
            {/if}
          {:else}
            <p>{$l.dashboard.undefinedServer}</p>
            {#if user.isAdmin}
              <a class="not-a" href="/dashboard/emlat-settings"><button class="primary">Go to settings</button></a>
            {/if}
          {/if}
        {:catch error}
          <p>{$l.dashboard.undefinedServer}</p>
          {#if user.isAdmin}
            <a class="not-a" href="/dashboard/emlat-settings"><button class="primary">Go to settings</button></a>
          {/if}
        {/await}
      {:else}
        <p>{$l.dashboard.undefinedServer}</p>
        {#if user.isAdmin}
          <a class="not-a" href="/dashboard/emlat-settings"><button class="primary">Go to settings</button></a>
        {/if}
      {/if}
    </div>
    <div class="widget">
      <h4>{$l.dashboard.launcherStatus}</h4>
      <p class="label">Version</p>
      <p>{data.launcherStatus?.version ?? '-'}</p>
      <p class="label">Maintenance</p>
      <p>
        {data.launcherStatus?.maintenance === 'on'
          ? 'On'
          : data.launcherStatus?.maintenance === 'scheduled'
            ? `Scheduled on ${dateFormatter.format(data.launcherStatus?.scheduledStartTime ?? new Date())}`
            : 'Off'}
      </p>
    </div>
  </div>
</div>

<style lang="scss">
  @use '../../../../static/scss/dashboard.scss';

  div.flex {
    display: flex;
    gap: 25px;
    margin-top: 50px;

    h4 {
      margin: 0 0 10px 0;
    }
  }

  div.widgets {
    display: flex;
    gap: 25px;
    flex-direction: column;
  }

  div.widget {
    position: relative;
    background-color: white;
    padding: 30px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    width: 250px;

    h4 {
      margin-bottom: 25px;
    }

    p {
      margin: 0;
    }

    p.time {
      font-size: 2rem;
      font-family: 'JetBrains Mono', Courier, monospace;
      font-weight: 800;
      text-align: center;
      font-variant-numeric: tabular-nums !important;
      margin: 0;
    }

    p.zone {
      text-align: center;
      color: var(--text-secondary);
      margin: 0;
    }

    p.top {
      margin: 0;
      display: flex;
      justify-content: space-between;

      span {
        display: block;

        &.servername {
          font-weight: 600;
          font-size: 1.2rem;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &.server-status-indicator {
          width: 40px;
          font-weight: 600;
          text-align: center;
          font-size: 11px;
          line-height: 1;
          padding: 9px 10px;
          border-radius: 5px;
          background-color: #f0f0f0;
          border: 1px solid var(--border-color);
          margin-left: 10px;
          position: relative;

          &:after {
            content: '';
            display: block;
            position: absolute;
            top: -3px;
            right: -3px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            margin: 0 auto;
          }

          &.online:after {
            background-color: #4caf50;
            outline: 2px solid #4caf5050;
          }

          &.pinging:after {
            background-color: #ff9800;
            outline: 2px solid #ff980050;
          }

          &.offline:after {
            background-color: #be2419;
            outline: 2px solid #c0312750;
          }
        }
      }
    }

    button.primary,
    p.label {
      margin-top: 18px;
    }
  }
</style>
