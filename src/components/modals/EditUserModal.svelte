<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { PageData, SubmitFunction } from '../../routes/(app)/dashboard/emlat-settings/$types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import type { NotificationCode } from '$lib/utils/notifications'
  import LoadingSplash from '../layouts/LoadingSplash.svelte'
  import { emptyUser } from '$lib/stores/user'

  interface Props {
    show: boolean
    selectedUserId: string
    action: 'ACCEPT' | 'EDIT'
    data: PageData
    scroll?: HTMLDivElement | null
  }

  let { show = $bindable(), selectedUserId = $bindable(), action, data, scroll = $bindable(null) }: Props = $props()

  let selectedUser = $state(data.users.find((user) => user.id === selectedUserId) ?? emptyUser)
  let p_filesUpdater_1 = $state(selectedUser.p_filesUpdater >= 1)
  let p_filesUpdater_2 = $state(selectedUser.p_filesUpdater === 2)
  let p_bootstraps = $state(selectedUser.p_bootstraps === 1)
  let p_maintenance = $state(selectedUser.p_maintenance === 1)
  let p_news_1 = $state(selectedUser.p_news >= 1)
  let p_news_2 = $state(selectedUser.p_news === 2)
  let p_newsCategories = $state(selectedUser.p_newsCategories === 1)
  let p_newsTags = $state(selectedUser.p_newsTags === 1)
  let p_backgrounds = $state(selectedUser.p_backgrounds === 1)
  let p_stats_1 = $state(selectedUser.p_stats >= 1)
  let p_stats_2 = $state(selectedUser.p_stats === 2)

  let showLoader = $state(false)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    formData.set('user-id', selectedUserId)

    return async ({ result, update }) => {
      await update({ reset: false })
      showLoader = false

      if (result.type === 'failure') {
        const message = $l.notifications[result.data?.failure as NotificationCode] ?? $l.notifications.INTERNAL_SERVER_ERROR
        addNotification('ERROR', message)
      } else if (result.type === 'success') {
        show = false
      }

      await applyAction(result)
    }
  }
</script>

<ModalTemplate size={'ms'} bind:show>
  {#if showLoader}
    <LoadingSplash transparent />
  {/if}

  <form method="POST" action="?/editUser" use:enhance={enhanceForm}>
    <h2>{action === 'ACCEPT' ? $l.dashboard.emlatSettings.userManagement.modal.acceptUser : $l.dashboard.emlatSettings.userManagement.modal.title}</h2>

    <label for="username" style="margin-top: 0">{$l.common.username}</label>
    <input type="text" id="username" name="username" bind:value={selectedUser.username} />

    <p class="label" style="margin-top: 20px">{$l.dashboard.emlatSettings.userManagement.modal.permissions}</p>
    <div class="permission">
      <p>Files Updater</p>
      <div class="right">
        <label class="p" for="p_files-updater_1">
          <input
            type="checkbox"
            id="p_files-updater_1"
            name="p_files-updater_1"
            bind:checked={p_filesUpdater_1}
            onchange={() => {
              if (!p_filesUpdater_1) p_filesUpdater_2 = false
            }}
          /> Add, edit and delete files
        </label>
        <label class="p" for="p_files-updater_2">
          <input
            type="checkbox"
            id="p_files-updater_2"
            name="p_files-updater_2"
            bind:checked={p_filesUpdater_2}
            onchange={() => {
              if (p_filesUpdater_2) p_filesUpdater_1 = true
            }}
          /> Change Minecraft loader
        </label>
      </div>
    </div>

    <div class="permission">
      <p>Bootstraps</p>
      <div class="right">
        <label class="p" for="p_bootstraps">
          <input type="checkbox" id="p_bootstraps" name="p_bootstraps" bind:checked={p_bootstraps} /> Change bootstraps files
        </label>
      </div>
    </div>

    <div class="permission">
      <p>Maintenance</p>
      <div class="right">
        <label class="p" for="p_maintenance">
          <input type="checkbox" id="p_maintenance" name="p_maintenance" bind:checked={p_maintenance} /> Change maintenance status
        </label>
      </div>
    </div>

    <div class="permission">
      <p>News</p>
      <div class="right">
        <label class="p" for="p_news_1">
          <input
            type="checkbox"
            id="p_news_1"
            name="p_news_1"
            bind:checked={p_news_1}
            onchange={() => {
              if (!p_news_1) {
                p_news_2 = false
                p_newsCategories = false
                p_newsTags = false
              }
            }}
          /> Add news, edit and delete news they created
        </label>
        <label class="p" for="p_news_2">
          <input
            type="checkbox"
            id="p_news_2"
            name="p_news_2"
            bind:checked={p_news_2}
            onchange={() => {
              if (p_news_2) p_news_1 = true
            }}
          /> Delete any news
        </label>
        <label class="p" for="p_news-categories">
          <input
            type="checkbox"
            id="p_news-categories"
            name="p_news-categories"
            bind:checked={p_newsCategories}
            onchange={() => {
              if (p_newsCategories) p_news_1 = true
            }}
          /> Add, edit and delete news categories
        </label>
        <label class="p" for="p_news-tags">
          <input
            type="checkbox"
            id="p_news-tags"
            name="p_news-tags"
            bind:checked={p_newsTags}
            onchange={() => {
              if (p_newsTags) p_news_1 = true
            }}
          /> Add, edit and delete news tags
        </label>
      </div>
    </div>

    <div class="permission">
      <p>Backgrounds</p>
      <div class="right">
        <label class="p" for="p_backgrounds">
          <input type="checkbox" id="p_backgrounds" name="p_backgrounds" bind:checked={p_backgrounds} /> Change backgrounds
        </label>
      </div>
    </div>

    <div class="permission">
      <p>Stats</p>
      <div class="right">
        <label class="p" for="p_stats_1">
          <input
            type="checkbox"
            id="p_stats_1"
            name="p_stats_1"
            bind:checked={p_stats_1}
            onchange={() => {
              if (!p_stats_1) p_stats_2 = false
            }}
          /> View stats
        </label>
        <label class="p" for="p_stats_2">
          <input
            type="checkbox"
            id="p_stats_2"
            name="p_stats_2"
            bind:checked={p_stats_2}
            onchange={() => {
              if (p_stats_2) p_stats_1 = true
            }}
          /> Delete stats
        </label>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="secondary" onclick={() => (show = false)}>{$l.common.cancel}</button>
      <button type="submit" class="primary">{$l.common.save}</button>
    </div>
  </form>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  p.label {
    margin-top: 15px;
  }

  label.p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: black;
  }

  div.permission {
    display: flex;
    gap: 20px;
    margin-top: 5px;

    p {
      width: 200px;
      text-align: right;
      font-weight: 500;
    }

    label {
      margin-top: 0;
    }
  }
</style>
