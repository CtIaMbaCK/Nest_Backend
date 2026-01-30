import { createCanvas, loadImage } from 'canvas';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { env as ENV } from './config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV('CLOUDINARY_CLOUD_NAME'),
  api_key: ENV('CLOUDINARY_API_KEY'),
  api_secret: ENV('CLOUDINARY_API_SECRET'),
});

// Các config khác nhau để test
const TEST_CONFIGS = [
  {
    name: 'Config 1 - Hiện tại',
    x: 100,
    y: 600,
    fontSize: 60,
    fontFamily: 'Times New Roman',
  },
  {
    name: 'Config 2 - Dịch lên trên',
    x: 100,
    y: 550,
    fontSize: 60,
    fontFamily: 'Times New Roman',
  },
  {
    name: 'Config 3 - Dịch xuống dưới',
    x: 100,
    y: 650,
    fontSize: 60,
    fontFamily: 'Times New Roman',
  },
  {
    name: 'Config 4 - Font nhỏ hơn',
    x: 100,
    y: 600,
    fontSize: 48,
    fontFamily: 'Times New Roman',
  },
  {
    name: 'Config 5 - Font lớn hơn',
    x: 100,
    y: 600,
    fontSize: 72,
    fontFamily: 'Times New Roman',
  },
  {
    name: 'Config 6 - Arial Bold',
    x: 100,
    y: 600,
    fontSize: 60,
    fontFamily: 'Arial',
  },
];

async function testCertificatePosition() {
  const templateUrl = 'https://res.cloudinary.com/dj8d3e2d9/image/upload/v1769588119/certificate-templates/v34rszucyqbdp7slzc99.png';
  const testName = 'Nguyễn Văn A';

  console.log('🎨 Đang tạo chứng nhận test với các config khác nhau...\n');

  for (const config of TEST_CONFIGS) {
    console.log(`\n📋 Testing: ${config.name}`);
    console.log(`   x: ${config.x}, y: ${config.y}, fontSize: ${config.fontSize}, font: ${config.fontFamily}`);

    try {
      // Load template
      const image = await loadImage(templateUrl);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.drawImage(image, 0, 0);

      // Draw text
      ctx.font = `${config.fontSize}px ${config.fontFamily}`;
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'center';

      const x = config.x + 800 / 2; // Căn giữa với width = 800
      const y = config.y + config.fontSize;

      ctx.fillText(testName, x, y, 800);

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'certificates/test',
            public_id: `test_config_${TEST_CONFIGS.indexOf(config) + 1}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(buffer);
      });

      console.log(`   ✅ Uploaded: ${(result as any).secure_url}`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n✅ Hoàn thành! Kiểm tra các URL trên để chọn config phù hợp nhất.');
}

testCertificatePosition()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });
