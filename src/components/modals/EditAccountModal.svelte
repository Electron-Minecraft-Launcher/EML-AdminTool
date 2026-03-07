<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import ModalTemplate from './__ModalTemplate.svelte'
  import { NotificationCode } from '$lib/utils/notifications'
  import { addNotification } from '$lib/stores/notifications'
  import { l } from '$lib/stores/language'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import getUser from '$lib/utils/user'

  interface Props {
    show: boolean
  }

  let { show = $bindable() }: Props = $props()

  const user = getUser()

  let showLoader = $state(false)
  let username = $state(user.username)
  let password = $state('')
  let passwordCfr = $state('')

  let disabled = $derived.by(() => {
    return !username || (password != '' && password !== passwordCfr)
  })

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        show = false
        window.location.reload()
      }

      await applyAction(result)
    }
  }
</script>

<ModalTemplate size={'s'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/edit" use:enhance={enhanceForm}>
    <h2>{$l.dashboard.account.info.modal.title}</h2>

    <label for="username">{$l.common.username}</label>
    <input type="text" id="username" name="username" bind:value={username} autocomplete="username" />
    {#if user.isAdmin}
      <p class="warn">{$l.dashboard.account.info.modal.usernameWarn}</p>
    {/if}

    <p>{$l.dashboard.account.info.modal.leaveBlankPassword}</p>

    <label for="password">{$l.dashboard.account.info.modal.newPassword}</label>
    <input type="password" id="password" name="password" bind:value={password} autocomplete="new-password" />

    <label for="password-cfr">{$l.dashboard.account.info.modal.confirmPassword}</label>
    <input type="password" id="password-cfr" bind:value={passwordCfr} autocomplete="new-password" />

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary" {disabled}>{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  p.warn {
    margin: 5px 0 0 0;
    color: #fa5650;
    font-size: 12px;
  }

  p.label {
    margin-top: 15px;
  }
</style>
