import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

import { AuthGuard } from '@nestjs/passport';
import {
  CreateBasicUserDto,
  CreateBficiaryProfileDto,
  CreateVolunteerProfileDto,
} from 'src/users/dto/create-user.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/users/dto/login-user.dto';
import { GetUser } from './decorator/get-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: CreateBasicUserDto) {
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/tnv')
  completeVolunteer(
    @GetUser('sub') userId: string,
    @Body() dto: CreateVolunteerProfileDto,
  ) {
    return this.usersService.createVolunteerProfile(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/ncgd')
  completeBeneficiary(
    @GetUser('sub') userId: string,
    @Body() dto: CreateBficiaryProfileDto,
  ) {
    return this.usersService.createBenificiaryProfile(userId, dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
