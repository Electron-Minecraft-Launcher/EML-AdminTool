import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runMigrations() {
  console.log('📦 Starting database and file migrations...')

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
    } catch (error) {
      console.error(`❌ Critical error during migration ${file}:`, error)
      process.exit(1)
    }
  }

  console.log('✅ All migrations applied.')
}

runMigrations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
