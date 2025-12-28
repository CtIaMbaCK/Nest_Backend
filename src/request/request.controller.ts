import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';

import { userDecorator } from '../users/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateRequestDto } from './dto/update-request.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

interface UserPayload {
  userId: string;
  [key: string]: any;
}

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
    @userDecorator() user: UserPayload,
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.updateRequest(user.userId, id, updateRequestDto);
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
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách tọa độ rút gọn cho bản đồ' })
  @Get('map-locations')
  getMapLocations() {
    return this.requestService.getMapLocation();
  }
}
