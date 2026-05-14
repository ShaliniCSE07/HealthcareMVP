import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);
  await prisma.user.update({
    where: { email: 'reachmeshal@gmail.com' },
    data: { passwordHash }
  });
  console.log('Password reset for reachmeshal@gmail.com');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
