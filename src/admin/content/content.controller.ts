import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Admin - Quan ly noi dung')
@ApiBearerAuth('JWT-auth')
@Controller('admin/content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Lay danh sach tat ca posts' })
  @ApiQuery({ name: 'search', required: false, description: 'Tim kiem theo tieu de post' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Loc theo TCXH' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllPosts(
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contentService.getAllPosts(search, organizationId, page, limit);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Lay chi tiet post theo ID' })
  async getPostById(@Param('id') id: string) {
    return this.contentService.getPostById(id);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Lay danh sach tat ca campaigns' })
  @ApiQuery({ name: 'search', required: false, description: 'Tim kiem theo tieu de campaign' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Loc theo TCXH' })
  @ApiQuery({ name: 'status', required: false, description: 'Loc theo trang thai campaign' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllCampaigns(
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contentService.getAllCampaigns(search, organizationId, status, page, limit);
  }

  @Patch('campaigns/:id/approve')
  @ApiOperation({ summary: 'Duyệt campaign (PENDING -> APPROVED)' })
  async approveCampaign(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.contentService.approveCampaign(id, body.status);
  }
}
