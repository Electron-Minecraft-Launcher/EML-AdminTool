<script lang="ts">
  import LanguageModal from '../modals/LanguageModal.svelte'
  import { currentLanguage, l, type LanguageCode } from '$lib/stores/language'

  interface Props {
    step: number
    setupData: { language: LanguageCode | ''; dbPassword: string; adminUsername: string; adminPassword: string, instanceName: string }
  }

  let { step = $bindable(), setupData = $bindable() }: Props = $props()

  let showLanguageModal = $state(false)

  function switchLanguage(language: LanguageCode) {
    currentLanguage.set(language)
    setupData.language = language
  }

  function submit(e: SubmitEvent) {
    e.preventDefault()
    if (!setupData.language) return
    step++
    showLanguageModal = false
  }
</script>

<form onsubmit={submit}>
  <h2>{@html $l.setup.step1.title}</h2>
  <p><b>{$l.setup.step1.subtitle}</b></p>

  <div>
    <div class="language">
      <button type="button" class="secondary" class:selected={setupData.language === 'en'} id="en-button" onclick={() => switchLanguage('en')}>
        <p>
          <img src="/images/flags/en.png" alt="English flag" />
          English
        </p>
      </button>
      <button type="button" class="secondary" class:selected={setupData.language === 'fr'} id="fr-button" onclick={() => switchLanguage('fr')}>
        <p>
          <img src="/images/flags/fr.png" alt="French flag" />
          Français
        </p>
      </button>
      <button type="button" class="secondary" class:selected={setupData.language === 'de'} id="de-button" onclick={() => switchLanguage('de')}>
        <p>
          <img src="/images/flags/de.png" alt="German flag" />
          Deutsch
        </p>
      </button>
      <button type="button" class="secondary" class:selected={setupData.language === 'it'} id="it-button" onclick={() => switchLanguage('it')}>
        <p>
          <img src="/images/flags/it.png" alt="Italian flag" />
          Italiano
        </p>
      </button>
      <button type="button" class="secondary" class:selected={setupData.language === 'da'} id="da-button" onclick={() => switchLanguage('da')}>
        <p>
          <img src="/images/flags/da.png" alt="Danish flag" />
          Dansk
        </p>
      </button>
      <button type="button" class="secondary" class:selected={setupData.language === 'ja'} id="ja-button" onclick={() => switchLanguage('ja')}>
        <p>
          <img src="/images/flags/ja.png" alt="Japanese flag" />
          日本語
        </p>
      </button>
    </div>

    <p class="center">
      <button class="a small-link" type="button" onclick={() => (showLanguageModal = true)}>{$l.setup.step1.other}</button>
    </p>
  </div>

  <div class="actions">
    <button type="submit" class="primary" disabled={!setupData.language}>{$l.common.next}&nbsp;&nbsp;<i class="fa-solid fa-arrow-right"></i></button>
  </div>
</form>

{#if showLanguageModal}
  <LanguageModal bind:show={showLanguageModal} />
{/if}

<style lang="scss">
  @use '../../../static/scss/setup.scss';

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

  p.center {
    margin-bottom: 0;
  }
</style>
