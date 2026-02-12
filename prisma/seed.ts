import { PrismaClient } from 'src/generated/prisma/client';
import { helpHashPassword } from 'src/helpers/utils';
import { Pool } from 'pg';
import 'dotenv/config';
import { env as ENV } from './config';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: ENV('DATABASE_URL'),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('seed du lieu');

  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      phoneNumber: '0385279610',
      passwordHash: await helpHashPassword('admin123456'),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('User admin da duoc tao:', user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('Lỗi ở file seed.ts', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
