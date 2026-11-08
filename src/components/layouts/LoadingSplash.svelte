<script lang="ts">
  interface Props {
    transparent?: boolean
  }

  let { transparent = false }: Props = $props()
</script>

<div class="splash-background" class:transparent>
  <div class="loader">
    <svg class="circular" viewBox="25 25 50 50">
      <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="5" stroke-miterlimit="10" />
    </svg>
  </div>
</div>

<style lang="scss">
  div.splash-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--surface-color);
    z-index: 1000;

    &.transparent {
      background: var(--loading-overlay-color);
      border-radius: 5px;
    }
  }

  .loader {
    position: relative;
    margin: 0 auto;
    top: calc(50% - 25px);
    width: 50px;
    height: 50px;

    &:before {
      content: '';
      display: block;
      padding-top: 100%;
    }
  }

  .circular {
    animation: rotate 2s linear infinite;
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .path {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
    stroke: var(--text-dark-color);
    stroke-linecap: round;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35px;
    }

    100% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124px;
    }
  }
</style>
