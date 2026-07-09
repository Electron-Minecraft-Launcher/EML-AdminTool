<script lang="ts">
  import getUser from '$lib/utils/user'
  import type { CrashReport } from '@prisma/client'
  import type { PageData } from '../../routes/(app)/dashboard/crash-reports/$types'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'
  import { invalidateAll } from '$app/navigation'
  import ReadCrashReportModal from '../modals/ReadCrashReportModal.svelte'

  interface Props {
    crashReports: PageData['crashReports']
  }

  let { crashReports }: Props = $props()

  const user = getUser()

  let showReadCrashReportModal = $state(false)
  let selectedCrashReportId: string | null = $state(null)
  let selectedCrashReports: CrashReport[] = $state([])

  let iLength = 25
  let iStart = $state(0)

  function showCrashReport(cr: CrashReport) {
    selectedCrashReportId = cr.id
    showReadCrashReportModal = true
  }

  function selectCrashReport(e: Event, cr: CrashReport) {
    if (user.p_crashReports === 2) {
      e.stopPropagation()
      if ((e.target as HTMLInputElement).checked) {
        selectedCrashReports = [...selectedCrashReports, cr]
      } else {
        selectedCrashReports = selectedCrashReports.filter((n) => n !== cr)
      }
    }
  }

  async function deleteCrasheport() {
    if (selectedCrashReports.length === 0) return
    if (!confirm('Are you sure you want to delete the selected crash reports?')) return

    const formData = new FormData()
    for (const { id } of selectedCrashReports) formData.append('crash-report-id', id)

    await callAction({ url: '/dashboard/crash-reports', action: 'deleteCrashReports', formData }, $l)
    invalidateAll()
    selectedCrashReports = []

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach((checkbox) => {
      ;(checkbox as HTMLInputElement).checked = false
    })
    selectedCrashReportId = null
  }
</script>

{#if showReadCrashReportModal && selectedCrashReportId}
  <ReadCrashReportModal bind:show={showReadCrashReportModal} selectedCrashReportId={selectedCrashReportId} {crashReports} />
{/if}

<button class="secondary small" disabled={selectedCrashReports.length === 0} onclick={deleteCrasheport}>
  <i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete
</button>

<div class="list-container">
  <div class="list">
    {#each crashReports as cr, i}
      {#if i >= iStart && i < iStart + iLength}
        <button class="list" class:focused={selectedCrashReports.includes(cr)} onclick={() => showCrashReport(cr)} aria-label="Crash report item">
          <div class="checkbox">
            <input type="checkbox" disabled={user.p_crashReports !== 2} onclick={(e) => selectCrashReport(e, cr)} />
          </div>
          <div class="content">
            <div>
              <p class="label">ID</p>
              <p>#{cr.fileId.substring(0, 7)}</p>
            </div>
            <div>
              <p class="label">Submitted on</p>
              <p>
                {new Date(cr.createdAt).toLocaleDateString()}
                {new Date(cr.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p class="label">Profile</p>
              <p>{cr.profile}</p>
            </div>
            <div>
              <p class="label">Addressed</p>
              <p>
                {@html cr.addressedAt
                  ? '<i class="fa-solid fa-circle-check" style="color: var(--green-color);"></i>&nbsp;&nbsp;' + new Date(cr.addressedAt).toLocaleDateString()
                  : '<i class="fa-solid fa-circle-xmark" style="color: var(--red-color);"></i>'}
              </p>
            </div>
          </div>
        </button>
      {/if}
    {/each}
  </div>
</div>

{#if crashReports?.length === 0}
  <p class="nothing">No crash reports</p>
{/if}

<div class="info">
  <p>
    {crashReports.length > 0 ? iStart + 1 : 0}-{crashReports.length <= iStart + iLength ? crashReports.length : iStart + iLength} of {crashReports.length}
    crash reports
  </p>
  <p>
    <button
      class="page"
      disabled={iStart === 0}
      onclick={() => {
        iStart -= iLength
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      aria-label="Previous page"
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <button
      class="page"
      disabled={iStart + iLength >= crashReports.length}
      onclick={() => {
        iStart += iLength
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      aria-label="Next page"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </p>
  {#if selectedCrashReports.length === 1}
    <p>1 crash report selected</p>
  {:else if selectedCrashReports.length > 1}
    <p>{selectedCrashReports.length} crash reports selected</p>
  {/if}
</div>

<style lang="scss">
  @use '../../../static/scss/list.scss';

  p.nothing {
    text-align: center;
    margin-top: 20px;
    color: #606060;
  }

  div.info {
    bottom: 0;
    padding-top: 15px;

    p {
      margin: 0 30px 0 0;
      font-size: 14px;
      color: var(--text-dark-color);
      display: inline-block;
    }
  }

  button.small {
    width: auto;
    margin-top: 10px;
    display: inline-block;
    margin-right: 20px;
  }

  div.list-container {
    margin-top: 30px;
    overflow-y: visible !important;

    div.list {
      min-height: auto !important;
      overflow-y: hidden !important;
      padding-bottom: 2px;
    }
  }

  button.list {
    width: 100% !important;
    display: flex !important;
    gap: 15px;

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    div.checkbox {
      text-align: center;
      width: 25px;
      align-self: center;

      input {
        width: 18px;
        height: 18px;
      }
    }

    div.content {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      display: flex;
      flex-direction: row;
      gap: 50px;
      flex: 1;
      justify-content: space-between;

      div {
        width: 150px;
        p.label {
          margin-top: 0;
        }
      }
    }
  }

  i.fa-solid {
    .fa-circle-check {
      color: green;
    }

    .fa-circle-xmark {
      color: red;
    }
  }

  button.page {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 250px;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;

    &:hover {
      background: #eeeeee;
    }
  }
</style>
