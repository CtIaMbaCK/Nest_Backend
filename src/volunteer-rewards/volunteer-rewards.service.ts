/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerCommentDto } from './dto/create-volunteer-comment.dto';
import { UpdateVolunteerCommentDto } from './dto/update-volunteer-comment.dto';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { createCanvas, loadImage } from 'canvas';
import { Role } from 'src/generated/prisma/client';

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
@Injectable()
export class VolunteerRewardsService {
  constructor(private prisma: PrismaService) {}

  // ==================== VOLUNTEER COMMENTS ====================

  /**
   * TCXH tạo nhận xét cho TNV
   */
  async createComment(organizationId: string, dto: CreateVolunteerCommentDto) {
    // Kiểm tra volunteer tồn tại và có role VOLUNTEER
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

    // Tạo comment
    const comment = await this.prisma.volunteerComment.create({
      data: {
        volunteerId: dto.volunteerId,
        organizationId,
        comment: dto.comment,
        rating: dto.rating,
      },
      include: {
        volunteer: {
          include: { volunteerProfile: true },
        },
        organization: {
          include: { organizationProfiles: true },
        },
      },
    });

    return comment;
  }

  /**
   * Lấy danh sách nhận xét của TNV
   */
  async getVolunteerComments(volunteerId: string) {
    const comments = await this.prisma.volunteerComment.findMany({
      where: { volunteerId },
      include: {
        organization: {
          include: { organizationProfiles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  /**
   * TCXH lấy danh sách nhận xét đã gửi
   */
  async getOrganizationComments(organizationId: string) {
    const comments = await this.prisma.volunteerComment.findMany({
      where: { organizationId },
      include: {
        volunteer: {
          include: { volunteerProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  /**
   * Cập nhật nhận xét
   */
  async updateComment(
    commentId: string,
    organizationId: string,
    dto: UpdateVolunteerCommentDto,
  ) {
    const comment = await this.prisma.volunteerComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy nhận xét');
    }

    if (comment.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền sửa nhận xét này');
    }

    const updated = await this.prisma.volunteerComment.update({
      where: { id: commentId },
      data: dto,
      include: {
        volunteer: {
          include: { volunteerProfile: true },
        },
      },
    });

    return updated;
  }

  /**
   * Xóa nhận xét
   */
  async deleteComment(commentId: string, organizationId: string) {
    const comment = await this.prisma.volunteerComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy nhận xét');
    }

    if (comment.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xóa nhận xét này');
    }

    await this.prisma.volunteerComment.delete({
      where: { id: commentId },
    });

    return { message: 'Xóa nhận xét thành công' };
  }

  // ==================== CERTIFICATE TEMPLATES ====================

  /**
   * TCXH tạo mẫu chứng nhận
   */
  async createTemplate(
    organizationId: string,
    dto: CreateCertificateTemplateDto,
  ) {
    console.log('🔍 createTemplate received DTO:', {
      name: dto.name,
      textBoxConfig: dto.textBoxConfig,
      textBoxConfigType: typeof dto.textBoxConfig,
      textBoxConfigKeys: Object.keys(dto.textBoxConfig || {}),
      fullDto: JSON.stringify(dto, null, 2),
    });

    const template = await this.prisma.certificateTemplate.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        templateImageUrl: dto.templateImageUrl,
        textBoxConfig: dto.textBoxConfig as any,
      },
    });

    console.log(
      '✅ Template created with textBoxConfig:',
      JSON.stringify(template.textBoxConfig, null, 2),
    );

    return template;
  }

  /**
   * Lấy danh sách mẫu chứng nhận của TCXH
   */
  async getTemplates(organizationId: string) {
    // console.log('📋 getTemplates called with organizationId:', organizationId);

    const templates = await this.prisma.certificateTemplate.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // console.log('✅ Found templates:', templates.length);
    // console.log('📦 Templates data:', JSON.stringify(templates, null, 2));

    return templates;
  }

  /**
   * Lấy chi tiết mẫu chứng nhận
   */
  async getTemplate(templateId: string, organizationId: string) {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu chứng nhận');
    }

    return template;
  }

  /**
   * Cập nhật mẫu chứng nhận
   */
  async updateTemplate(
    templateId: string,
    organizationId: string,
    dto: UpdateCertificateTemplateDto,
  ) {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu chứng nhận');
    }

    const updated = await this.prisma.certificateTemplate.update({
      where: { id: templateId },
      data: {
        ...dto,

        textBoxConfig: dto.textBoxConfig as any,
      },
    });

    return updated;
  }

  /**
   * Xóa mẫu chứng nhận (soft delete)
   */
  async deleteTemplate(templateId: string, organizationId: string) {
    const template = await this.prisma.certificateTemplate.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu chứng nhận');
    }

    await this.prisma.certificateTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });

    return { message: 'Xóa mẫu chứng nhận thành công' };
  }

  // ==================== ISSUE CERTIFICATES ====================

  /**
   * Cấp chứng nhận cho TNV
   */
  async issueCertificate(
    organizationId: string,
    dto: IssueCertificateDto,
    cloudinaryService: any,
  ) {
    try {
      console.log('🎯 Bắt đầu cấp chứng nhận:', { organizationId, dto });

      // Lấy template
      const template = await this.prisma.certificateTemplate.findFirst({
        where: {
          id: dto.templateId,
          organizationId,
          isActive: true,
        },
      });

      if (!template) {
        throw new NotFoundException('Không tìm thấy mẫu chứng nhận');
      }

      console.log('✅ Tìm thấy template:', template.name);

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

      // Lấy thông tin tổ chức
      const organization = await this.prisma.user.findUnique({
        where: { id: organizationId },
        include: { organizationProfiles: true },
      });

      // Chuẩn bị data để điền vào chứng nhận
      const certificateData = {
        volunteerName: volunteer.volunteerProfile.fullName,
        points: volunteer.volunteerProfile.points,
        issueDate: new Date().toLocaleDateString('vi-VN'),
        organizationName:
          organization?.organizationProfiles?.organizationName || '',
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

      // Lưu vào database
      const issuedCertificate = await this.prisma.issuedCertificate.create({
        data: {
          templateId: dto.templateId,
          volunteerId: dto.volunteerId,
          organizationId,
          certificateData: certificateData as any,
          pdfUrl: imageUrl, // Giữ tên field cũ để tương thích với DB
          notes: dto.notes,
        },
        include: {
          template: true,
          volunteer: {
            include: { volunteerProfile: true },
          },
          organization: {
            include: { organizationProfiles: true },
          },
        },
      });

      console.log('✅ Lưu database thành công');

      // TODO: neeus co thoi gian thi lam gui email ( neu dc )
      // await this.sendCertificateEmail(volunteer.email, pdfUrl);

      return issuedCertificate;
    } catch (error) {
      console.error('❌ Lỗi khi cấp chứng nhận:', error);
      throw error;
    }
  }

  /**
   * Tạo ảnh PNG chứng nhận từ template và data
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

      console.log('Điền tên...');
      ctx.drawImage(image, 0, 0);

      console.log('Đang điền tên');
      console.log('confg:', Object.entries(config || {}));

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

      // Chuyển canvas thành PNG buffer và trả về trực tiếp
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
    const fileName = `certificate_${volunteerName.replace(/\s/g, '_')}_${Date.now()}`;

    // Upload PNG lên Cloudinary
    const imageUrl = await cloudinaryService.uploadImageBuffer(
      imageBuffer,
      fileName,
      'certificates',
    );
    return imageUrl;
  }

  /**
   * Lấy danh sách chứng nhận đã cấp (cho TCXH)
   */
  async getIssuedCertificates(organizationId: string) {
    const certificates = await this.prisma.issuedCertificate.findMany({
      where: { organizationId },
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

  /**
   * Lấy danh sách chứng nhận của TNV
   */
  async getVolunteerCertificates(volunteerId: string) {
    const certificates = await this.prisma.issuedCertificate.findMany({
      where: { volunteerId },
      include: {
        template: true,
        organization: {
          include: { organizationProfiles: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certificates;
  }

  // ==================== POINT HISTORY ====================

  /**
   * Lấy lịch sử điểm của TNV
   */
  async getPointHistory(volunteerId: string) {
    const history = await this.prisma.pointHistory.findMany({
      where: { volunteerId },
      orderBy: { createdAt: 'desc' },
    });

    return history;
  }
}
