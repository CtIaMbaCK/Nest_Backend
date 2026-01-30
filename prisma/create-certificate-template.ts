import { createCanvas } from 'canvas';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { env as ENV } from './config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV('CLOUDINARY_CLOUD_NAME'),
  api_key: ENV('CLOUDINARY_API_KEY'),
  api_secret: ENV('CLOUDINARY_API_SECRET'),
});

async function createCertificateTemplate() {
  console.log('🎨 Đang tạo ảnh mẫu chứng nhận...');

  // Tạo canvas 1000x700
  const width = 1000;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background màu trắng
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Viền vàng
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 20;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Viền trong màu teal
  ctx.strokeStyle = '#008080';
  ctx.lineWidth = 5;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Tiêu đề "CHỨNG NHẬN"
  ctx.fillStyle = '#008080';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CHỨNG NHẬN', width / 2, 150);

  // Subtitle
  ctx.fillStyle = '#666666';
  ctx.font = '24px Arial';
  ctx.fillText('Tình nguyện viên xuất sắc', width / 2, 200);

  // Text "Trao cho"
  ctx.fillStyle = '#333333';
  ctx.font = '28px Arial';
  ctx.fillText('Trao cho', width / 2, 280);

  // Placeholder cho tên TNV (sẽ được điền động)
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('[Tên tình nguyện viên]', width / 2, 350);

  // Gạch dưới tên
  ctx.strokeStyle = '#008080';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 370);
  ctx.lineTo(750, 370);
  ctx.stroke();

  // Text "Đã tham gia hoạt động tình nguyện"
  ctx.fillStyle = '#444444';
  ctx.font = '22px Arial';
  ctx.fillText('Đã tham gia hoạt động tình nguyện', width / 2, 410);

  // Placeholder điểm (sẽ được điền động)
  ctx.fillStyle = '#444444';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('[Số điểm]', width / 2, 450);

  // Logo BetterUS
  ctx.fillStyle = '#008080';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('BetterUS', width / 2, 560);

  // Placeholder ngày cấp (sẽ được điền động)
  ctx.fillStyle = '#666666';
  ctx.font = '22px Arial';
  ctx.fillText('[Ngày cấp]', width / 2, 620);

  console.log('✅ Đã tạo ảnh template');

  // Convert to buffer
  const buffer = canvas.toBuffer('image/png');

  console.log('☁️ Đang upload lên Cloudinary...');

  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'certificates/templates',
        public_id: 'betterus_admin_certificate_template',
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });

  console.log('✅ Upload thành công!');
  console.log('📷 URL:', (result as any).secure_url);
  console.log('\n📋 Copy URL này vào seed-admin-certificate.ts:');
  console.log((result as any).secure_url);

  return (result as any).secure_url;
}

createCertificateTemplate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
