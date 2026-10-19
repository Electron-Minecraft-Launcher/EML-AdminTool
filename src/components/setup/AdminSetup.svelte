<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit'
  import { l, type LanguageCode } from '../../lib/stores/language'
  import { passwordStrength, type Options } from 'check-password-strength'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { applyAction, enhance } from '$app/forms'
  import type { NotificationCode } from '$lib/utils/notifications'
  import { addNotification } from '$lib/stores/notifications'

  interface Props {
    step: number
    setupData: { language: LanguageCode | ''; dbPassword: string; adminUsername: string; adminPassword: string; instanceName: string }
  }

  let { step = $bindable(), setupData = $bindable() }: Props = $props()

  let showLoader: boolean = $state(false)
  let passwordCfr = $state('')

  const passwordStrengthOptions: Options<string> = [
    { id: 0, value: 'veryWeak', minDiversity: 0, minLength: 0 },
    { id: 1, value: 'weak', minDiversity: 1, minLength: 6 },
    { id: 2, value: 'medium', minDiversity: 2, minLength: 10 },
    { id: 3, value: 'strong', minDiversity: 3, minLength: 12 },
    { id: 4, value: 'veryStrong', minDiversity: 4, minLength: 16 }
  ]

  let pwdStrength: [number, 'veryWeak' | 'weak' | 'medium' | 'strong' | 'veryStrong'] = $derived.by(() => {
    const strength = passwordStrength(setupData.adminPassword, passwordStrengthOptions)
    return [strength.id, strength.value as 'veryWeak' | 'weak' | 'medium' | 'strong' | 'veryStrong']
  })

  function submit(e: SubmitEvent) {
    e.preventDefault()
    if (pwdStrength[0] < 2 || !setupData.adminUsername || passwordCfr !== setupData.adminPassword) return
    step++
  }
</script>

<form onsubmit={submit}>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <h2>{@html $l.setup.step3.title}</h2>
  <p><b>{@html $l.setup.step3.subtitle}</b></p>

  <div>
    <label for="admin-username">{$l.common.username}</label>
    <input type="text" name="admin-username" id="admin-username" bind:value={setupData.adminUsername} />

    <label for="admin-password">{$l.common.password}</label>
    <input type="password" name="admin-password" id="admin-password" bind:value={setupData.adminPassword} />

    <div class="rel-progress">
      <div
        class="rel-progress-in"
        class:progress-0={pwdStrength[0] === 0}
        class:progress-1={pwdStrength[0] === 1}
        class:progress-2={pwdStrength[0] === 2}
        class:progress-3={pwdStrength[0] === 3}
        class:progress-4={pwdStrength[0] === 4}
      ></div>
    </div>
    <span class="rel">{$l.setup.step2[pwdStrength[1]]}</span>

    <label for="admin-password-cfr">{$l.setup.step3.confirmPassword}</label>
    <input type="password" name="admin-password-cfr" id="admin-password-cfr" bind:value={passwordCfr} />
  </div>

  <div class="actions">
    <button type="submit" class="primary" disabled={pwdStrength[0] < 2 || !setupData.adminUsername || passwordCfr !== setupData.adminPassword}>
      {$l.common.next}&nbsp;&nbsp;<i class="fa-solid fa-arrow-right"></i>
    </button>
    <button type="button" class="secondary" onclick={() => step--}><i class="fa-solid fa-arrow-left"></i>&nbsp;&nbsp;{$l.common.back}</button>
  </div>
</form>

<style lang="scss">
  @use '../../../static/scss/setup.scss';

  div.rel-progress {
    width: 130px;
    border-radius: 50rem;
    background-color: #f3f3f3;
    display: inline-block;
    height: 7px;
    margin-top: 13px;
  }

  div.rel-progress-in {
    border-radius: 50rem;
    height: 7px;
    transition: all 0.2s;

    &.progress-0 {
      width: 10%;
      background: #8b0000;
    }

    &.progress-1 {
      width: 25%;
      background: #ad2c0b;
    }

    &.progress-2 {
      width: 50%;
      background: #d86608;
    }

    &.progress-3 {
      width: 75%;
      background: #71bd0d;
    }

    &.progress-4 {
      width: 100%;
      background: #04921c;
    }
  }

  span.rel {
    display: inline-block;
    margin-left: 15px;
    font-weight: 500;
    font-size: 14px;
    margin-top: 10px;
  }
</style>
