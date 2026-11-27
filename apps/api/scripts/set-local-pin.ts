import { prisma } from '../src/lib/prisma'
import { hashLocalPin } from '../src/lib/pin'

async function main(): Promise<void> {
  const pin = process.env.NIBHRITO_LOCAL_PIN
  if (!pin || !/^[0-9]{6,12}$/.test(pin)) {
    throw new Error('Set NIBHRITO_LOCAL_PIN to a 6–12 digit PIN, then rerun this command.')
  }

  const pinHash = hashLocalPin(pin)
  const existing = await prisma.localProfile.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })

  if (existing) {
    await prisma.localProfile.update({ where: { id: existing.id }, data: { pinHash } })
    process.stdout.write('Nibhrito local PIN updated.\n')
  } else {
    await prisma.localProfile.create({ data: { pinHash, name: 'Owner' } })
    process.stdout.write('Nibhrito local PIN configured.\n')
  }
}

main()
  .catch((error: unknown) => {
    process.stderr.write((error instanceof Error ? error.message : 'PIN setup failed') + '\n')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
