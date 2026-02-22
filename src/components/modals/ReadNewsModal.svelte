<script lang="ts">
  import type { NewsCategory, NewsTag } from '@prisma/client'
  import type { PageData } from '../../routes/(app)/dashboard/news/$types'
  import type { File as File_ } from '$lib/utils/types'
  import ModalTemplate from './__ModalTemplate.svelte'
  import NewsViewer from '../contents/NewsViewer.svelte'

  interface Props {
    show: boolean
    news: NonNullable<PageData['news']>
    newsCategories: NewsCategory[]
    newsTags: NewsTag[]
    images: File_[]
    selectedNewsId: string
  }

  let { show = $bindable(), news, newsCategories, newsTags, images, selectedNewsId }: Props = $props()

  let selectedNews = $state(news.find((n) => n.id === selectedNewsId)!)
  let title = $state(selectedNews?.title ?? '')
  let content = $state(selectedNews?.content ?? '')
  let categories = $state(selectedNews?.categories ?? [])
  let tags = $state(selectedNews?.tags ?? [])
</script>

<ModalTemplate size={'m'} bind:show>
  <h2>Read news</h2>

  <NewsViewer
    {title}
    {content}
    author={selectedNews.author}
    {categories}
    {tags}
    createdAt={selectedNews.createdAt}
    updatedAt={selectedNews.updatedAt}
  />

  <div class="actions">
    <button type="button" class="secondary" onclick={() => (show = false)}>Close</button>
  </div>
</ModalTemplate>

<style lang="scss">
  @use '../../../static/scss/modals.scss';

  button.secondary {
    margin-top: 30px
  }
</style>
