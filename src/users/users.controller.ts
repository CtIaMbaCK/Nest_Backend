import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  // Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  UpdateBficiaryProfileDto,
  UpdateVolunteerProfileDto,
} from './dto/create-user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
  @Get('me')
  async getProfile(@GetUser('sub') userId: string) {
    const user = userId;
    return this.userService.getMyProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/volunteer')
  @ApiConsumes('multipart/form-data')
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
          description: 'CCCD Mặt trước',
        },
        cccdBack: {
          type: 'string',
          format: 'binary',
          description: 'CCCD Mặt sau',
        },

        // Text Fields (Liệt kê các trường trong DTO để Swagger hiện ô nhập)
        fullName: { type: 'string' },
        bio: { type: 'string' },
        address: { type: 'string' },
        experienceYears: { type: 'integer', example: 1 },
        skills: { type: 'string', description: 'Kỹ năng chuyên môn' },
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
  updateVolunteerProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateVolunteerProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
    },
  ) {
    if (role !== 'VOLUNTEER') {
      throw new ForbiddenException('Bạn không phải là Tình nguyện viên');
    }
    return this.userService.updateVolunteerProfile(userId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/benificiary')
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
          description: 'Chọn các file minh chứng mới (nếu có)',
        },
        fullName: { type: 'string' },
        vulnerabilityType: { type: 'string' },
        situationDescription: { type: 'string' },
        address: { type: 'string' },
        keepingProofFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách các URL ảnh cũ muốn giữ lại',
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
  async updateBenificiaryProfile(
    @GetUser('sub') userId: string,
    @GetUser('role') role: string,
    @Body() dto: UpdateBficiaryProfileDto,
    @UploadedFiles()
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    },
  ) {
    if (role !== 'BENEFICIARY') {
      throw new ForbiddenException(
        'Chỉ người cần giúp đỡ mới có quyền cập nhật hồ sơ này',
      );
    }

    return this.userService.updateBenificiaryProfile(userId, dto, files);
  }
}
