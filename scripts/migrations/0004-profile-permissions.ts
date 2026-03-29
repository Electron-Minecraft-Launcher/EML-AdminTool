import type { PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  const defaultProfile = await prisma.profile.findUnique({ where: { id: '1' } })
  if (!defaultProfile) {
    console.warn('Default profile not found, skipping permissions migration.')
    return
  }

  const users = await prisma.user.findMany({
    where: { p_filesUpdater: { gt: 0 } }
  })

  for (const user of users) {
    await prisma.userProfilePermission.upsert({
      where: { userId_profileId: { userId: user.id, profileId: defaultProfile.id } },
      create: {
        userId: user.id,
        profileId: defaultProfile.id,
        permission: user.p_filesUpdater
      },
      update: {}
    })
  }

  console.log(`Migrated ${users.length} user(s) to UserProfilePermission.`)
}
