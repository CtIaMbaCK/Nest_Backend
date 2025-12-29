import {
  Body,
  Controller,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cccdFront', maxCount: 1 },
      { name: 'cccdBack', maxCount: 1 },
    ]),
  )
  completeVolunteer(
    @GetUser('sub') userId: string,
    @Body() dto: CreateVolunteerProfileDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
    },
  ) {
    return this.usersService.createVolunteerProfile(userId, dto, files);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/ncgd')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cccdFront', maxCount: 1 },
      { name: 'cccdBack', maxCount: 1 },
      { name: 'proofFiles', maxCount: 5 },
    ]),
  )
  completeBeneficiary(
    @GetUser('sub') userId: string,
    @Body() dto: CreateBficiaryProfileDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    },
  ) {
    return this.usersService.createBenificiaryProfile(userId, dto, files);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
