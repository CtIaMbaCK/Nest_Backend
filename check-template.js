const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.certificateTemplate.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      textBoxConfig: true,
      organizationId: true,
    },
  });

  console.log('📋 Found templates:', templates.length);
  templates.forEach((t, i) => {
    console.log(`\n${i + 1}. ${t.name} (ID: ${t.id})`);
    console.log('   Organization ID:', t.organizationId);
    console.log('   textBoxConfig:', JSON.stringify(t.textBoxConfig, null, 4));
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
