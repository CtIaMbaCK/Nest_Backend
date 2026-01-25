import { Controller, Get, Param, Query, Patch, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiTags('Admin - Quan ly TCXH')
@ApiBearerAuth('JWT-auth')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lay danh sach tat ca TCXH' })
  @ApiQuery({ name: 'search', required: false, description: 'Tim kiem theo ten TCXH, sdt, email' })
  @ApiQuery({ name: 'status', required: false, description: 'Loc theo trang thai' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllOrganizations(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.organizationsService.getAllOrganizations(search, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiet thong tin TCXH' })
  async getOrganizationDetail(@Param('id') id: string) {
    return this.organizationsService.getOrganizationDetail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cap nhat thong tin TCXH (bao gom lock/unlock)' })
  async updateOrganization(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateOrganization(id, updateDto);
  }
}
