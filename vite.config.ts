import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

export default defineConfig({
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
    fs: {
      allow: ['files', 'static']
    },
    watch: {
      ignored: ['**/.env*']
    }
  }
})

