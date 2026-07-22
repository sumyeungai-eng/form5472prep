import { prisma } from "@/lib/prisma"

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()

  if (!email) {
    throw new Error("Usage: npx tsx scripts/create_admin.ts <email>")
  }

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { active: true },
    create: { email },
  })

  console.log(`Admin ready: ${admin.email} (${admin.id})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
