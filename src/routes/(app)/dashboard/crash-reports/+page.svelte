<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import getEnv from '$lib/utils/env'
  import CrashReports from '../../../../components/contents/CrashReports.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const env = getEnv()

  let crashReports = $state(data.crashReports)
  let count = $state(data.count)

  $effect(() => {
    if (data.crashReports) crashReports = data.crashReports
    if (data.count) count = data.count
  })

  function handleCrashReportsPageChange(crashReportsPage: number) {
    const url = new URL(page.url)
    url.searchParams.set('page', crashReportsPage.toString())
    goto(url.toString(), { keepFocus: true, invalidateAll: true })
  }
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

  <CrashReports {crashReports} {count} pageSize={data.pageSize} page={data.page} onPageChange={handleCrashReportsPageChange} />
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';
</style>
