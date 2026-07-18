import { ProfileVisibility, type PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  const profiles = await prisma.profile.findMany()

  for (const profile of profiles) {
    if (profile.hidden) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { visibility: ProfileVisibility.HIDDEN }
      })
    } else {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { visibility: ProfileVisibility.PROTECTED }
      })
    }
  }

  console.log(`Migrated profile visibility settings.`)
}
