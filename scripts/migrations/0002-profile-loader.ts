import type { PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  await prisma.loader.updateMany({
    where: { profileId: '' },
    data: { profileId: '1' }
  })
}

