<script lang="ts">
  import getEnv from '$lib/utils/env'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const env = getEnv()
</script>

<svelte:head>
  <title>News • {env.name} AdminTool</title>
</svelte:head>

<h2>Stats</h2>

<div class="wip">
  <p class="wip">We are still building the Stats feature!</p>
  <p class="sub-wip">You will be able to use it in a future update.</p>
  <p class="sub-wip">You can submit your suggestions for this feature via <a target="_blank" href="https://github.com/Electron-Minecraft-Launcher/EML-AdminTool/issues">GitHub Issues</a>.</p>
</div>

<style lang="scss">
   @use '../../../../../static/scss/dashboard.scss';

  div.wip {
    border-radius: 10px;
    width: 100%;
    position: relative;
    margin-top: 50px;
    padding: 100px 0;
    text-align: center;
    background: #fafafa;
    opacity: 0.6;
    transition:
      opacity 0.3s,
      box-shadow 0.3s;

    &:hover {
      opacity: 1;
      box-shadow: 0 0 50px #00000008;
    }

    p.wip {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 0;
    }

    p.sub-wip {
      font-size: 14px;
      margin-top: 5px;
    }
  }
</style>
