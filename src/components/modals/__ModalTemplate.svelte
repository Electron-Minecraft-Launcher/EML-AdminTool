<script lang="ts">
  import { scale } from 'svelte/transition'

  interface Props {
    size?: 's' | 'ms' | 'm' | 'ml' | 'l'
    show: boolean
    translateX?: string
    children?: import('svelte').Snippet
  }

  let { size = 'm', show = $bindable(), translateX = '0', children }: Props = $props()
</script>

<svelte:body
  onkeydown={(e) => {
    if (e.key === 'Escape') show = false
  }}
/>

<div class="modal-background" transition:scale={{ start: 1.5 }}>
  <div class={'modal size-' + size} style="transform: translateX({translateX})">
    <section class="close">
      <button class="close" onclick={() => (show = false)}>Close&nbsp;&nbsp;<i class="fa-solid fa-times"></i></button>
    </section>
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  div.modal-background {
    position: fixed;
    display: flex;
    vertical-align: middle;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--overlay-modal);
    transition:
      opacity 0.3s,
      transform 0.3s;
    overflow: hidden;
    z-index: 2000;
  }

  div.modal {
    vertical-align: middle;
    transition:
      opacity 0.3s,
      transform 0.3s;

    background-color: var(--surface-white);
    padding: 50px;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;

    box-shadow: 0 5px 50px var(--shadow-modal);
    position: relative;
    margin: auto;

    &.size-s {
      width: 400px;
    }

    &.size-ms {
      width: 750px;
    }

    &.size-m {
      width: 750px;
      margin-top: 45px;
      margin-bottom: 30px;
    }

    &.size-ml {
      width: 900px;
      margin-top: 45px;
      margin-bottom: 30px;
    }

    &.size-l {
      width: calc(100% - 60px);
      height: calc(100% - 177px);
      margin: 45px 30px 30px 30px;
    }
  }

  section.close {
    position: absolute;
    top: -35px;
    left: 0;
    text-align: right;
    width: 100%;

    button {
      display: inline-block;
      padding: 10px;
      color: var(--text-on-accent);
      background: none;
      font-weight: 600;
    }
  }
</style>
