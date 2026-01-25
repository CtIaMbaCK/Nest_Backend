import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreateCampaignDto, UpdateCampaignDto, FilterCampaignDto } from './dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
/* eslint-disable @typescript-eslint/no-unsafe-return */

@ApiTags('Admin TCXH - Campaign')
@ApiBearerAuth('JWT-auth')
@Controller('admin-tcxh/campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Tạo campaign mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Chiến dịch tặng quà Tết' },
        description: { type: 'string', example: 'Mô tả chi tiết...' },
        goal: { type: 'string', example: 'Trao 500 phần quà' },
        district: { type: 'string', example: 'QUAN_1' },
        addressDetail: { type: 'string', example: '123 Đường ABC' },
        startDate: { type: 'string', format: 'date', example: '2024-02-01' },
        endDate: { type: 'string', format: 'date', example: '2024-02-05' },
        targetVolunteers: { type: 'number', example: 50 },
        maxVolunteers: { type: 'number', example: 100 },
        coverImage: { type: 'string', format: 'binary' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: [
        'title',
        'district',
        'addressDetail',
        'startDate',
        'targetVolunteers',
        'maxVolunteers',
      ],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
  )
  async createCampaign(
    @GetUser('sub') organizationId: string,
    @Body() dto: CreateCampaignDto,
    @UploadedFiles()
    files: {
      coverImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.campaignService.createCampaign(
      organizationId,
      dto,
      files.coverImage?.[0],
      files.images,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Xem danh sách campaign của TCXH' })
  async getCampaigns(
    @GetUser('sub') organizationId: string,
    @Query() dto: FilterCampaignDto,
  ) {
    return this.campaignService.getCampaigns(organizationId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết campaign' })
  async getCampaignDetail(
    @GetUser('sub') organizationId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignService.getCampaignDetail(campaignId, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật campaign' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        goal: { type: 'string' },
        district: { type: 'string' },
        addressDetail: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        targetVolunteers: { type: 'number' },
        maxVolunteers: { type: 'number' },
        coverImage: { type: 'string', format: 'binary' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
  )
  async updateCampaign(
    @GetUser('sub') organizationId: string,
    @Param('id') campaignId: string,
    @Body() dto: UpdateCampaignDto,
    @UploadedFiles()
    files: {
      coverImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.campaignService.updateCampaign(
      campaignId,
      organizationId,
      dto,
      files.coverImage?.[0],
      files.images,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/registrations')
  @ApiOperation({ summary: 'Xem danh sách TNV đã đăng ký campaign' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCampaignRegistrations(
    @GetUser('sub') organizationId: string,
    @Param('id') campaignId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.campaignService.getCampaignRegistrations(
      campaignId,
      organizationId,
      page,
      limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('registrations/:registrationId/status')
  @ApiOperation({ summary: '[TCXH] Cập nhật trạng thái đăng ký campaign (ATTENDED để cộng điểm)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['REGISTERED', 'ATTENDED', 'CANCELLED'],
          description: 'Trạng thái mới (ATTENDED sẽ tự động cộng +10 điểm)',
        },
      },
      required: ['status'],
    },
  })
  async updateRegistrationStatus(
    @GetUser('sub') organizationId: string,
    @Param('registrationId') registrationId: string,
    @Body('status') status: string,
  ) {
    return this.campaignService.updateRegistrationStatus(
      organizationId,
      registrationId,
      status as any,
    );
  }

  @Post('auto-transition')
  @ApiOperation({
    summary: '[Utility] Tự động chuyển campaign APPROVED -> ONGOING khi startDate đến',
    description: 'API này có thể được gọi định kỳ (bởi cron job hoặc manually) để cập nhật status campaigns'
  })
  async autoTransitionCampaigns() {
    return this.campaignService.autoTransitionCampaigns();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  @ApiOperation({
    summary: '[TCXH] Upload hình ảnh minh chứng hoàn thành campaign - tự động cộng điểm cho tất cả TNV tham gia',
    description: 'Khi TCXH upload proof images, campaign status -> COMPLETED và tất cả volunteer có status REGISTERED/ATTENDED sẽ được cộng 10 điểm'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        proofImages: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Ảnh minh chứng hoàn thành (tối đa 10 ảnh)',
        },
      },
      required: ['proofImages'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'proofImages', maxCount: 10 },
    ]),
  )
  async completeCampaign(
    @GetUser('sub') organizationId: string,
    @Param('id') campaignId: string,
    @UploadedFiles()
    files: {
      proofImages?: Express.Multer.File[];
    },
  ) {
    return this.campaignService.completeCampaign(
      campaignId,
      organizationId,
      files.proofImages,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: '[TCXH] Xóa campaign (chỉ được phép nếu chưa có TNV nào đăng ký)' })
  async deleteCampaign(
    @GetUser('sub') organizationId: string,
    @Param('id') campaignId: string,
  ) {
    return this.campaignService.deleteCampaign(campaignId, organizationId);
  }
}
