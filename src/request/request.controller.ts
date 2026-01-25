import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateRequestDto, UpdateStatusDto } from './dto/update-request.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { FilterActivityDto } from './dto/filter.dto';

@ApiTags('Request')
@ApiBearerAuth('JWT-auth')
@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @GetUser('sub') userId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestService.createRequest(userId, createRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  acceptRequest(@GetUser('sub') userId: string, @Param('id') id: string) {
    return this.requestService.acceptRequest(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @GetUser('sub') user: string,
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.updateRequest(user, id, updateRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('allRequests')
  allRequests() {
    return this.requestService.findAllRequests();
  }

  // tim tat ca yeu cau giup do cua nguoi dang ky
  @UseGuards(JwtAuthGuard)
  @Get('requesterRequests')
  getAllRequests(@GetUser('sub') userId: string) {
    return this.requestService.findRequestsByRequester(userId);
  }

  // tim tat ca yeu cau giup do cua tinh nguyen vien
  @UseGuards(JwtAuthGuard)
  @Get('volunteerRequests')
  getVolunteerRequests(@GetUser('sub') userId: string) {
    return this.requestService.findRequestsByVolunteer(userId);
  }

  // lay ban do
  @ApiOperation({ summary: 'Lấy danh sách tọa độ rút gọn cho bản đồ' })
  @Get('map-locations')
  getMapLocations() {
    return this.requestService.getMapLocation();
  }

  @Post('auto-transition')
  @ApiOperation({
    summary: '[Utility] Tự động chuyển request status theo thời gian',
    description: 'ONGOING quá endDate → COMPLETED. APPROVED (không có volunteer) quá endDate → CANCELLED'
  })
  autoTransitionRequests() {
    return this.requestService.autoTransitionRequests();
  }

  // xem thong tin chi tiet yeu cau giup do (PHẢI Ở CUỐI - sau các routes cụ thể)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getRequestById(@Param('id') requestId: string) {
    return this.requestService.getRequestDetail(requestId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'TNV cập nhật trạng thái hoạt động (Hoàn thành + Ảnh minh chứng)',
  })
  updateStatus(
    @GetUser('sub') userId: string,
    @Param('id') requestId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.requestService.updateStatusRequestWhenComplete(
      userId,
      requestId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@GetUser('sub') user: string, @Query() filterDto: FilterActivityDto) {
    return this.requestService.findAllByUserId(user, filterDto);
  }
}
