import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    select: { email: true }
  });
  console.log(JSON.stringify(patients));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
