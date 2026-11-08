<script lang="ts">
  interface Props {
    padding?: string
    height?: string
    randomWidth?: { times: number; min: number }
    customStyle?: { [key: string]: string }[]
  }

  let { padding = '0px', height = '24px', randomWidth = { times: 100, min: 30 }, customStyle = [] }: Props = $props()
  let width: string = ''
  let style = $state('')

  width = Math.random() * randomWidth.times + randomWidth.min + 'px'

  style += 'padding: ' + padding + '; '
  style += 'height: ' + height + '; '
  style += 'width: ' + width + '; '

  customStyle.forEach((element) => {
    style += Object.entries(element)[0][0] + ': ' + element[Object.entries(element)[0][0]] + ' !important; '
  })
</script>

<span class="span-skeleton" {style}></span>

<style lang="scss">
  span {
    display: inline-block;
    height: 24px;
    animation-name: skeleton;
    animation-duration: 1.3s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
    border-radius: 3px;
    min-width: 30px;
  }

  @keyframes skeleton {
    0% {
      background: var(--skeleton-color);
    }

    40% {
      background: var(--skeleton-highlight-color);
    }

    60% {
      background: var(--skeleton-color);
    }

    100% {
      background: var(--skeleton-color);
    }
  }
</style>
