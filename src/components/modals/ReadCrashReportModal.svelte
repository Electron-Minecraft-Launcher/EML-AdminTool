<script lang="ts">
  import type { PageData } from '../../routes/(app)/dashboard/crash-reports/$types'
  import ModalTemplate from './__ModalTemplate.svelte'

  interface Props {
    show: boolean
    crashReports: NonNullable<PageData['crashReports']>
    selectedCrashReportId: string
  }

  let { show = $bindable(), crashReports, selectedCrashReportId: selectedNewsId }: Props = $props()

  let selectedCrashReport = $state(crashReports.find((cr) => cr.id === selectedNewsId)!)
  let date = $state(selectedCrashReport.date)
  let os = $state(selectedCrashReport.os)
  let arch = $state(selectedCrashReport.arch)
  let javaVersion = $state(selectedCrashReport.javaVersion)
  let javaArch = $state(selectedCrashReport.javaArch)
  let profile = $state(selectedCrashReport.profile)
  let version = $state(selectedCrashReport.version)
  let loader = $state(selectedCrashReport.loader)
  let loaderVersion = $state(selectedCrashReport.loaderVersion)
  let minRam = $state(selectedCrashReport.minRam)
  let maxRam = $state(selectedCrashReport.maxRam)
  let exitCode = $state(selectedCrashReport.exitCode)
  let addressedAt = $state(selectedCrashReport.addressedAt)
  let comment = $state(selectedCrashReport.comment)
  let createdAt = $state(selectedCrashReport.createdAt)
  let fileId = $state(selectedCrashReport.fileId)
</script>

<ModalTemplate size={'m'} bind:show>
  <h2>Read crash report</h2>

  <div class="actions">
    <button type="button" class="secondary" onclick={() => (show = false)}>Close</button>
    <button type="button" class="primary" onclick={() => (show = false)}>Close & Mark as Addressed</button>
  </div>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  button.secondary {
    margin-top: 30px;
  }
</style>
