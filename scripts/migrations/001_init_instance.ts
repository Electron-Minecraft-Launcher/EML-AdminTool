import type { PrismaClient } from '@prisma/client'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function up(prisma: PrismaClient) {
  const env = await prisma.environment.findFirst()
  const instanceName = env?.name || 'default'

  let instance = await prisma.instance.findFirst()
  if (!instance) {
    instance = await prisma.instance.create({
      data: { name: instanceName }
    })
  }

  const sourceDir = '/app/files/files-updater'
  const targetDir = path.join('/app/files/files-updater', instance.name)

  try {
    const sourceExists = await fs
      .access(sourceDir)
      .then(() => true)
      .catch(() => false)
    if (!sourceExists) return

    await fs.mkdir(targetDir, { recursive: true })

    const files = await fs.readdir(sourceDir)
    for (const file of files) {
      const oldPath = path.join(sourceDir, file)
      const newPath = path.join(targetDir, file)
      await fs.rename(oldPath, newPath)
    }

    await fs.rmdir(sourceDir).catch(() => {})
  } catch (err) {
    console.error('Error while migrating files:', err)
    throw err
  }
}
