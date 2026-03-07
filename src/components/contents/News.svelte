<script lang="ts">
  import getUser from '$lib/utils/user'
  import type { ExtendedNews } from '$lib/utils/db'
  import type { NewsCategory, NewsTag } from '@prisma/client'
  import type { PageData } from '../../routes/(app)/dashboard/news/$types'
  import type { File as File_ } from '$lib/utils/types'
  import AddEditNewsModal from '../modals/AddEditNewsModal.svelte'
  import ReadNewsModal from '../modals/ReadNewsModal.svelte'
  import { callAction } from '$lib/utils/call'
  import { l } from '$lib/stores/language'
  import { invalidateAll } from '$app/navigation'

  interface Props {
    news: PageData['news']
    newsCategories: NewsCategory[]
    newsTags: NewsTag[]
    images: File_[]
  }

  let { news, newsCategories, newsTags, images }: Props = $props()

  const user = getUser()

  let showReadNewsModal = $state(false)
  let showAddEditNewsModal = $state(false)
  let selectedNewsId: string | null = $state(null)
  let selectedNews: ExtendedNews[] = $state([])

  let iLength = 25
  let iStart = $state(0)

  function showNews(news_: ExtendedNews) {
    selectedNewsId = news_.id
    if (news_.authorId == user.id) showAddEditNewsModal = true
    else showReadNewsModal = true
  }

  function selectNews(e: Event, news_: ExtendedNews) {
    if (user.p_news === 2 || news_.authorId == user.id) {
      e.stopPropagation()
      if ((e.target as HTMLInputElement).checked) {
        selectedNews = [...selectedNews, news_]
      } else {
        selectedNews = selectedNews.filter((n) => n !== news_)
      }
    }
  }

  function removeNl(str: string) {
    return str.replace(/\n/g, ' ')
  }

  function backgroundColor(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  }

  async function deleteNews() {
    if (selectedNews.length === 0) return
    if (!confirm('Are you sure you want to delete the selected news?')) return

    const formData = new FormData()
    for (const { id } of selectedNews) formData.append('news-id', id)

    await callAction({ url: '/dashboard/news', action: 'deleteNews', formData }, $l)
    invalidateAll()
    selectedNews = []

    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach((checkbox) => {
      ;(checkbox as HTMLInputElement).checked = false
    })
    selectedNewsId = null
  }
</script>

{#if showAddEditNewsModal}
  <AddEditNewsModal bind:show={showAddEditNewsModal} {selectedNewsId} {news} {newsCategories} {newsTags} {images} />
{/if}
{#if showReadNewsModal && selectedNewsId}
  <ReadNewsModal bind:show={showReadNewsModal} {selectedNewsId} {news} {newsCategories} {newsTags} {images} />
{/if}

<button
  class="primary small add"
  style="margin-right: 30px"
  onclick={() => {
    selectedNewsId = null
    showAddEditNewsModal = true
  }}
>
  <i class="fa-solid fa-plus"></i>&nbsp;&nbsp;New news
</button>

<button class="secondary small" disabled={selectedNews.length === 0} onclick={deleteNews}>
  <i class="fa-solid fa-trash"></i>&nbsp;&nbsp;Delete
</button>

<div class="list-container">
  <div class="list">
    {#each news as news_, i}
      {#if i >= iStart && i < iStart + iLength}
        <button class="list news" class:focused={selectedNews.includes(news_)} onclick={() => showNews(news_)} aria-label="News item">
          <div class="checkbox">
            <input type="checkbox" disabled={user.p_news !== 2 && news_.authorId != user.id} onclick={(e) => selectNews(e, news_)} />
          </div>
          <div class="content">
            <p class="label">
              {#if news_.categories.length > 0}
                <span style="margin-right: 20px">
                  <i class="fa-solid fa-tag"></i>&nbsp;&nbsp;{news_.categories.map((cat) => cat.name).join(', ')}
                </span>
              {/if}
              <span style="margin-right: 20px" title={news_.updatedAt ? 'Edited on ' + new Date(news_.updatedAt).formatDate() : ''}>
                <i class="fa-solid fa-calendar"></i>&nbsp;&nbsp;{new Date(news_.createdAt).formatDate()}
              </span>
              <span>
                <i class="fa-solid fa-user"></i>&nbsp;&nbsp;{news_.author?.username ?? 'Unknown author'}
              </span>
            </p>
            <h4>{news_.title}</h4>
            <p class="content">{removeNl(news_.content)}</p>
            {#each news_.tags as tag}
              <span class="tag" style="color: {tag.color}; background-color: {backgroundColor(tag.color)}">
                <i class="fa-solid fa-hashtag"></i>{tag.name}
              </span>
            {/each}
          </div>
        </button>
      {/if}
    {/each}
  </div>
</div>

{#if news?.length === 0}
  <p class="nothing">No news</p>
{/if}

<div class="info">
  <p>
    {news.length > 0 ? iStart + 1 : 0}-{news.length <= iStart + iLength ? news.length : iStart + iLength} of {news.length} news
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
      disabled={iStart + iLength >= news.length}
      onclick={() => {
        iStart += iLength
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      aria-label="Next page"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </p>
  {#if selectedNews.length === 1}
    <p>1 news selected</p>
  {:else if selectedNews.length > 1}
    <p>{selectedNews.length} news selected</p>
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
    overflow-y: inherit !important;

    div.list {
      min-height: auto !important;
      overflow-y: inherit !important;
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

      h4 {
        margin: 8px 0 8px 0;
        font-weight: 400;
        font-size: 16px;
      }

      p.label {
        margin-top: 0;
        font-size: 13px;
      }

      p.content {
        margin: 0;
        font-size: 13px;
        overflow: hidden;
        display: -webkit-box;
        text-overflow: ellipsis;
        line-clamp: 3;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        max-height: 62.39px;
      }

      span.tag {
        display: inline-block;
        margin-top: 5px;
        margin-right: 5px;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;

        i {
          margin-right: 5px;
        }
      }
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
