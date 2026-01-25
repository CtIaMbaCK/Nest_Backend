import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HelpRequestsService } from './help-requests.service';

@ApiTags('Admin - Help Requests')
@ApiBearerAuth('JWT-auth')
@Controller('admin/help-requests')
@UseGuards(JwtAuthGuard)
export class HelpRequestsController {
  constructor(private readonly helpRequestsService: HelpRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả yêu cầu giúp đỡ (ADMIN)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tiêu đề hoặc mô tả' })
  @ApiQuery({ name: 'status', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'district', required: false, description: 'Lọc theo quận' })
  @ApiQuery({ name: 'activityType', required: false, description: 'Lọc theo loại hoạt động' })
  @ApiQuery({ name: 'urgencyLevel', required: false, description: 'Lọc theo mức độ khẩn cấp' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang', type: Number })
  async getAllHelpRequests(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('district') district?: string,
    @Query('activityType') activityType?: string,
    @Query('urgencyLevel') urgencyLevel?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.helpRequestsService.getAllHelpRequests({
      search,
      status,
      district,
      activityType,
      urgencyLevel,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết yêu cầu giúp đỡ (ADMIN)' })
  async getHelpRequestDetail(@Param('id') id: string) {
    return this.helpRequestsService.getHelpRequestDetail(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Duyệt yêu cầu giúp đỡ (PENDING -> APPROVED hoặc REJECTED)' })
  async approveHelpRequest(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.helpRequestsService.approveHelpRequest(id, body.status);
  }
}
