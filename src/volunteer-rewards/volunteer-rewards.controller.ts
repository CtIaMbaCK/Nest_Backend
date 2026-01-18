import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VolunteerRewardsService } from './volunteer-rewards.service';
import { CreateVolunteerCommentDto } from './dto/create-volunteer-comment.dto';
import { UpdateVolunteerCommentDto } from './dto/update-volunteer-comment.dto';
import { CreateCertificateTemplateDto } from './dto/create-certificate-template.dto';
import { UpdateCertificateTemplateDto } from './dto/update-certificate-template.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@ApiTags('Volunteer Rewards - Khen thưởng TNV')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('volunteer-rewards')
export class VolunteerRewardsController {
  constructor(
    private readonly service: VolunteerRewardsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ==================== VOLUNTEER COMMENTS ====================

  @Post('comments')
  @ApiOperation({ summary: '[TCXH] Tạo nhận xét cho TNV' })
  @ApiResponse({ status: 201, description: 'Tạo nhận xét thành công' })
  async createComment(
    @GetUser('sub') userId: string,
    @Body() dto: CreateVolunteerCommentDto,
  ) {
    return this.service.createComment(userId, dto);
  }

  @Get('comments/volunteer/:volunteerId')
  @ApiOperation({ summary: 'Lấy danh sách nhận xét của TNV' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getVolunteerComments(@Param('volunteerId') volunteerId: string) {
    return this.service.getVolunteerComments(volunteerId);
  }

  @Get('comments/organization')
  @ApiOperation({ summary: '[TCXH] Lấy danh sách nhận xét đã gửi' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getOrganizationComments(@GetUser('sub') userId: string) {
    return this.service.getOrganizationComments(userId);
  }

  @Put('comments/:id')
  @ApiOperation({ summary: '[TCXH] Cập nhật nhận xét' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateComment(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateVolunteerCommentDto,
  ) {
    return this.service.updateComment(id, userId, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[TCXH] Xóa nhận xét' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteComment(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.deleteComment(id, userId);
  }

  // ==================== CERTIFICATE TEMPLATES ====================

  @Post('templates/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[TCXH] Upload ảnh mẫu chứng nhận lên Cloudinary' })
  @ApiResponse({
    status: 201,
    description: 'Upload ảnh thành công',
    schema: {
      example: { imageUrl: 'https://res.cloudinary.com/...' },
    },
  })
  async uploadTemplateImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    // Kiểm tra file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP)');
    }

    // Upload lên Cloudinary với format PNG (để canvas có thể đọc được)
    const imageUrl = await this.cloudinaryService.uploadFile(
      file,
      'certificate-templates',
      { format: 'png' }, // Force PNG format để tương thích với canvas
    );

    return { imageUrl };
  }

  @Post('templates')
  @ApiOperation({ summary: '[TCXH] Tạo mẫu chứng nhận' })
  @ApiResponse({ status: 201, description: 'Tạo mẫu thành công' })
  async createTemplate(
    @GetUser('sub') userId: string,
    @Body() dto: CreateCertificateTemplateDto,
  ) {
    return this.service.createTemplate(userId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: '[TCXH] Lấy danh sách mẫu chứng nhận' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getTemplates(@GetUser('sub') userId: string) {
    return this.service.getTemplates(userId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: '[TCXH] Lấy chi tiết mẫu chứng nhận' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  async getTemplate(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.service.getTemplate(id, userId);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: '[TCXH] Cập nhật mẫu chứng nhận' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateTemplate(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateCertificateTemplateDto,
  ) {
    return this.service.updateTemplate(id, userId, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[TCXH] Xóa mẫu chứng nhận' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteTemplate(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
  ) {
    return this.service.deleteTemplate(id, userId);
  }

  // ==================== ISSUE CERTIFICATES ====================

  @Post('certificates/issue')
  @ApiOperation({ summary: '[TCXH] Cấp chứng nhận cho TNV' })
  @ApiResponse({ status: 201, description: 'Cấp chứng nhận thành công' })
  async issueCertificate(
    @GetUser('sub') userId: string,
    @Body() dto: IssueCertificateDto,
  ) {
    return this.service.issueCertificate(userId, dto, this.cloudinaryService);
  }

  @Get('certificates/issued')
  @ApiOperation({ summary: '[TCXH] Lấy danh sách chứng nhận đã cấp' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getIssuedCertificates(@GetUser('sub') userId: string) {
    return this.service.getIssuedCertificates(userId);
  }

  @Get('certificates/volunteer/:volunteerId')
  @ApiOperation({ summary: 'Lấy danh sách chứng nhận của TNV' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getVolunteerCertificates(@Param('volunteerId') volunteerId: string) {
    return this.service.getVolunteerCertificates(volunteerId);
  }

  // ==================== POINT HISTORY ====================

  @Get('points/history/:volunteerId')
  @ApiOperation({ summary: 'Lấy lịch sử điểm của TNV' })
  @ApiResponse({ status: 200, description: 'Lấy lịch sử thành công' })
  async getPointHistory(@Param('volunteerId') volunteerId: string) {
    return this.service.getPointHistory(volunteerId);
  }
}
