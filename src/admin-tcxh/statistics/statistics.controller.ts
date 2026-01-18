import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@ApiTags('Admin TCXH - Statistics')
@ApiBearerAuth('JWT-auth')
@Controller('admin-tcxh/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  @ApiOperation({ summary: 'Lấy thống kê tổng quan của tổ chức' })
  async getOverviewStatistics(@GetUser('sub') organizationId: string) {
    return this.statisticsService.getOverviewStatistics(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('volunteers')
  @ApiOperation({ summary: 'Thống kê tình nguyện viên' })
  async getVolunteerStatistics(@GetUser('sub') organizationId: string) {
    return this.statisticsService.getVolunteerStatistics(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('beneficiaries')
  @ApiOperation({ summary: 'Thống kê người cần giúp đỡ' })
  async getBeneficiaryStatistics(@GetUser('sub') organizationId: string) {
    return this.statisticsService.getBeneficiaryStatistics(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('campaigns')
  @ApiOperation({ summary: 'Thống kê chiến dịch' })
  async getCampaignStatistics(@GetUser('sub') organizationId: string) {
    return this.statisticsService.getCampaignStatistics(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activities')
  @ApiOperation({ summary: 'Thống kê hoạt động theo thời gian' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Số ngày gần đây (30 hoặc để trống = tất cả)' })
  async getActivityStatistics(
    @GetUser('sub') organizationId: string,
    @Query('days') days?: number,
  ) {
    return this.statisticsService.getActivityStatistics(organizationId, days);
  }

  @UseGuards(JwtAuthGuard)
  @Get('help-requests')
  @ApiOperation({ summary: 'Thống kê hoạt động hỗ trợ (HelpRequest)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getHelpRequestStatistics(
    @GetUser('sub') organizationId: string,
    @Query('days') days?: number,
  ) {
    return this.statisticsService.getHelpRequestStatistics(organizationId, days);
  }
}
