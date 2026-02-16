<script lang="ts">
  import { passwordStrength, type Options } from 'check-password-strength'
  import generator from 'generate-password-browser'
  import { l, type LanguageCode } from '$lib/stores/language'

  interface Props {
    step: number
    setupData: { language: LanguageCode | ''; dbPassword: string; adminUsername: string; adminPassword: string }
  }

  let { step = $bindable(), setupData = $bindable() }: Props = $props()

  const passwordStrengthOptions: Options<string> = [
    { id: 0, value: 'veryWeak', minDiversity: 0, minLength: 0 },
    { id: 1, value: 'weak', minDiversity: 1, minLength: 6 },
    { id: 2, value: 'medium', minDiversity: 2, minLength: 10 },
    { id: 3, value: 'strong', minDiversity: 3, minLength: 12 },
    { id: 4, value: 'veryStrong', minDiversity: 4, minLength: 16 }
  ]

  let pwdStrength: [number, 'veryWeak' | 'weak' | 'medium' | 'strong' | 'veryStrong'] = $derived.by(() => {
    const strength = passwordStrength(setupData.dbPassword, passwordStrengthOptions)
    return [strength.id, strength.value as 'veryWeak' | 'weak' | 'medium' | 'strong' | 'veryStrong']
  })

  let unwantedCharsPresent = $derived.by(() => {
    return /["\/\\\+&#%\?=:@]/g.test(setupData.dbPassword)
  })

  function generatePassword() {
    const password = generator.generate({
      length: 24,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true,
      exclude: '"/\\+&#%?=:@'
    })

    setupData.dbPassword = password
  }

  function submit(e: SubmitEvent) {
    e.preventDefault()
    if (!setupData.dbPassword) return
    step++
  }
</script>

<form onsubmit={submit}>
  <h2>{@html $l.setup.step2.title}</h2>
  <p><b>{$l.setup.step2.subtitle}</b></p>

  <div>
    <label for="db-password" style="margin-bottom: 0;">{$l.setup.step2.placeholder}</label>
    <div class="flex">
      <input type="text" name="db-password" id="db-password" bind:value={setupData.dbPassword} />

      <button class="secondary" onclick={generatePassword} type="button">
        <i class="fa-solid fa-arrows-rotate"></i>&nbsp;&nbsp;{$l.setup.step2.generate}
      </button>
    </div>

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
    <span class="unwanted-chars">{unwantedCharsPresent ? $l.setup.step2.unwantedChars : ''}</span>
  </div>

  <div class="actions">
    <button type="submit" class="primary" disabled={pwdStrength[0] < 3 || unwantedCharsPresent}>{$l.common.next}&nbsp;&nbsp;<i class="fa-solid fa-arrow-right"></i></button>
    <button type="button" class="secondary" onclick={() => step--}><i class="fa-solid fa-arrow-left"></i>&nbsp;&nbsp;{$l.common.back}</button>
  </div>
</form>

<style lang="scss">
  @use '../../../static/scss/setup.scss';

  div.flex {
    display: flex;
    flex-direction: row;

    input {
      flex-grow: calc(100% - 50px);
    }

    button.secondary {
      margin-top: 7px;
      margin-left: 20px;
      white-space: nowrap;
      height: 39px;
    }
  }

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

  span.unwanted-chars {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: var(--red-color);
  }
</style>
