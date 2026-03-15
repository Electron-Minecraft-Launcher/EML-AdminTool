import type { PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  // Ensure all loaders without a profileId are attached to the default profile.
  // This should already be handled by the @default("1") in the schema,
  // but we enforce it here as a safety net.
  await prisma.loader.updateMany({
    where: { profileId: '' },
    data: { profileId: '1' }
  })
}

