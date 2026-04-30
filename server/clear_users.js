import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: {
      role: { not: 'ADMIN' }
    }
  });
  console.log(`Successfully cleared ${result.count} non-admin users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
