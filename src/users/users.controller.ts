import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  // Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  UpdateBficiaryProfileDto,
  UpdateVolunteerProfileDto,
} from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/volunteer/:userId')
  updateVolunteerProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateVolunteerProfileDto,
  ) {
    if (role !== 'VOLUNTEER') {
      throw new Error('Bạn không phải là Tình nguyện viên');
    }
    return this.userService.updateVolunteerProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/benificiary/:userId')
  updateBenificiaryProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateBficiaryProfileDto,
  ) {
    if (role !== 'BENEFICIARY') {
      throw new Error('Bạn không phải là người cần giúp đỡ');
    }
    return this.userService.updateBenificiaryProfile(userId, dto);
  }
}
