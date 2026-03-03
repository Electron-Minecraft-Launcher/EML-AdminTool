import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://eml:eml@dbs:5432/eml_admintool' // default for build without env
  }
})
