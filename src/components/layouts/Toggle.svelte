<script lang="ts">
  interface Props {
    status: boolean
    disabled?: boolean
    text?: string[]
  }

  let { status = $bindable(), disabled = false, text = ['Enabled', 'Disabled'] }: Props = $props()
</script>

<label class="switch p" class:disabled>
  <div style="display: inline">
    <input type="checkbox" bind:checked={status} {disabled} />
    <span class="slider round"></span>
    <span style="padding-left: 35px">{status ? text[0] : text[1]}</span>
  </div>
</label>

<style lang="scss">
  label.switch {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 17px;
    margin-top: 0;
    white-space: nowrap;
    transition: all 0.2s ease;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;

      span.slider {
        cursor: not-allowed;
      }
    }

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    &:not(:global(.disabled)):hover span.slider {
      background: var(--secondary-color-hover);
    }

    &:not(:global(.disabled)):hover input:checked + span.slider {
      background: var(--primary-color-hover);
    }

    &:not(:global(.disabled)):active {
      transform: translateY(1px);
    }
  }

  span.slider {
    position: absolute;
    cursor: pointer;
    height: 17px;
    top: 3px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--secondary-color);
    transition: 0.3s;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 13px;
    width: 13px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.2s;
  }

  input:checked + .slider {
    background-color: var(--primary-color);
  }

  input:checked + .slider:before {
    transform: translateX(13px);
  }

  .slider.round {
    border-radius: 50rem;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
