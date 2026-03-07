import type { PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  const existingProfile = await prisma.profile.findUnique({
    where: { id: '1' }
  })

  if (existingProfile) return

  const env = await prisma.environment.findFirst()
  const name = env?.name || 'EML'

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')

  await prisma.profile.create({
    data: {
      id: '1',
      name,
      isDefault: true,
      slug
    }
  })
}
