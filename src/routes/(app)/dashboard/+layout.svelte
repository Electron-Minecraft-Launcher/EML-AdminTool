<script lang="ts">
  import { setContext, type Snippet } from 'svelte'
  import type { LayoutData } from './$types'
  import LeftPanel from '../../../components/layouts/LeftPanel.svelte'
  import Footer from '../../../components/layouts/Footer.svelte'
  import getEnv from '$lib/utils/env'
  import UploadWidget from '../../../components/layouts/UploadWidget.svelte'

  interface Props {
    data: LayoutData
    children?: Snippet
  }

  let { data, children }: Props = $props()

  setContext('user', data.user)

  const env = getEnv()

  let leftPanelOpen = $state(true)
</script>

<UploadWidget />

<div class="container">
  <div class="nav" class:closed={!leftPanelOpen}>
    <LeftPanel bind:leftPanelOpen />
  </div>

  <div class="content">
    {@render children?.()}
    <Footer />
  </div>
</div>

<style lang="scss">
  div.container {
    display: flex;
    flex-direction: row;
    min-height: calc(100vh - 107px);
    flex: 1;
  }

  div.nav {
    width: 260px;
    transition: all 0.3s;
    z-index: 10;

    &.closed {
      width: 106px;
    }
  }

  div.content {
    padding: 30px 100px;
    flex: 1;
    position: relative;
  }
</style>
