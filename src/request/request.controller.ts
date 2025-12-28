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
    @userDecorator() user: UserPayload,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestService.createRequest(user.userId, createRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  acceptRequest(@userDecorator() user: UserPayload, @Param('id') id: string) {
    return this.requestService.acceptRequest(user.userId, id);
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

  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách tọa độ rút gọn cho bản đồ' })
  @Get('map-locations')
  getMapLocations() {
    return this.requestService.getMapLocation();
  }
}
