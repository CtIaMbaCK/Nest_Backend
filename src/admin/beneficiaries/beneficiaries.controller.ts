import { Controller, Get, Param, Query, Patch, Body, UseGuards } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';

@ApiTags('Admin - Quan ly NCGD')
@ApiBearerAuth('JWT-auth')
@Controller('admin/beneficiaries')
@UseGuards(JwtAuthGuard)
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get()
  @ApiOperation({ summary: 'Lay danh sach tat ca NCGD' })
  @ApiQuery({ name: 'search', required: false, description: 'Tim kiem theo ten, sdt, email' })
  @ApiQuery({ name: 'status', required: false, description: 'Loc theo trang thai' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllBeneficiaries(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.beneficiariesService.getAllBeneficiaries(search, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiet ho so NCGD' })
  async getBeneficiaryDetail(@Param('id') id: string) {
    return this.beneficiariesService.getBeneficiaryDetail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cap nhat thong tin NCGD (bao gom lock/unlock)' })
  async updateBeneficiary(
    @Param('id') id: string,
    @Body() updateDto: UpdateBeneficiaryDto,
  ) {
    return this.beneficiariesService.updateBeneficiary(id, updateDto);
  }
}
