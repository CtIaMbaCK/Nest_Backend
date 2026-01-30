import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IssueAdminCertificateDto } from './dto/issue-admin-certificate.dto';
import { createCanvas, loadImage } from 'canvas';
import { Role } from 'src/generated/prisma/client';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  // ==================== ISSUE CERTIFICATES ====================

  /**
   * Admin cấp chứng nhận cho TNV (sử dụng system default template)
   */
  async issueCertificate(
    dto: IssueAdminCertificateDto,
    cloudinaryService: any,
  ) {
    try {
      console.log('🎯 Admin cấp chứng nhận:', dto);

      // Lấy system default template
      const template = await this.prisma.certificateTemplate.findFirst({
        where: {
          isSystemDefault: true,
          isActive: true,
        },
      });

      if (!template) {
        throw new BadRequestException(
          'Không tìm thấy mẫu chứng nhận mặc định của hệ thống',
        );
      }

      console.log('✅ Tìm thấy system default template:', template.name);

      // Lấy thông tin TNV
      const volunteer = await this.prisma.user.findFirst({
        where: {
          id: dto.volunteerId,
          role: Role.VOLUNTEER,
        },
        include: { volunteerProfile: true },
      });

      if (!volunteer || !volunteer.volunteerProfile) {
        throw new NotFoundException('Không tìm thấy tình nguyện viên');
      }

      console.log('✅ Tìm thấy TNV:', volunteer.volunteerProfile.fullName);

      // Chuẩn bị data để điền vào chứng nhận (CHỈ TÊN TNV)
      const certificateData = {
        volunteerName: volunteer.volunteerProfile.fullName,
        ...dto.additionalData,
      };

      console.log('📄 Dữ liệu chứng nhận:', certificateData);

      // Tạo ảnh PNG từ template
      console.log('🖨️ Bắt đầu tạo ảnh chứng nhận...');
      const imageBuffer = await this.generateCertificateImage(
        template,
        certificateData,
      );

      console.log('✅ Tạo ảnh thành công, size:', imageBuffer.length, 'bytes');

      // Upload ảnh PNG lên Cloudinary
      console.log('☁️ Bắt đầu upload ảnh lên Cloudinary...');
      const imageUrl = await this.uploadImageToCloudinary(
        imageBuffer,
        cloudinaryService,
        volunteer.volunteerProfile.fullName,
      );

      console.log('✅ Upload thành công:', imageUrl);

      // Lưu vào database với organizationId = null (Admin)
      const issuedCertificate = await this.prisma.issuedCertificate.create({
        data: {
          templateId: template.id,
          volunteerId: dto.volunteerId,
          organizationId: null, // NULL = Admin cấp
          certificateData: certificateData as any,
          pdfUrl: imageUrl,
          notes: dto.notes,
        },
        include: {
          template: true,
          volunteer: {
            include: { volunteerProfile: true },
          },
        },
      });

      console.log('✅ Lưu database thành công');

      return issuedCertificate;
    } catch (error) {
      console.error('❌ Lỗi khi cấp chứng nhận:', error);
      throw error;
    }
  }

  /**
   * Tạo ảnh PNG chứng nhận từ template và data
   * (Logic giống TCXH)
   */
  private async generateCertificateImage(
    template: any,
    data: any,
  ): Promise<Buffer> {
    try {
      console.log('Bắt đầu tạo ảnh chứng nhận PNG...');
      console.log('Template:', template.name);
      console.log('Template image URL:', template.templateImageUrl);
      console.log('Data:', data);

      const config = template.textBoxConfig;
      console.log('textBoxConfig from DB:', JSON.stringify(config, null, 2));
      console.log('textBoxConfig type:', typeof config);
      console.log('textBoxConfig keys:', Object.keys(config || {}));

      console.log('Loading background image...');

      // Xử lý WebP → PNG conversion (giống TCXH)
      let imageUrl = template.templateImageUrl;
      if (imageUrl.includes('.webp')) {
        imageUrl = imageUrl.replace(/\.webp$/, '.png');
        console.log('🔄 Converted WebP to PNG:', imageUrl);
      }

      const image = await loadImage(imageUrl);
      console.log(
        '✅ Image loaded, dimensions:',
        image.width,
        'x',
        image.height,
      );

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      console.log('Điền background image...');
      ctx.drawImage(image, 0, 0);

      console.log('Đang điền text vào certificate...');
      console.log('config:', Object.entries(config || {}));

      for (const [fieldName, fieldConfig] of Object.entries(config || {})) {
        console.log(`  🔍 Processing field: ${fieldName}`);
        console.log(`  🔍 fieldConfig:`, fieldConfig);
        console.log(`  🔍 data[${fieldName}]:`, data[fieldName]);

        if (data[fieldName] && fieldConfig) {
          const fc: any = fieldConfig;
          console.log(
            `  📐 Font config - size: ${fc.fontSize}, family: ${fc.fontFamily}, color: ${fc.color}`,
          );
          console.log(
            `  📐 Position - x: ${fc.x}, y: ${fc.y}, width: ${fc.width}, height: ${fc.height}`,
          );

          ctx.font = `${fc.fontSize}px ${fc.fontFamily}`;
          ctx.fillStyle = fc.color;
          ctx.textAlign = fc.align;

          const x = fc.align === 'center' ? fc.x + fc.width / 2 : fc.x;
          const y = fc.y + fc.fontSize;

          console.log(`  📍 Drawing at x: ${x}, y: ${y}`);

          ctx.fillText(String(data[fieldName]), x, y, fc.width);
          console.log(`  ✅ Drew field "${fieldName}": ${data[fieldName]}`);
        } else {
          console.log(
            `  ⚠️ Skipped field "${fieldName}" - data exists: ${!!data[fieldName]}, config exists: ${!!fieldConfig}`,
          );
        }
      }

      // Chuyển canvas thành PNG buffer
      console.log('🎨 Converting canvas to PNG buffer...');
      const imageBuffer = canvas.toBuffer('image/png');
      console.log('✅ PNG image created, size:', imageBuffer.length, 'bytes');
      console.log('📊 Image dimensions:', image.width, 'x', image.height);

      return imageBuffer;
    } catch (error) {
      throw new BadRequestException(
        'Lỗi khi tạo ảnh chứng nhận: ' + error.message,
      );
    }
  }

  /**
   * Upload ảnh PNG chứng nhận lên Cloudinary
   */
  private async uploadImageToCloudinary(
    imageBuffer: Buffer,
    cloudinaryService: any,
    volunteerName: string,
  ): Promise<string> {
    const fileName = `admin_certificate_${volunteerName.replace(/\s/g, '_')}_${Date.now()}`;

    // Upload PNG lên Cloudinary
    const imageUrl = await cloudinaryService.uploadImageBuffer(
      imageBuffer,
      fileName,
      'certificates',
    );
    return imageUrl;
  }

  /**
   * Lấy danh sách chứng nhận đã cấp bởi Admin
   */
  async getIssuedCertificates() {
    const certificates = await this.prisma.issuedCertificate.findMany({
      where: { organizationId: null }, // NULL = Admin cấp
      include: {
        template: true,
        volunteer: {
          include: { volunteerProfile: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certificates;
  }
}
