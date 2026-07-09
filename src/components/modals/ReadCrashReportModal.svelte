<script lang="ts">
  import { l } from '$lib/stores/language'
  import { onMount } from 'svelte'
  import type { PageData } from '../../routes/(app)/dashboard/crash-reports/$types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { applyAction, enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { addNotification } from '$lib/stores/notifications'
  import { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    show: boolean
    crashReports: NonNullable<PageData['crashReports']>
    selectedCrashReportId: string
  }

  let { show = $bindable(), crashReports, selectedCrashReportId }: Props = $props()

  let showLoader = $state(false)
  let tab: 'metadata' | 'launcher-logs' | 'crash-report' | 'latest-logs' = $state('metadata')

  let selectedCrashReport = $state(crashReports.find((cr) => cr.id === selectedCrashReportId)!)
  let date = $state(selectedCrashReport.date)
  let os = $state(selectedCrashReport.os)
  let arch = $state(selectedCrashReport.arch)
  let javaVersion = $state(selectedCrashReport.javaVersion)
  let javaArch = $state(selectedCrashReport.javaArch)
  let profile = $state(selectedCrashReport.profile)!
  let version = $state(selectedCrashReport.version)
  let loader = $state(selectedCrashReport.loader)
  let loaderVersion = $state(loader !== 'vanilla' ? ' ' + selectedCrashReport.loaderVersion : '')
  let authType = $state(selectedCrashReport.authType)
  let minRam = $state(selectedCrashReport.minRam)
  let maxRam = $state(selectedCrashReport.maxRam)
  let exitCode = $state(selectedCrashReport.exitCode)
  let addressedAt = $state(selectedCrashReport.addressedAt)
  let comment = $state(selectedCrashReport.comment ?? '')
  let createdAt = $state(selectedCrashReport.createdAt)
  let fileId = $state(selectedCrashReport.fileId)
  let launcherLogs: string | null = $state(null)
  let launchArgs: string | null = $state(null)
  let crashReport: string | null = $state(null)
  let latestLogs: string | null = $state(null)

  onMount(async () => {
    const res = await fetch(`/api/crash-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'file-id': fileId
      }
    })
    try {
      const data = await res.text()
      launcherLogs = data.match(/=== LAUNCHER LOGS ===([\s\S]*?)=== LAUNCH ARGUMENTS ===/)?.[1]?.trim() ?? 'No launcher logs.'
      launchArgs = data.match(/=== LAUNCH ARGUMENTS ===([\s\S]*?)=== CRASH REPORT LOG ===/)?.[1]?.trim() ?? 'No launch arguments.'
      crashReport = data.match(/=== CRASH REPORT LOG ===([\s\S]*?)=== LATEST LOG ===/)?.[1]?.trim() ?? 'No crash report.'
      latestLogs = data.match(/=== LATEST LOG ===([\s\S]*)$/)?.[1]?.trim() ?? 'No latest logs.'
    } catch (err) {
      console.error('Error fetching crash report data:', err)
      launcherLogs = 'Error fetching launcher logs.'
      crashReport = 'Error fetching crash report.'
      latestLogs = 'Error fetching latest logs.'
    }
  })

  const enhanceForm: SubmitFunction = ({ formData, submitter }) => {
    showLoader = true
    formData.set('crash-report-id', selectedCrashReportId ?? '')
    formData.set('comment', comment ?? '')
    formData.set('addressed', handleAddredding(submitter as HTMLButtonElement))

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

  function handleAddredding(elt: HTMLButtonElement) {
    if (elt.name === 'mark-addressed') {
      return 'true'
    } 
    if (elt.name === 'mark-unaddressed') {
      return 'false'
    }
    return 'null'
  }
</script>

<ModalTemplate size={'ml'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/editCrashReport" use:enhance={enhanceForm}>
    <h2>Read crash report</h2>

    <div class="data-tabs">
      <button type="button" class:active={tab === 'metadata'} onclick={() => (tab = 'metadata')} aria-label="View metadata">Metadata</button>
      <button type="button" class:active={tab === 'launcher-logs'} onclick={() => (tab = 'launcher-logs')} aria-label="View launcher logs">Launcher logs</button>
      <button type="button" class:active={tab === 'crash-report'} onclick={() => (tab = 'crash-report')} aria-label="View crash report">Crash report</button>
      <button type="button" class:active={tab === 'latest-logs'} onclick={() => (tab = 'latest-logs')} aria-label="View latest logs">Latest logs</button>
    </div>

    {#if tab === 'metadata'}
      <div class="scroll">
        <p class="label">Crash report ID</p>
        <p>#{fileId.substring(0, 7)}</p>

        <p class="label">Exit code</p>
        <p>{exitCode}</p>

        <p class="label">Date</p>
        <p>
          {new Date(date).toLocaleDateString()}
          {new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          (submitted on {new Date(createdAt).toLocaleDateString()}
          {new Date(createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })})
        </p>

        <p class="label">Profile</p>
        <p>
          {profile} (Minecraft {version}
          {loader.firstCharToUpperCase() || 'Vanilla'}{loaderVersion})
        </p>

        <p class="label">Auth type</p>
        <p>{authType}</p>

        <p class="label">Java</p>
        <p>Java {javaVersion} ({javaArch})</p>

        <p class="label">Allocated memory</p>
        <p>Min: {minRam} MB — Max: {maxRam} MB</p>

        <p class="label">OS</p>
        <p>{os} ({arch})</p>

        <p class="label">Comment</p>
        <input name="comment" bind:value={comment} />
      </div>
    {:else if tab === 'launcher-logs'}
      <div class="scroll">
        {#if !launcherLogs}
          <LoadingSplash transparent={true}></LoadingSplash>
        {:else}
          <pre>{launcherLogs}</pre>
          <p class="label">Launch arguments</p>
          <pre style="white-space: pre-wrap; word-break: break-word;">{launchArgs}</pre>
        {/if}
      </div>
    {:else if tab === 'crash-report'}
      <div class="scroll">
        {#if !crashReport}
          <LoadingSplash transparent={true}></LoadingSplash>
        {:else}
          <pre>{crashReport}</pre>
        {/if}
      </div>
    {:else if tab === 'latest-logs'}
      <div class="scroll">
        {#if !latestLogs}
          <LoadingSplash transparent={true}></LoadingSplash>
        {:else}
          <pre>{latestLogs}</pre>
        {/if}
      </div>
    {/if}

    <div class="actions">
      <div class="addressed">
        {#if addressedAt}
          <p>
            <i class="fa-solid fa-circle-check" style="color: var(--green-color);"></i>&nbsp;&nbsp;Addressed on
            {new Date(addressedAt).toLocaleDateString()}
          </p>
        {:else}
          <p><i class="fa-solid fa-circle-xmark" style="color: var(--red-color);"></i>&nbsp;&nbsp;Not addressed</p>
        {/if}
      </div>
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" onclick={() => (show = false)}>{$l.common.save}</button>
      {#if addressedAt}
        <button type="submit" class="primary" name="mark-unaddressed" onclick={() => (show = false)}>{$l.common.save} & Mark as unaddressed</button>
      {:else}
        <button type="submit" class="primary" name="mark-addressed" onclick={() => (show = false)}>{$l.common.save} & Mark as addressed</button>
      {/if}
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  form {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  button.secondary {
    margin-top: 30px;
  }

  div.data-tabs {
    display: flex;
    gap: 10px;
    border-bottom: 2px solid var(--border-color);
    overflow-x: auto;
    overflow-y: hidden;

    button {
      border: none;
      border-bottom: 2px solid transparent;
      border-radius: 5px 5px 0 0;
      background: none;
      padding: 15px 20px;
      font-weight: bold;
      color: #565656 !important;
      font-size: 1em;

      &.active {
        color: var(--primary-color) !important;
        border-bottom: 2px solid var(--primary-color);
      }
    }
  }

  div.scroll {
    height: calc(100% - 190px);
    overflow-y: auto;
    padding-bottom: 5px;
    position: relative;
  }

  pre {
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    line-height: 1.4em;
  }

  div.addressed {
    margin-top: 35px;
    margin-right: auto;
    float: left;

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
      display: inline-block;
    }
  }
</style>
