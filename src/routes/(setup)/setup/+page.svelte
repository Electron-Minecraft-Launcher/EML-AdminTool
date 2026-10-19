<script lang="ts">
  import ConfigurationAdmin from '../../../components/setup/AdminSetup.svelte'
  import ConfigurationDatabase from '../../../components/setup/DatabaseSetup.svelte'
  import ConfigurationLanguage from '../../../components/setup/LanguageSetup.svelte'
  import ConfigurationInstance from '../../../components/setup/InstanceSetup.svelte'
  import { l, type LanguageCode } from '$lib/stores/language'
  import type { PageProps } from './$types'
  import { waitForServerRestart, sleep } from '$lib/utils/utils'
  import { fade } from 'svelte/transition'
  import { getContext, onMount } from 'svelte'
  import type { Env } from '$lib/utils/types'
  import LoadingSplash from '../../../components/layouts/LoadingSplash.svelte'
  import { callAction } from '$lib/utils/call'

  let { data }: PageProps = $props()

  const env = getContext<Env>('env')

  let setupData = $state({
    language: '' as LanguageCode | '',
    dbPassword: '',
    adminUsername: '',
    adminPassword: '',
    instanceName: ''
  })

  let showLoader = $state(false)
  let showH1 = $state(false)
  let showSlider = $state(false)
  let h1 = $state('')

  let step = $state(0)

  async function finish() {
    await sleep(1000)
    showSlider = false
    await sleep(500)
    h1 = $l.setup.finally
    showH1 = true
    await sleep(2000)
    showH1 = false
    await sleep(1000)
    showLoader = true
    try {
      await callAction({ url: '/setup', action: 'finish', formData: new FormData() }, $l)
      await waitForServerRestart(12, '/')
    } catch (err) {
      console.error('Failed to mark as configured:', err)
      // TODO
    }
  }

  onMount(async () => {
    await sleep(1000)
    // h1 = 'Welcome!'
    // h1Visible = true
    // await sleep(2000)
    // h1Visible = false
    // await sleep(1000)
    // h1 = 'You can now configure EML&nbsp;Admintool.'
    // h1Visible = true
    // await sleep(3000)
    showH1 = false
    await sleep(500)

    showSlider = true
    step = 1
  })

  $effect(() => {
    if (step >= 5) finish()
  })
</script>

<svelte:head>
  <title>{$l.setup.setup} • {env.name} AdminTool</title>
</svelte:head>

{#if showLoader}
  <div class="splash" transition:fade>
    <div>
      <LoadingSplash />
    </div>
    <p transition:fade>Restarting...</p>
  </div>
{/if}
<div class="progress">
  <span class:step-0={step == 0} class:step-1={step == 1} class:step-2={step == 2} class:step-3={step == 3} class:step-4={step == 4} class:step-5={step == 5}></span>
</div>

{#if showH1}
  <h1 transition:fade>{@html h1}</h1>
{/if}

{#if showSlider}
  <div
    class="config-slider"
    class:step-0={step === 0}
    class:step-1={step === 1}
    class:step-2={step === 2}
    class:step-3={step === 3}
    class:step-4={step === 4}
    class:step-5={step === 5}
    id="config-slider"
    transition:fade
  >
    <div class="config-1">
      <ConfigurationLanguage bind:step bind:setupData />
    </div>
    <div class="config-2">
      <ConfigurationDatabase bind:step bind:setupData />
    </div>
    <div class="config-3">
      <ConfigurationAdmin bind:step bind:setupData />
    </div>
    <div class="config-4">
      <ConfigurationInstance bind:step bind:setupData />
    </div>
  </div>
{/if}

<style lang="scss">
  div.splash {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    background-color: white;

    div {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 100px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      background-color: white;
    }

    p {
      padding-top: 20px;
      z-index: 1100;
    }
  }

  h1 {
    text-align: center;
    font-size: 56px;
    margin-top: 33vh;
    transition:
      opacity 0.5s,
      display 0.5s;
  }

  div.config-slider {
    width: 500vw;
    overflow-x: hidden;
    transition: transform 0.5s ease;
    display: flex;

    &.step-1,
    &.step-0 {
      transform: translateX(0);
    }

    &.step-2 {
      transform: translateX(-100vw);
    }

    &.step-3 {
      transform: translateX(-200vw);
    }

    &.step-4 {
      transform: translateX(-300vw);
    }

    &.step-5 {
      transform: translateX(-400vw);
    }

    div.config-1,
    div.config-2,
    div.config-3,
    div.config-4 {
      width: 100vw;
      vertical-align: top;
      height: calc(100vh - 5px);
    }
  }

  div.progress {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: var(--medium-background-color);

    span {
      height: 5px;
      width: 0;
      transition: width 0.8s cubic-bezier(0, 0, 0.2, 1);
      background-color: var(--primary-color);
      display: block;
      border-top-right-radius: 50rem;
      border-bottom-right-radius: 50rem;

      &.step-0 {
        width: 1%;
      }

      &.step-1 {
        width: calc(25% / 2);
      }

      &.step-2 {
        width: calc(25% + 25% / 2);
      }

      &.step-3 {
        width: calc(50% + 25% / 2);
      }

      &.step-4 {
        width: calc(75% + 25% / 2);
      }

      &.step-5 {
        width: 100%;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
</style>
