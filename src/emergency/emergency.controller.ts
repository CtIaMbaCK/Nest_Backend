import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Emergency SOS')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gửi SOS khẩn cấp (BENEFICIARY only)' })
  createEmergency(
    @GetUser('sub') userId: string,
    @Body() dto: CreateEmergencyDto,
  ) {
    return this.emergencyService.createEmergency(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách SOS (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['NEW', 'COMPLETED'] })
  getEmergencies(@Query('status') status?: 'NEW' | 'COMPLETED') {
    return this.emergencyService.getEmergencies(status);
  }

  @Get('count/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Đếm số SOS chưa xử lý' })
  countPending() {
    return this.emergencyService.countPendingEmergencies();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy chi tiết SOS' })
  getEmergencyById(@Param('id') id: string) {
    return this.emergencyService.getEmergencyById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật trạng thái SOS (Admin only)' })
  updateEmergency(@Param('id') id: string, @Body() dto: UpdateEmergencyDto) {
    return this.emergencyService.updateEmergency(id, dto);
  }
}
