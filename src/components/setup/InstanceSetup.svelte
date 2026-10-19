<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit'
  import { l, type LanguageCode } from '../../lib/stores/language'
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

  let slug = $derived.by(() => {
    return setupData.instanceName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
  })

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.append('language', setupData.language)
    formData.append('db-password', setupData.dbPassword)
    formData.append('admin-username', setupData.adminUsername)
    formData.append('admin-password', setupData.adminPassword)
    formData.append('instance-name', setupData.instanceName)

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        step++
      }

      await applyAction(result)
    }
  }
</script>

<form method="POST" action="?/setup" use:enhance={enhanceForm}>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <h2>{@html $l.setup.step4.title}</h2>
  <p><b>{@html $l.setup.step4.subtitle}</b></p>

  <div class="flex">
    <div>
      <label for="instance-name">{$l.setup.step4.placeholder}</label>
      <input type="text" name="instance-name" id="instance-name" bind:value={setupData.instanceName} />
    </div>
    <div>
      <label for="instance-slug">{$l.setup.step4.slugPlaceholder}</label>
      <input type="text" name="instance-slug" id="instance-slug" bind:value={slug} disabled />
    </div>
  </div>

  <div class="actions">
    <button type="submit" class="primary" disabled={setupData.instanceName.trim().length < 2 || setupData.instanceName.trim().length > 64}>
      {$l.common.finish}&nbsp;&nbsp;<i class="fa-solid fa-arrow-right"></i>
    </button>
    <button type="button" class="secondary" onclick={() => step--}><i class="fa-solid fa-arrow-left"></i>&nbsp;&nbsp;{$l.common.back}</button>
  </div>
</form>

<style lang="scss">
  @use '../../../static/scss/setup.scss';

  div.flex {
    display: flex;
    gap: 20px;
    vertical-align: top;

    div {
      flex: 1;
    }

    label.visibility {
      margin-top: 0;
    }
  }
</style>
