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

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from 'src/users/dto/login-user.dto';
import { GetUser } from './decorator/get-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { District, GuardianRelation } from 'src/generated/prisma/enums';
import { CreateOrganizationDto } from 'src/admin-tcxh/organization/dto/create-organization.dto';

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

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
        avatarUrl: {
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
        preferredDistricts: {
          type: 'array',
          items: { type: 'string', enum: Object.values(District) },
          description: 'Chọn các quận huyện ưu tiên',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
      { name: 'cccdFront', maxCount: 1 },
      { name: 'cccdBack', maxCount: 1 },
    ]),
  )
  completeVolunteer(
    @GetUser('sub') userId: string,
    @Body() dto: CreateVolunteerProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
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
        avatarUrl: { type: 'string', format: 'binary' },
        cccdFront: { type: 'string', format: 'binary' },
        cccdBack: { type: 'string', format: 'binary' },

        proofFiles: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Chọn nhiều file minh chứng',
        },

        fullName: { type: 'string', example: 'Trần Thị B' },
        vulnerabilityType: { type: 'string', example: 'POOR' },
        situationDescription: { type: 'string' },

        guardianName: { type: 'string', example: 'Nguyễn Văn A' },
        guardianPhone: { type: 'string', example: '0909123456' },
        guardianRelation: {
          type: 'string',
          enum: Object.values(GuardianRelation),
          example: 'PARENT',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
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
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    },
  ) {
    return this.usersService.createBenificiaryProfile(userId, dto, files);
  }

  //
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Put('profile/organization')
  @ApiOperation({ summary: 'Hoàn thiện hoặc cập nhật hồ sơ tổ chức xã hội' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // Các trường File (Binary)
        avatarUrl: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh đại diện của tổ chức',
        },
        businessLicense: {
          type: 'string',
          format: 'binary',
          description: 'Giấy phép kinh doanh/hoạt động',
        },
        verificationDocs: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Các tài liệu xác minh khác (Tối đa 5 files)',
        },

        // Các trường văn bản từ DTO
        organizationName: {
          type: 'string',
          example: 'Tổ chức Thiện nguyện xanh',
        },
        representativeName: { type: 'string', example: 'Nguyễn Văn A' },
        description: {
          type: 'string',
          example: 'Tổ chức hỗ trợ trẻ em nghèo vùng cao',
        },
        website: { type: 'string', example: 'https://thiennguyenxanh.org' },
        district: {
          type: 'string',
          enum: Object.values(District),
          example: 'QUAN_1',
        },
        addressDetail: {
          type: 'string',
          example: 'Số 123, Đường Lê Lợi, Phường Bến Thành',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarUrl', maxCount: 1 },
      { name: 'businessLicense', maxCount: 1 },
      { name: 'verificationDocs', maxCount: 5 },
    ]),
  )
  completeOrganization(
    @GetUser('sub') userId: string,
    @Body() dto: CreateOrganizationDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      businessLicense?: Express.Multer.File[];
      verificationDocs?: Express.Multer.File[];
    },
  ) {
    return this.usersService.createOrganization(userId, dto, files);
  }
}
