<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import getEnv from '$lib/utils/env'
  import type { SubmitFunction } from '@sveltejs/kit'
  import type { PageProps } from './$types'
  import Chart from 'chart.js/auto'
  import { l } from '$lib/stores/language'
  import type { NotificationCode } from '$lib/utils/notifications'
  import { addNotification } from '$lib/stores/notifications'

  let { data }: PageProps = $props()

  const env = getEnv()
  
  function chartAction(node: HTMLCanvasElement, config: any) {
    let chart = new Chart(node, config)
    return {
      update(newConfig: any) {
        chart.destroy()
        chart = new Chart(node, newConfig)
      },
      destroy() {
        chart.destroy()
      }
    }
  }

  function handleRangeChange(e: Event) {
    const target = e.target as HTMLSelectElement
    const url = new URL(page.url)
    url.searchParams.set('range', target.value)
    goto(url.toString(), { keepFocus: true, invalidateAll: true })
  }

  const cssColor = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const palette = [
    cssColor('--chart-series-1'), cssColor('--chart-series-2'), cssColor('--chart-series-3'),
    cssColor('--chart-series-4'), cssColor('--chart-series-5'), cssColor('--chart-series-6')
  ]

  const osColors: Record<string, string> = {
    'Windows': cssColor('--chart-os-windows'),
    'macOS': cssColor('--chart-os-macos'),
    'Linux': cssColor('--chart-os-linux')
  }

  const authColors: Record<string, string> = {
    'Cracked': cssColor('--chart-auth-cracked'),
    'Microsoft': cssColor('--chart-auth-microsoft'),
    'AzAuth': cssColor('--chart-auth-azauth'),
    'Yggdrasil': cssColor('--chart-auth-yggdrasil')
  }

  let versionsEvolutionConfig = $derived({
    type: 'line',
    data: {
      labels: data.charts.dates,
      datasets: data.charts.allVersions.map((version, i) => ({
        label: version,
        data: data.charts.dates.map((date) => data.charts.versionsOverTime[date]?.[version] || 0),
        backgroundColor: palette[i % palette.length] + '80',
        borderColor: palette[i % palette.length],
        fill: true
      }))
    },
    options: {
      maintainAspectRatio: false,
      scales: { y: { stacked: true, beginAtZero: true } },
      elements: { point: { radius: 0 } },
      interaction: { mode: 'index', intersect: false }
    }
  })

  let osArchConfig = $derived.by(() => {
    const osLabels = Object.keys(data.charts.osArch)
    const allArchs = Array.from(new Set(osLabels.flatMap((os) => Object.keys(data.charts.osArch[os]))))
    
    // Dégradé d'opacité pour différencier les architectures
    const opacities = ['FF', 'B3', '66']

    return {
      type: 'bar',
      data: {
        labels: osLabels,
        datasets: allArchs.map((arch, i) => ({
          label: arch,
          data: osLabels.map((os) => data.charts.osArch[os][arch] || 0),
          backgroundColor: osLabels.map((os) => (osColors[os] || cssColor('--chart-fallback-color')) + (opacities[i % opacities.length] || 'FF')),
          borderRadius: 4
        }))
      },
      options: { maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    }
  })

  let profilesConfig = $derived({
    type: 'doughnut',
    data: {
      labels: Object.keys(data.charts.profileDistribution),
      datasets: [
        {
          data: Object.values(data.charts.profileDistribution),
          backgroundColor: palette,
          borderWidth: 0
        }
      ]
    },
    options: { maintainAspectRatio: false, cutout: '65%' }
  })

  let authConfig = $derived.by(() => {
    const authKeys = Object.keys(data.charts.authTypes)
    return {
      type: 'doughnut',
      data: {
        labels: authKeys,
        datasets: [
          {
            data: Object.values(data.charts.authTypes),
            backgroundColor: authKeys.map(a => authColors[a] || cssColor('--chart-fallback-color')),
            borderWidth: 0
          }
        ]
      },
      options: { maintainAspectRatio: false, cutout: '65%' }
    }
  })

  let ramConfig = $derived({
    type: 'line',
    data: {
      labels: data.charts.ramOverTime.map((d) => d.date),
      datasets: [
        {
          label: 'Max RAM (+1 SD)',
          data: data.charts.ramOverTime.map((d) => d.max.avg + d.max.std),
          borderColor: cssColor('--transparent-color'),
          backgroundColor: cssColor('--transparent-color'),
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Average Max RAM',
          data: data.charts.ramOverTime.map((d) => d.max.avg),
          borderColor: cssColor('--chart-ram-max-color'),
          backgroundColor: cssColor('--chart-ram-max-fill'),
          pointRadius: 2,
          fill: '-1'
        },
        {
          label: 'Max RAM (-1 SD)',
          data: data.charts.ramOverTime.map((d) => Math.max(0, d.max.avg - d.max.std)),
          borderColor: cssColor('--transparent-color'),
          backgroundColor: cssColor('--chart-ram-max-fill'),
          pointRadius: 0,
          fill: '-1'
        },
        {
          label: 'Min RAM (+1 SD)',
          data: data.charts.ramOverTime.map((d) => d.min.avg + d.min.std),
          borderColor: cssColor('--transparent-color'),
          backgroundColor: cssColor('--transparent-color'),
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Average Min RAM',
          data: data.charts.ramOverTime.map((d) => d.min.avg),
          borderColor: palette[0],
          backgroundColor: cssColor('--chart-ram-min-fill'),
          pointRadius: 2,
          fill: '-1'
        },
        {
          label: 'Min RAM (-1 SD)',
          data: data.charts.ramOverTime.map((d) => Math.max(0, d.min.avg - d.min.std)),
          borderColor: cssColor('--transparent-color'),
          backgroundColor: cssColor('--chart-ram-min-fill'),
          pointRadius: 0,
          fill: '-1'
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, suggestedMax: 8192 } },
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { filter: (item: any) => !item.text.includes('SD') } } }
    }
  })

  const enhanceForm: SubmitFunction = ({ cancel }) => {
    if (!confirm('Are you sure you want to delete all stats? This action cannot be undone.')) {
      cancel()
      return
    }

    return async ({ result, update }) => {
      await update({ reset: false })
      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      }

      await applyAction(result)
    }
  }
</script>

<svelte:head>
  <title>Stats • {env.name} AdminTool</title>
</svelte:head>

<h2>
  Stats
  <span style="cursor: help" title="This is a beta feature. Please report any issues you encounter.">Beta</span>
</h2>

<section class="section actions">
  <select class="range-select" onchange={handleRangeChange} value={data.range}>
    <option value="1d">Last 24h (per hour)</option>
    <option value="14d">2 last weeks (daily blocks)</option>
    <option value="30d">Last 30 days (day blocks)</option>
    <option value="90d">3 last months (weekly blocks)</option>
  </select>

  <form method="POST" action="?/reset" use:enhance={enhanceForm}>
    <button type="submit" class="secondary danger"><i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete all stats</button>
  </form>
</section>

<section class="section">
  <h3>Key performance indicators</h3>

  <div class="container">
    <div>
      <p class="label">Total launches</p>
      <p>{data.kpis.totalLaunches}</p>
    </div>
    <div>
      <p class="label">Funnel conversion rate</p>
      <p>{data.kpis.funnelConversionRate.toFixed(0)}%</p>
    </div>
    <div>
      <p class="label">Most popular profile</p>
      <p>{data.kpis.mostPopularProfile} ({data.kpis.mostPopularProfileRate.toFixed(0)}%)</p>
    </div>
  </div>
</section>

<section class="section">
  <h3>Demography & Hardware</h3>
  <div class="chart-grid">
    <div class="chart-container full-width">
      <h4>Version deployment</h4>
      <div class="canvas-wrapper line-wrapper">
        <canvas use:chartAction={versionsEvolutionConfig}></canvas>
      </div>
    </div>
    <div class="chart-container full-width">
      <h4>Operating systems</h4>
      <div class="canvas-wrapper line-wrapper">
        <canvas use:chartAction={osArchConfig}></canvas>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <h3>Minecraft ecosystem</h3>
  <div class="chart-grid">
    <div class="chart-container full-width">
      <h4>Used profiles</h4>
      <div class="canvas-wrapper line-wrapper">
        <canvas use:chartAction={profilesConfig}></canvas>
      </div>
    </div>
    <div class="chart-container full-width">
      <h4>Account types</h4>
      <div class="canvas-wrapper line-wrapper">
        <canvas use:chartAction={authConfig}></canvas>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <h3>Dedicated resources</h3>
  <div class="chart-grid">
    <div class="chart-container full-width">
      <h4>Evolution of RAM with variance</h4>
      <div class="canvas-wrapper line-wrapper">
        <canvas use:chartAction={ramConfig}></canvas>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  h2 span {
    font-size: 15px;
    color: var(--stats-warning-text);
    display: inline-block;
    margin-left: 10px;
    background-color: var(--stats-warning-background);
    padding: 2px 12px;
    border-radius: 50rem;
    vertical-align: middle;
    position: relative;
    top: -3px;
  }

  section.actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    button.secondary {
      margin-top: 0;
    }
  }

  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }

  .chart-container {
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;

    h4 {
      margin-top: 0;
      font-size: 14px;
      letter-spacing: 0.5px;
      width: 100%;
      text-align: left;
    }

    .canvas-wrapper {
      position: relative;
      height: 250px;
      width: 100%;
      display: flex;
      justify-content: center;

      &.line-wrapper {
        height: 300px;
      }
    }

    &.full-width {
      width: 100%;
    }
  }
</style>
