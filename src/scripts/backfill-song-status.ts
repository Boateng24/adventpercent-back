import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await (prisma.song as any).updateMany({
    data: { status: 'APPROVED' },
  });

  console.log(`Backfill complete — ${result.count} songs set to APPROVED.`);
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
