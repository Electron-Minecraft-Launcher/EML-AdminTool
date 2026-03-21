<script lang="ts">
  import { applyAction, enhance } from '$app/forms'
  import { l } from '$lib/stores/language'
  import { addNotification } from '$lib/stores/notifications'
  import type { PageData } from '../../routes/(app)/dashboard/emlat-settings/$types'
  import type { SubmitFunction } from '@sveltejs/kit'
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
  let p_bootstraps = $state(selectedUser.p_bootstraps === 1)
  let p_maintenance = $state(selectedUser.p_maintenance === 1)
  let p_news_1 = $state(selectedUser.p_news >= 1)
  let p_news_2 = $state(selectedUser.p_news === 2)
  let p_newsCategories = $state(selectedUser.p_newsCategories === 1)
  let p_newsTags = $state(selectedUser.p_newsTags === 1)
  let p_backgrounds = $state(selectedUser.p_backgrounds === 1)
  let p_stats_1 = $state(selectedUser.p_stats >= 1)
  let p_stats_2 = $state(selectedUser.p_stats === 2)
  let p_filesUpdater = $state(
    data.profiles.map((profile) => {
      const existing = data.userPermissions.find((p) => p.profileId === profile.id && p.userId === selectedUserId)
      return {
        profileId: profile.id,
        p1: (existing?.permission ?? 0) >= 1,
        p2: (existing?.permission ?? 0) === 2
      }
    })
  )

  let showLoader = $state(false)

  const enhanceForm: SubmitFunction = ({ formData }) => {
    showLoader = true
    const serializedPermissions = p_filesUpdater.map((p) => ({
      profileId: p.profileId,
      permission: p.p2 ? 2 : p.p1 ? 1 : 0
    }))

    formData.set('user-id', selectedUserId)
    formData.set('p_files-updater', JSON.stringify(serializedPermissions))

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
    <h2>
      {action === 'ACCEPT' ? $l.dashboard.emlatSettings.userManagement.modal.acceptUser : $l.dashboard.emlatSettings.userManagement.modal.title}
    </h2>

    <label for="username" style="margin-top: 0">{$l.common.username}</label>
    <input type="text" id="username" name="username" bind:value={selectedUser.username} />

    <p class="label" style="margin-top: 20px">{$l.dashboard.emlatSettings.userManagement.modal.permissions}</p>

    <div class="permissions">
      <div class="permission">
        <p>Files Updater</p>
        <div class="right">
          {#each data.profiles as profile, i}
            <p class="profile-name">{profile.name}</p>
            <label class="p" for="perm-{profile.id}-1">
              <input
                type="checkbox"
                id="perm-{profile.id}-1"
                bind:checked={p_filesUpdater[i].p1}
                onchange={() => {
                  if (!p_filesUpdater[i].p1) p_filesUpdater[i].p2 = false
                }}
              /> Add, edit and delete files
            </label>
            <label class="p" for="perm-{profile.id}-2">
              <input
                type="checkbox"
                id="perm-{profile.id}-2"
                bind:checked={p_filesUpdater[i].p2}
                onchange={() => {
                  if (p_filesUpdater[i].p2) p_filesUpdater[i].p1 = true
                }}
              /> Change Minecraft loader
            </label>
          {/each}
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

  div.permissions {
    max-height: 400px;
    overflow-y: auto;
  }

  div.permission {
    display: flex;
    gap: 20px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    margin-top: 5px;
    padding: 5px;

    &:first-child {
      margin-top: 0;
    }

    p {
      width: 200px;
      text-align: right;
      font-weight: 500;
    }

    label {
      margin-top: 0;
    }

    p.profile-name {
      width: auto;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      color: #606060;
      margin-top: 8px;
      margin-bottom: 0;

      &:first-child {
        margin-top: 0;
      }
    }
  }
</style>
