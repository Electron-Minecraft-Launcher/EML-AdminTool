import type { PrismaClient } from '@prisma/client'

export async function up(prisma: PrismaClient) {
  await prisma.user.updateMany({
    where: { isAdmin: true },
    data: {
      p_crashReports: 2
    }
  })

  console.log(`Migrated permissions for admin user to have full crash report access.`)
}
