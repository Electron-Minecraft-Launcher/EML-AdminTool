import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations')

  let files: string[] = []
  try {
    const allFiles = await fs.readdir(migrationsDir)
    files = allFiles.filter((f) => f.endsWith('.js')).sort() // .js because after compilation, .ts becomes .js
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log('✅ No migrations directory found. Skipping.')
      return
    }
    throw err
  }

  const appliedMigrations = await prisma.systemMigration.findMany()
  const appliedIds = new Set(appliedMigrations.map((m) => m.id))

  let applied = 0
  for (const file of files) {
    if (appliedIds.has(file)) continue

    console.log(`⏳ Applying migration: ${file}...`)
    try {
      const migrationModule = await import(path.join(migrationsDir, file))

      if (typeof migrationModule.up === 'function') {
        await migrationModule.up(prisma)
      } else {
        console.warn(`⚠️ Migration ${file} does not export an \`up\` function.`)
      }

      await prisma.systemMigration.create({
        data: { id: file }
      })
      
      console.log(`✅ Migration ${file} applied successfully.`)
      applied++
    } catch (error) {
      console.error(`❌ Critical error during migration ${file}:`, error)
      process.exit(1)
    }
  }

  console.log(`✅ Applied ${applied} migrations.`)
}

runMigrations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
