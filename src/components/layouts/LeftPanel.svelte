<script lang="ts">
  import { page } from '$app/state'
  import { l } from '$lib/stores/language'
  import { sleep } from '$lib/utils/utils'
  import { slide } from 'svelte/transition'
  import getUser from '$lib/utils/user'
  import { applyAction, enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    leftPanelOpen?: boolean
  }

  let { leftPanelOpen = $bindable(true) }: Props = $props()

  const user = getUser()

  const randomWidth = { times: 100, min: 50 }
  const height = '21px'
  const customStyle: { [key: string]: string }[] = [{ display: 'block' }, { margin: '30px 15px 20px 15px' }]

  let accountDropdownOpen = $state(false)

  async function accountClick() {
    if (!accountDropdownOpen) {
      await sleep(200)
      accountDropdownOpen = true
    }
  }

  const enhanceForm: SubmitFunction = ({ formData }) => {
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

<svelte:body onclick={() => (accountDropdownOpen = false)} />

<nav class:closed={!leftPanelOpen}>
  <button class="toggle-left-panel" onclick={() => (leftPanelOpen = !leftPanelOpen)} aria-label="Toggle left panel">
    {#if leftPanelOpen}
      <i class="fa-solid fa-chevron-left"></i>
    {:else}
      <i class="fa-solid fa-chevron-right"></i>
    {/if}
  </button>

  <div class="toggle-left-panel"></div>

  <div class="hoverable"></div>

  {#if leftPanelOpen}
    <h1>EML AdminTool</h1>
  {:else}
    <h1><span>EML</span>AT</h1>
  {/if}

  <a href="/dashboard" class:active={page.url.pathname == '/dashboard'}><i class="fa-solid fa-house"></i>{$l.common.home}</a>
  {#if user.isAdmin}
    <a href="/dashboard/emlat-settings" class:active={page.url.pathname == '/dashboard/emlat-settings'}>
      <i class="fa-solid fa-gear"></i>{$l.leftPanel.settings}
    </a>
    <a href="/dashboard/profils" class:active={page.url.pathname == '/dashboard/profils'}>
      <i class="fa-solid fa-window-restore"></i>{$l.leftPanel.profils}
    </a>
  {/if}

  {#if leftPanelOpen}
    <h4>{$l.leftPanel.features}</h4>
  {:else}
    <div class="h4"><hr style="border-color: #505050; border-top: 0; position: relative; top: 5px;" /></div>
  {/if}

  {#if user.p_filesUpdater}
    <a href="/dashboard/files-updater" class:active={page.url.pathname == '/dashboard/files-updater'}>
      <i class="fa-solid fa-folder-open"></i>Files Updater
    </a>
  {/if}

  {#if user.p_bootstraps}
    <a href="/dashboard/bootstraps" class:active={page.url.pathname == '/dashboard/bootstraps'}>
      <i class="fa-solid fa-arrows-rotate"></i>Bootstraps
    </a>
  {/if}

  {#if user.p_maintenance}
    <a href="/dashboard/maintenance" class:active={page.url.pathname == '/dashboard/maintenance'}>
      <i class="fa-solid fa-screwdriver-wrench"></i>Maintenance
    </a>
  {/if}

  {#if user.p_news}
    <a href="/dashboard/news" class:active={page.url.pathname == '/dashboard/news'}>
      <i class="fa-solid fa-newspaper"></i>News
    </a>
  {/if}

  {#if user.p_backgrounds}
    <a href="/dashboard/backgrounds" class:active={page.url.pathname == '/dashboard/backgrounds'}>
      <i class="fa-solid fa-image"></i>Backgrounds
    </a>
  {/if}

  {#if user.p_stats}
    <a href="/dashboard/stats" class:active={page.url.pathname == '/dashboard/stats'}>
      <i class="fa-solid fa-chart-simple"></i>Stats
    </a>
  {/if}

  {#if leftPanelOpen}
    <button class="account" onclick={accountClick}>
      <i class="fa-solid fa-circle-user"></i>{user.username}<i class="fa-solid fa-caret-up"></i>
    </button>
  {/if}

  {#if accountDropdownOpen}
    <div class="account-dropdown" id="account-dropdown" transition:slide={{ duration: 200 }}>
      <a href="/dashboard/account" class="account-settings" class:active={page.url.pathname == '/dashboard/account'}>
        <i class="fa-solid fa-gear"></i>{$l.leftPanel.settings}
      </a>
      <form method="POST" action="/dashboard?/logout" use:enhance={enhanceForm}>
        <button type="submit" class="account-logout"><i class="fa-solid fa-right-from-bracket"></i>{$l.leftPanel.logout}</button>
      </form>
    </div>
  {/if}
</nav>

<style lang="scss">
  nav {
    background: white;
    border-right: 1px solid var(--border-color);
    padding: 30px;
    position: fixed;
    left: 0;
    top: 0;
    width: 200px;
    height: 100%;
    transition: all 0.3s;

    &.closed {
      width: 46px;

      h1 {
        line-height: 1;
        max-height: 35px;
        margin-bottom: 35px;

        span {
          font-size: 15px;
          display: block;
        }
      }

      a.account {
        width: 16px;

        i.fa-caret-up {
          display: none;
        }

        &:hover {
          color: var(--primary-color-hover);
          background: #eeeeee;
        }
      }
    }

    div.toggle-left-panel {
      width: 39px;
      height: 43px;
      background: white;
      position: absolute;
      right: 0;
    }

    div.hoverable {
      height: 100%;
      width: 39px;
      position: absolute;
      top: 0;
      right: -39px;
      z-index: -1;
    }

    button.toggle-left-panel {
      width: 39px;
      border: 1px solid var(--border-color);
      border-left: none;
      border-radius: 0 10px 10px 0;
      background: white;
      position: absolute;
      transition:
        right 0.3s,
        opacity 0.3s;
      right: 0;
    }

    &:hover button.toggle-left-panel,
    div.hoverable:hover button.toggle-left-panel,
    button.toggle-left-panel:hover {
      right: -39px;
    }
  }

  h1 {
    margin: 5px 0 40px 0;
    font-size: 20px;
    max-height: 30px;
    color: #202020;
    text-align: center;
    transition: all 0.3s;
    white-space: nowrap;
    overflow: hidden;
    background: white;
    z-index: 100;
    position: relative;
  }

  h4 {
    color: #505050;
    margin-top: 30px;
    font-size: 14px;
  }

  div.h4 {
    height: 21px;
    color: #505050;
    margin-top: 30px;
    margin-bottom: 18.6px;
    font-size: 14px;
  }

  a {
    display: block;
    margin-top: 10px;
    border-bottom: none;
    color: #1e1e1e;
    border-radius: 5px;
    padding: 10px 15px !important;
    font-size: 14px;
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    &:hover,
    &.active:hover {
      color: var(--primary-color-hover);
      background: #eeeeee;
    }

    &.active {
      background: #f5f5f5;
    }

    i.fa-solid {
      display: inline-block;
      margin-right: 15px;
      height: 16px;
      width: 16px;
    }

    i.fa-solid.fa-caret-up {
      padding: 14px 15px 13px 15px;
      margin-right: 0;
      position: absolute;
      right: 0;
      top: 0;
      border-radius: 5px;
      transition: all 0.2s ease;
      width: auto;
      height: 14px;
    }

    &.account:hover {
      color: #1e1e1e;

      i.fa-caret-up {
        color: var(--primary-color-hover);
        background: #eeeeee;
      }
    }
  }

  button.account {
    display: block;
    margin-top: 10px;
    border-bottom: none;
    color: #1e1e1e;
    background: transparent;
    border-radius: 5px;
    padding: 10px 15px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    position: absolute;
    bottom: 90px;
    width: 200px;
    text-align: left;
    height: 41px;

    i.fa-solid.fa-caret-up {
      padding: 14px 15px 13px 15px;
      margin-right: 0;
      position: absolute;
      right: 0;
      top: 0;
      border-radius: 5px !important;
      transition: all 0.2s ease;
      width: auto;
      height: 14px;
    }

    &.account:hover {
      color: #1e1e1e;

      i.fa-caret-up {
        color: var(--primary-color-hover);
        background: #eeeeee;
      }
    }

    &.active {
      background: #f5f5f5;
    }

    i.fa-solid {
      display: inline-block;
      margin-right: 15px;
      height: 16px;
      width: 16px;
    }
  }

  div.account-dropdown {
    overflow-y: hidden;
    border-radius: 5px;
    transition:
      opacity 0.2s,
      height 0.2s ease,
      display 0s;
    background: white;
    padding: 10px;
    border: 1px solid var(--border-color);
    z-index: 100;
    position: absolute;
    width: 178px;
    bottom: 142px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);

    > a:nth-of-type(1) {
      margin-top: 0;
    }

    button.account-logout {
      display: block;
      margin-top: 10px;
      border-bottom: none;
      color: #1e1e1e;
      background: transparent;
      border-radius: 5px;
      padding: 10px 15px;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
      width: 178px;
      text-align: left;
      height: 41px;
      color: var(--red-color);

      &:hover {
        background: #faeeee;
      }

      i.fa-solid {
        display: inline-block;
        margin-right: 15px;
        height: 16px;
        width: 16px;
      }
    }
  }
</style>
