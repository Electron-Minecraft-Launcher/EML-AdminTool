import type { PrismaClient } from '@prisma/client'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

export async function up(prisma: PrismaClient) {
  const defaultProfile = await prisma.profile.findUnique({ where: { id: '1' } })
  if (!defaultProfile) {
    console.warn('Default profile not found, skipping file migration.')
    return
  }

  const slug = defaultProfile.slug
  const srcDir = path.join(root, 'files', 'files-updater')
  const destDir = path.join(root, 'files', 'files-updater', slug)

  if (existsSync(destDir)) {
    console.log(`Directory files-updater/${slug} already exists, skipping.`)
    return
  }

  await fs.mkdir(destDir, { recursive: true })

  let entries: string[] = []
  try {
    entries = await fs.readdir(srcDir)
  } catch {
    console.log('No files-updater directory found, skipping.')
    return
  }

  for (const entry of entries) {
    if (entry === slug) continue
    await fs.rename(path.join(srcDir, entry), path.join(destDir, entry))
  }

  console.log(`Moved files-updater contents to files-updater/${slug}.`)

  const cacheFile = path.join(root, 'files', 'cache', 'files-updater.json')
  if (existsSync(cacheFile)) {
    await fs.unlink(cacheFile)
    console.log('Deleted old files-updater cache.')
  }
}

