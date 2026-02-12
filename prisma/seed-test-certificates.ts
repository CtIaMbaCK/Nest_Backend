import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import { env as ENV } from './config';

const pool = new Pool({
  connectionString: ENV('DATABASE_URL'),
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Đang tạo test certificates...');

  // 1. Lấy template
  const template = await prisma.certificateTemplate.findFirst({
    where: { isSystemDefault: true },
  });

  if (!template) {
    console.error('❌ Không tìm thấy template. Chạy seed-admin-certificate trước!');
    return;
  }

  console.log('✅ Found template:', template.name);

  // 2. Tìm một volunteer để test
  const volunteer = await prisma.user.findFirst({
    where: {
      role: 'VOLUNTEER',
    },
    include: {
      volunteerProfile: true,
    },
  });

  if (!volunteer) {
    console.error('❌ Không tìm thấy volunteer nào trong DB');
    return;
  }

  console.log('✅ Found volunteer:', volunteer.volunteerProfile?.fullName);

  // 3. Tạo test certificate
  const existing = await prisma.issuedCertificate.findFirst({
    where: {
      volunteerId: volunteer.id,
      templateId: template.id,
    },
  });

  if (existing) {
    console.log('⚠️ Certificate đã tồn tại, bỏ qua');
    return;
  }

  const certificate = await prisma.issuedCertificate.create({
    data: {
      volunteerId: volunteer.id,
      templateId: template.id,
      organizationId: null, // Admin issued
      pdfUrl: template.templateImageUrl, // Dùng tạm template image
      certificateData: {
        volunteerName: volunteer.volunteerProfile?.fullName || 'Tình nguyện viên',
        templateTitle: template.name,
        organizationName: 'Admin',
      },
      issuedAt: new Date(),
      notes: 'Test certificate for development',
    },
  });

  console.log('✅ Đã tạo test certificate:', certificate.id);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
