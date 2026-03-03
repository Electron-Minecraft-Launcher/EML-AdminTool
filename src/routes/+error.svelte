<script lang="ts">
  import { page } from '$app/state'
  import { l } from '$lib/stores/language'
  import getEnv from '$lib/utils/env'
  import type { NotificationCode } from '$lib/utils/notifications'
  import Footer from '../components/layouts/Footer.svelte'

  const env = getEnv()

  const message = $state(page.status === 404 ? $l.notifications.NOT_FOUND_ERROR : page?.error?.code ? $l.notifications[page.error.code] : page?.error?.message || $l.notifications.INTERNAL_SERVER_ERROR)

  function reload() {
    window.location.reload()
  }
</script>

<svelte:head>
  <title>{page.status} • {env.name} AdminTool</title>
</svelte:head>

<div class="flex">
  <div class="img">
    <img src="/images/emlat-mc.png" alt="EML AdminTool" />
  </div>
  <div class="msg">
    <h1>
      <span>Error</span><br />
      {page.status}
    </h1>
    <p class="msg">{message}</p>

    <button class="secondary" onclick={reload}><i class="fa-solid fa-rotate-right"></i>&nbsp;&nbsp;Try to reload the page</button>
    <a class="secondary" href="/dashboard"><i class="fa-solid fa-home"></i>&nbsp;&nbsp;Go to Dashboard</a>
  </div>
</div>

<div class="footer-container">
  <Footer />
</div>

<style lang="scss">
  div.flex {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 0 100px;
  }

  div.img {
    flex: 1;
    display: flex;
    justify-content: center;

    img {
      width: 375px;
      height: 385px;
      object-fit: contain;
      filter: grayscale(100%);
    }
  }

  div.msg {
    flex: 1;
    text-align: center;

    h1 {
      font-size: 80px;
      margin-bottom: 20px;
      line-height: 1.1;

      span {
        font-size: 50px;
      }
    }

    p.msg {
      font-size: 20px;
      color: #333;
    }

    button {
      display: block;
      margin: 50px auto 30px auto;
    }

    a {
      display: inline-block;
      margin-bottom: 100px;
    }
  }

  div.footer-container {
    padding: 50px 100px 0 100px;
    position: relative;
  }
</style>
