<script lang="ts">
  import ModalTemplate from './__ModalTemplate.svelte'
  import { l } from '$lib/stores/language'

  interface Props {
    show: boolean
  }

  let { show = $bindable() }: Props = $props()
</script>

<ModalTemplate size={'ms'} bind:show>
  <h2>{$l.dashboard.emlatSettings.dangerZone.modal.title}</h2>
  <div class="uninstall-modal">
    {@html $l.dashboard.emlatSettings.dangerZone.modal.content}
  </div>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  :global {
    ol li {
      font-size: 15px;
      line-height: 1.6;
    }
    code,
    ol li code {
      background: var(--background-color);
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 90%;
      font-family: 'Fira Code', monospace !important;
      line-height: 1.7;
    }
  }
</style>
