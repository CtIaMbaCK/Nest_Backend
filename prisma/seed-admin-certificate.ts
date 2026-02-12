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
  console.log('🌱 Đang kiểm tra system default certificate template...');

  // 1. Định nghĩa dữ liệu chuẩn để dùng cho cả Create và Update
  const templateData = {
    organizationId: null, // NULL = System template
    isSystemDefault: true,
    name: 'Chứng nhận BetterUS',
    description:
      'Mẫu chứng nhận mặc định của hệ thống BetterUS dành cho tình nguyện viên xuất sắc',
    // URL ảnh template thật đã upload lên Cloudinary
    templateImageUrl:
      'https://res.cloudinary.com/dj8d3e2d9/image/upload/v1769588119/certificate-templates/v34rszucyqbdp7slzc99.png',
    textBoxConfig: {
      // Chỉ cần điền tên TNV vào vị trí chỗ trống trên template
      volunteerName: {
        x: 100, // Vị trí X bắt đầu text
        y: 600, // Vị trí Y bắt đầu text
        width: 800, // Độ rộng vùng text
        height: 100, // Độ cao vùng text
        fontSize: 72, // Cỡ chữ lớn hơn (Config 5)
        fontFamily: 'Times New Roman', // Font serif cho formal hơn
        color: '#1a1a1a', // Màu đen đậm
        align: 'center', // Căn giữa
      },
    },
    isActive: true,
  };

  // 2. Tìm bản ghi hiện tại
  const existing = await prisma.certificateTemplate.findFirst({
    where: { isSystemDefault: true },
  });

  if (existing) {
    // 3. Nếu đã có => UPDATE lại để sửa URL lỗi
    console.log(
      `⚠️ Đã có template (ID: ${existing.id}). Đang cập nhật lại dữ liệu mới...`,
    );

    const updated = await prisma.certificateTemplate.update({
      where: { id: existing.id },
      data: templateData,
    });

    console.log('✅ Đã cập nhật template thành công:', updated.name);
  } else {
    // 4. Nếu chưa có => CREATE mới
    console.log('✨ Chưa có template. Đang tạo mới...');

    const created = await prisma.certificateTemplate.create({
      data: templateData,
    });

    console.log('✅ Đã tạo system default certificate template:', created.name);
    console.log('📋 Template ID:', created.id);
  }
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
