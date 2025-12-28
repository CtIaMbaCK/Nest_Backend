import { Body, Controller, Post, Put, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

import { AuthGuard } from '@nestjs/passport';
import {
  CreateBasicUserDto,
  CreateBficiaryProfileDto,
  CreateVolunteerProfileDto,
} from 'src/users/dto/create-user.dto';

import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './interface/current';
import { LoginDto } from 'src/users/dto/login-user.dto';

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
    @Req() req: Request,
    @Body() dto: CreateVolunteerProfileDto,
  ) {
    const user = req.user as CurrentUser;
    return this.usersService.createVolunteerProfile(user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/ncgd')
  completeBeneficiary(
    @Req() req: Request,
    @Body() dto: CreateBficiaryProfileDto,
  ) {
    const user = req.user as CurrentUser;
    return this.usersService.createBenificiaryProfile(user.userId, dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
