import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Public - Statistics')
@Controller('public-statistics')
export class PublicStatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('top-volunteers')
  @ApiOperation({
    summary: '[Public] Top tình nguyện viên theo điểm (toàn hệ thống)',
    description: 'API công khai, không cần đăng nhập. Lấy top TNV có điểm cao nhất',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng TNV (mặc định 10)' })
  async getTopVolunteers(@Query('limit') limit?: number) {
    return this.statisticsService.getTopVolunteersGlobal(limit || 10);
  }
}
