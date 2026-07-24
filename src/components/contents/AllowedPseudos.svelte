<script lang="ts">
  interface Props {
    allowedPseudos: string[]
    label: string
  }

  let { allowedPseudos = $bindable([]), label = 'Allowed pseudos' }: Props = $props()

  let pseudoInput: string = $state('')

  function handleAllowedPseudosInput(e: Event) {
    const input = e.target as HTMLInputElement
    pseudoInput = input.value

    if (pseudoInput.includes(',')) {
      const pseudos = pseudoInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '')
      allowedPseudos = [...allowedPseudos, ...pseudos]
      allowedPseudos = [...new Set(allowedPseudos)]
      pseudoInput = ''
    }
  }

  function handleAllowedPseudosInputKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAllowedPseudosButton()
    }
  }

  function handleAllowedPseudosButton() {
    if (pseudoInput.trim() !== '') {
      const pseudos = pseudoInput
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== '')
      allowedPseudos = [...allowedPseudos, ...pseudos]
      allowedPseudos = [...new Set(allowedPseudos)]
      pseudoInput = ''
    }
  }
</script>

<label for="allowed-pseudos">{label}</label>
<div class="flex">
  <input
    type="text"
    id="allowed-pseudos"
    name="allowed-pseudos"
    style="margin-top: 0"
    placeholder="Enter allowed pseudos separated by commas"
    bind:value={pseudoInput}
    oninput={handleAllowedPseudosInput}
    onkeydown={handleAllowedPseudosInputKey}
  />
  <button
    type="button"
    class="secondary"
    style="margin-top: 0"
    disabled={pseudoInput.trim() === ''}
    aria-label="Add allowed pseudo"
    onclick={handleAllowedPseudosButton}
  >
    <i class="fa-solid fa-plus"></i>
  </button>
</div>
<div class="pseudos">
  {#each allowedPseudos as pseudo, i}
    <span class="allowed-pseudo">
      {pseudo}
      <button
        class="delete"
        type="button"
        onclick={() => {
          allowedPseudos = [...allowedPseudos.slice(0, i), ...allowedPseudos.slice(i + 1)]
        }}
        aria-label="Remove allowed pseudo"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </span>
  {/each}
</div>

<style lang="scss">
  div.flex {
    display: flex;
    gap: 20px;
    vertical-align: top;

    div {
      flex: 1;
    }
  }

  div.pseudos {
    flex-wrap: nowrap;
    gap: 0.5rem;
    margin-top: 1rem;
    display: flex;
    max-height: 33px;
    overflow-x: auto;

    span.allowed-pseudo {
      border: 1px solid var(--border-color);
      border-radius: 4px;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.6rem;
      font-size: 0.85rem;
      display: flex;

      button {
        cursor: pointer;
        color: #888;
        background: 0 0;
        border: none;
        padding: 0;
      }
    }
  }
</style>
