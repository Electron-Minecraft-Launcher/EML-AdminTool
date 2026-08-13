import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

const warmupClientFiles = [
  'src/routes/+layout.svelte',
  'src/routes/+page.server.ts',
  'src/routes/(app)/login/+page.svelte',
  'src/routes/(app)/dashboard/+page.svelte',
  'src/routes/(setup)/setup/+page.svelte',
  'src/components/layouts/Markdown.svelte',
  'src/components/layouts/Notifications.svelte'
]

const warmupSsrFiles = [
  'src/routes/+layout.server.ts',
  'src/routes/+page.server.ts',
  'src/routes/(app)/login/+page.server.ts',
  'src/routes/(app)/dashboard/+page.server.ts',
  'src/routes/(setup)/setup/+page.server.ts'
]

export default defineConfig({
  optimizeDeps: {
    include: ['marked', 'marked-alert', 'marked-highlight', 'highlight.js', 'isomorphic-dompurify']
  },
  plugins: [
    sveltekit(),
  ],
  server: {
    preTransformRequests: true,
    warmup: {
      clientFiles: warmupClientFiles,
      ssrFiles: warmupSsrFiles
    },
    fs: {
      allow: ['static']
    },
    watch: {
      ignored: ['**/.env*']
    }
  }
})

