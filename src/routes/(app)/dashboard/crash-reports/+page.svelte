<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import getEnv from '$lib/utils/env'
  import CrashReports from '../../../../components/contents/CrashReports.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const env = getEnv()

  let crashReports = $state(data.crashReports)

  $effect(() => {
    if (data.crashReports) crashReports = data.crashReports
  })
</script>

<svelte:head>
  <title>Crash Reports • {env.name} AdminTool</title>
</svelte:head>

<h2>Crash Reports</h2>

<section class="section">
  <h3>Key metrics</h3>

  <div class="container">
    <div>
      <p class="label">Total crashe reports</p>
      <p>{data.count}</p>
    </div>
    <div>
      <p class="label">Unaddressed crashes</p>
      <p>{data.unadressed} ({((data.unadressed / data.count) * 100 || 0).toFixed(0)}%)</p>
    </div>
    <div>
      <p class="label">Most crash-prone profile</p>
      <p>{data.crashProneProfile}</p>
    </div>
  </div>
</section>

<section class="section">
  <h3>Crash Reports</h3>

  <CrashReports {crashReports} />
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';
</style>
