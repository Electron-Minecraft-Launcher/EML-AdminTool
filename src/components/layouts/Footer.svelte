<script lang="ts">
  import type { Env } from "$lib/utils/types"
  import { getContext } from "svelte"

  const env = getContext<Env>('env')
</script>

<footer>
  <hr />
  <p>
    EML AdminTool v{env.version} – <a href="https://discord.gg/YVB4k6HzAY" target="_blank">Discord</a> –
    <a href="https://emlproject.pages.dev/docs" target="_blank">Docs</a> –
    <a href="https://github.com/Electron-Minecraft-Launcher/EML-AdminTool" target="_blank">GitHub</a>
  </p>
</footer>

<style lang="scss">
  footer {
    width: calc(100% - 200px);
    text-align: center;
    margin-top: 75px;
    padding-bottom: 30px;
    position: absolute;
    bottom: -107px;
    z-index: 0;
  }

  p {
    font-size: 13px;
    line-height: 1.4;
    opacity: 0.8;
  }

  hr {
    background-color: #d8d8d8;
    height: 1px;
    border-width: 0px;
    margin-bottom: 30px;
  }

  /**
   * Dev purposes only
   */
  input {
    padding: 3px;
    font-size: 9px;
    box-shadow: none;
    outline: none !important;
    width: 500px;
    display: inline;
  }
</style>
