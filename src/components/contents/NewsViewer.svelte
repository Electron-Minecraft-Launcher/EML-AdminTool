<script lang="ts">
  import type { NewsCategory, NewsTag } from '@prisma/client'
  import Markdown from '../layouts/Markdown.svelte'

  interface Props {
    title: string
    content: string
    author: { id: string; username: string }
    createdAt: Date
    updatedAt?: Date
    categories: NewsCategory[]
    tags: NewsTag[]
  }

  let { title, content, author, createdAt, updatedAt, categories, tags }: Props = $props()

  function backgroundColor(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.1)`
  }
</script>

<p class="label">
  {#if categories.length > 0}
    <span style="margin-right: 20px">
      <i class="fa-solid fa-tag"></i>&nbsp;&nbsp;{categories.map((cat) => cat.name).join(', ')}
    </span>
  {/if}
  <span style="margin-right: 20px" title={updatedAt ? 'Edited on ' + new Date(updatedAt).formatDate() : ''}>
    <i class="fa-solid fa-calendar"></i>&nbsp;&nbsp;{new Date(createdAt).formatDate()}
  </span>
  <span>
    <i class="fa-solid fa-user"></i>&nbsp;&nbsp;{author?.username ?? 'Unknown author'}
  </span>
</p>

<p class="name">{title !== '' ? title : 'Untitled'}</p>

<div class="content">
  <Markdown source={content} />

  <div class="tags">
    {#each tags as tag}
      <span class="tag" style="color: {tag.color}; background-color: {backgroundColor(tag.color!)}">
        <i class="fa-solid fa-hashtag"></i>{tag.name}
      </span>
    {/each}
  </div>
</div>

<style lang="scss">
  p.label {
    font-size: 13px !important;
  }

  p.name {
    font-size: 17px;
    font-weight: 500;
  }

  div.content {
    height: calc(100vh - 384px);
    margin-top: 20px;
    overflow-y: auto;
  }

  div.tags {
    margin-top: 10px;
    display: flex;
    gap: 0;
  }

  span.tag {
    display: block;
    margin-top: 5px;
    margin-right: 5px;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;

    i {
      margin-right: 5px;
    }
  }
</style>
