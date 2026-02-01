<script lang="ts">
  import ModalTemplate from './__ModalTemplate.svelte'
  import { l } from '$lib/stores/language'

  interface Props {
    show: boolean
  }

  let { show = $bindable() }: Props = $props()
</script>

<ModalTemplate size={'s'} bind:show>
  <h2>{$l.setup.step1.modal.title}</h2>
  <p>{@html $l.setup.step1.modal.content}</p>
  <div class="actions">
    <a class="not-a" href="https://github.com/Electron-Minecraft-Launcher/EML-AdminTool?tab=readme-ov-file#want-to-help" target="_blank">
      <button class="primary">{$l.setup.step1.modal.more}&nbsp;&nbsp;<i class="fa-solid fa-arrow-up-right-from-square"></i></button>
    </a>
  </div>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';
</style>
