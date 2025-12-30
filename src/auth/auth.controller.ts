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

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  @ApiConsumes('multipart/form-data')

  // 2. Định nghĩa cái Form hiển thị trên Swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện',
        },
        cccdFront: {
          type: 'string',
          format: 'binary',
          description: 'Mặt trước CCCD',
        },
        cccdBack: {
          type: 'string',
          format: 'binary',
          description: 'Mặt sau CCCD',
        },

        fullName: { type: 'string', example: 'Nguyễn Văn A' },
        bio: { type: 'string', example: 'Thích làm từ thiện' },
        experienceYears: { type: 'integer', example: 2 },
      },
    },
  })
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

  //
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/ncgd')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
        cccdFront: { type: 'string', format: 'binary' },
        cccdBack: { type: 'string', format: 'binary' },
        // Mảng file (Minh chứng)
        proofFiles: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Chọn nhiều file minh chứng',
        },

        // Các trường Text
        fullName: { type: 'string', example: 'Trần Thị B' },
        vulnerabilityType: { type: 'string', example: 'POOR' },
        situationDescription: { type: 'string' },
      },
    },
  })
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
