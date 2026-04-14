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
    {
      name: 'serve-raw-files-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/files/')) {
            try {
              const decodedUrl = decodeURIComponent(req.url.split('?')[0])
              const filePath = path.join(process.cwd(), decodedUrl)

              if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const fileName = path.basename(filePath)
                const mimeType = mime.lookup(filePath) || 'application/octet-stream'

                res.setHeader('Content-Type', mimeType)
                res.setHeader('Cache-Control', 'no-transform')
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

                fs.createReadStream(filePath).pipe(res)
                return
              }
            } catch (err) {
              console.error('Vite middleware error:', err)
            }
          }
          next()
        })
      }
    }
  ],
  server: {
    preTransformRequests: true,
    warmup: {
      clientFiles: warmupClientFiles,
      ssrFiles: warmupSsrFiles
    },
    fs: {
      allow: ['files', 'static']
    },
    watch: {
      ignored: ['**/.env*']
    }
  }
})

