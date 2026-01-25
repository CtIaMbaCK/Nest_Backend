import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';

@ApiTags('Admin - Quan ly TNV')
@ApiBearerAuth('JWT-auth')
@Controller('admin/volunteers')
@UseGuards(JwtAuthGuard)
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Get()
  @ApiOperation({ summary: 'Lay danh sach tat ca TNV' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tim kiem theo ten, sdt, email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Loc theo trang thai',
  })
  @ApiQuery({
    name: 'district',
    required: false,
    description: 'Loc theo khu vuc',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllVolunteers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('district') district?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.volunteersService.getAllVolunteers(
      search,
      status,
      district,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiet ho so TNV' })
  async getVolunteerDetail(@Param('id') id: string) {
    return this.volunteersService.getVolunteerDetail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cap nhat thong tin TNV (bao gom lock/unlock)' })
  async updateVolunteer(
    @Param('id') id: string,
    @Body() updateDto: UpdateVolunteerDto,
  ) {
    return this.volunteersService.updateVolunteer(id, updateDto);
  }
}
