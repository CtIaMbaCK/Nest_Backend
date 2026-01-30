import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  UpdateBficiaryProfileDto,
  UpdateVolunteerProfileDto,
  UpdateOrganizationProfileDto,
} from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CampaignService } from 'src/admin-tcxh/campaign/campaign.service';
import {
  RegisterCampaignDto,
  SearchCampaignDto,
} from 'src/admin-tcxh/campaign/dto';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly campaignService: CampaignService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser('sub') userId: string) {
    const user = userId;
    return this.userService.getMyProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/volunteer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatarUrl: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện',
        },
        cccdFront: {
          type: 'string',
          format: 'binary',
          description: 'CCCD Mặt trước',
        },
        cccdBack: {
          type: 'string',
          format: 'binary',
          description: 'CCCD Mặt sau',
        },

        // Text Fields (Liệt kê các trường trong DTO để Swagger hiện ô nhập)
        fullName: { type: 'string' },
        bio: { type: 'string' },
        address: { type: 'string' },
        experienceYears: { type: 'integer', example: 1 },
        skills: { type: 'string', description: 'Kỹ năng chuyên môn' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
      { name: 'cccdFront', maxCount: 1 },
      { name: 'cccdBack', maxCount: 1 },
    ]),
  )
  updateVolunteerProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateVolunteerProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
    },
  ) {
    if (role !== 'VOLUNTEER') {
      throw new ForbiddenException('Bạn không phải là Tình nguyện viên');
    }
    return this.userService.updateVolunteerProfile(userId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/benificiary')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string', format: 'binary' },
        cccdFront: { type: 'string', format: 'binary' },
        cccdBack: { type: 'string', format: 'binary' },
        proofFiles: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Chọn các file minh chứng mới (nếu có)',
        },
        fullName: { type: 'string' },
        vulnerabilityType: { type: 'string' },
        situationDescription: { type: 'string' },
        address: { type: 'string' },
        keepingProofFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách các URL ảnh cũ muốn giữ lại',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
      { name: 'cccdFront', maxCount: 1 },
      { name: 'cccdBack', maxCount: 1 },
      { name: 'proofFiles', maxCount: 5 },
    ]),
  )
  async updateBenificiaryProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateBficiaryProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    },
  ) {
    if (role !== 'BENEFICIARY') {
      throw new ForbiddenException(
        'Chỉ người cần giúp đỡ mới có quyền cập nhật hồ sơ này',
      );
    }

    return this.userService.updateBenificiaryProfile(userId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/organization')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string', format: 'binary' },
        businessLicense: { type: 'string', format: 'binary' },
        verificationDocs: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Chọn các file tài liệu xác minh mới (nếu có)',
        },
        organizationName: { type: 'string' },
        representativeName: { type: 'string' },
        description: { type: 'string' },
        website: { type: 'string' },
        district: { type: 'string' },
        addressDetail: { type: 'string' },
        keepingVerificationDocs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách các URL tài liệu cũ muốn giữ lại',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
      { name: 'businessLicense', maxCount: 1 },
      { name: 'verificationDocs', maxCount: 5 },
    ]),
  )
  async updateOrganizationProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateOrganizationProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      businessLicense?: Express.Multer.File[];
      verificationDocs?: Express.Multer.File[];
    },
  ) {
    if (role !== 'ORGANIZATION') {
      throw new ForbiddenException(
        'Chỉ tổ chức xã hội mới có quyền cập nhật hồ sơ này',
      );
    }

    return this.userService.updateOrganizationProfile(userId, dto, files);
  }

  // ========== API CHO TÌNH NGUYỆN VIÊN - CAMPAIGN ==========

  @ApiTags('Volunteer - Campaign')
  @UseGuards(JwtAuthGuard)
  @Get('volunteer/campaigns/recommended')
  @ApiOperation({
    summary: '[TNV] Xem tất cả campaign, ưu tiên campaign cùng quận lên đầu',
    description:
      'Hiển thị tất cả campaign sắp diễn ra. Campaign có quận trùng với preferredDistricts của TNV sẽ được ưu tiên hiển thị lên đầu.',
  })
  async getRecommendedCampaigns(@GetUser('sub') volunteerId: string) {
    return this.campaignService.getRecommendedCampaigns(volunteerId);
  }

  @ApiTags('Volunteer - Campaign')
  @UseGuards(JwtAuthGuard)
  @Get('volunteer/campaigns/search')
  @ApiOperation({
    summary: '[TNV] Tìm kiếm campaign theo từ khóa',
    description:
      'Tìm kiếm campaign theo từ khóa trong tiêu đề và mô tả. Kết quả ưu tiên campaign cùng quận lên đầu.',
  })
  async searchCampaigns(
    @GetUser('sub') volunteerId: string,
    @Query() dto: SearchCampaignDto,
  ) {
    return this.campaignService.searchCampaigns(volunteerId, dto);
  }

  @ApiTags('Volunteer - Campaign')
  @UseGuards(JwtAuthGuard)
  @Get('volunteer/campaigns/my-registrations')
  @ApiOperation({ summary: '[TNV] Xem danh sách campaign đã đăng ký' })
  async getMyRegistrations(@GetUser('sub') volunteerId: string) {
    return this.campaignService.getMyRegistrations(volunteerId);
  }

  @ApiTags('Volunteer - Campaign')
  @UseGuards(JwtAuthGuard)
  @Post('volunteer/campaigns/:id/register')
  @ApiOperation({ summary: '[TNV] Đăng ký tham gia campaign' })
  async registerCampaign(
    @GetUser('sub') volunteerId: string,
    @Param('id') campaignId: string,
    @Body() dto: RegisterCampaignDto,
  ) {
    return this.campaignService.registerCampaign(volunteerId, campaignId, dto);
  }

  @ApiTags('Volunteer - Campaign')
  @UseGuards(JwtAuthGuard)
  @Delete('volunteer/campaigns/:id/cancel')
  @ApiOperation({ summary: '[TNV] Hủy đăng ký campaign' })
  async cancelRegistration(
    @GetUser('sub') volunteerId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignService.cancelRegistration(volunteerId, campaignId);
  }
}
