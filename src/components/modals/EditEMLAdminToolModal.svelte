<script lang="ts">
  import { l } from '$lib/stores/language'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import ModalTemplate from './__ModalTemplate.svelte'
  import getEnv from '$lib/utils/env'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import { applyAction } from '$app/forms'
  import { addNotification } from '$lib/stores/notifications'
  import type { NotificationCode } from '$lib/utils/notifications'

  interface Props {
    show: boolean
  }

  let { show = $bindable() }: Props = $props()

  const env = getEnv()

  let showLoader = $state(false)
  let name = $state(env.name)
  let language = $state(env.language)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('language', language)

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

<ModalTemplate size={'ms'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <h2>{$l.dashboard.emlatSettings.info.modal.title}</h2>

  <form method="POST" action="?/editEMLAT" use:enhance={enhanceForm}>
    <!-- <p>{$l.dashboard.emlatSettings.leaveBlank}</p> -->

    <label for="name">{$l.dashboard.emlatSettings.info.modal.atName}</label>
    <input type="text" id="name" name="name" bind:value={name} autocomplete="username" />
    <p class="warn">{$l.dashboard.emlatSettings.info.modal.nameWarn}</p>

    <p class="label">{$l.dashboard.emlatSettings.info.modal.language}</p>
    <div class="language">
      <button type="button" class="secondary" class:selected={language === 'en'} id="en-button" onclick={() => (language = 'en')}>
        <p>
          <img src="/images/flags/en.png" alt="English flag" />
          English
        </p>
      </button>
      <button type="button" class="secondary" class:selected={language === 'fr'} id="fr-button" onclick={() => (language = 'fr')}>
        <p>
          <img src="/images/flags/fr.png" alt="French flag" />
          Français
        </p>
      </button>
      <button type="button" class="secondary" class:selected={language === 'de'} id="de-button" onclick={() => (language = 'de')}>
        <p>
          <img src="/images/flags/de.png" alt="German flag" />
          Deutsch
        </p>
      </button>
      <button type="button" class="secondary" class:selected={language === 'it'} id="it-button" onclick={() => (language = 'it')}>
        <p>
          <img src="/images/flags/it.png" alt="Italian flag" />
          Italiano
        </p>
      </button>
      <button type="button" class="secondary" class:selected={language === 'da'} id="da-button" onclick={() => (language = 'da')}>
        <p>
          <img src="/images/flags/da.png" alt="Danish flag" />
          Dansk
        </p>
      </button>
      <button type="button" class="secondary" class:selected={language === 'ja'} id="ja-button" onclick={() => (language = 'ja')}>
        <p>
          <img src="/images/flags/ja.png" alt="Japanese flag" />
          日本語
        </p>
      </button>
    </div>

    <p class="label">{$l.dashboard.emlatSettings.info.modal.pin}</p>
    <label class="p" for="regenerate-pin">
      <input type="checkbox" id="regenerate-pin" name="regenerate-pin" />
      {$l.dashboard.emlatSettings.info.modal.regeneratePin}
    </label>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary">{$l.common.save}</button>
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

  div.language {
    width: 650px;
    margin: 0 auto;
    display: flex;
    margin-bottom: 30px;
    gap: 25px;
    flex-wrap: wrap;
    justify-content: center;

    button:not(.a) {
      display: inline-block !important;
      padding: 0;
      margin: 0;
      text-align: left;
      width: 200px;

      &:hover img {
        filter: brightness(115%);
      }

      &:last-of-type {
        margin-right: 0;
      }

      &.selected {
        background: var(--primary-light-color);

        &:hover {
          background: var(--primary-light-color-hover);
        }
      }

      img {
        width: 70px;
        height: 40px;
        display: inline-block;
        vertical-align: middle;
        border-radius: 4px;
        margin-right: 20px;
        transition: all 0.3s ease;
      }

      p {
        display: inline-block;
        vertical-align: middle;
        margin: 0;
        font-weight: 600;
      }
    }
  }
</style>
