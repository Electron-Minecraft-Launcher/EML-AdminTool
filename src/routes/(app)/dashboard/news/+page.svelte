<script lang="ts">
  import getEnv from '$lib/utils/env'
  import getUser from '$lib/utils/user'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import News from '../../../../components/contents/News.svelte'
  import NewsCategories from '../../../../components/contents/NewsCategories.svelte'
  import NewsTags from '../../../../components/contents/NewsTags.svelte'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()

  const env = getEnv()
  const user = getUser()

  let news = $state(data.news)
  let newsCategories = $state(data.newsCategories)
  let newsTags = $state(data.newsTags)
  let images = $state(data.images)
  let count = $state(data.newsCount)

  let showAddEditCategoryModal = $state(false)
  let selectedCategoryId: string | null = $state(null)

  let showAddEditTagModal = $state(false)
  let selectedTagId: string | null = $state(null)

  $effect(() => {
    if (data.news) news = data.news
    if (data.newsCategories) newsCategories = data.newsCategories
    if (data.newsTags) newsTags = data.newsTags
    if (data.images) images = data.images
    if (data.newsCount) count = data.newsCount
  })

  function handleNewsPageChange(newsPage: number) {
    const url = new URL(page.url)
    url.searchParams.set('page', newsPage.toString())
    goto(url.toString(), { keepFocus: true, invalidateAll: true })
  }
</script>

<svelte:head>
  <title>News • {env.name} AdminTool</title>
</svelte:head>

<h2>News</h2>

<section class="section">
  <h3>News</h3>

  <News {news} {newsCategories} {newsTags} {images} {count} page={data.newsPage} pageSize={data.newsPageSize} onPageChange={handleNewsPageChange} />
</section>

{#if user.p_newsCategories}
  <section class="section">
    <button
      class="secondary right"
      onclick={() => {
        selectedCategoryId = null
        showAddEditCategoryModal = true
      }}
      aria-label="Add News Category"
    >
      <i class="fa-solid fa-plus"></i>
    </button>

    <h3>Categories</h3>

    <NewsCategories {newsCategories} bind:showAddEditCategoryModal bind:selectedCategoryId />
  </section>
{/if}

{#if user.p_newsTags}
  <section class="section">
    <button
      class="secondary right"
      onclick={() => {
        selectedTagId = null
        showAddEditTagModal = true
      }}
      aria-label="Add News Tag"
    >
      <i class="fa-solid fa-plus"></i>
    </button>

    <h3>Tags</h3>

    <NewsTags {newsTags} bind:showAddEditTagModal bind:selectedTagId></NewsTags>
  </section>
{/if}

<style lang="scss">
  @use '../../../../../static/scss/dashboard.scss';

  div.container button {
    display: inline-block;
    margin-top: 0;
    border-bottom: none;
    color: #1e1e1e;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 250px;
    vertical-align: bottom;
    font-family: 'Poppins';
    background: none;
    line-height: 15px;

    &:hover {
      background: #eeeeee;
    }

    &.remove {
      display: inline-block;
      border-bottom: none;
      margin-left: 5px;
      position: relative;
      background: none;
      color: var(--red-color);
      vertical-align: middle;

      &:hover {
        background: #faeeee;
      }
    }
  }
</style>
