import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreatePostDto, UpdatePostDto, FilterPostDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Admin TCXH - Communication')
@ApiBearerAuth('JWT-auth')
@Controller('admin-tcxh/posts')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Đăng bài viết truyền thông mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Chương trình trao quà Tết 2024' },
        content: {
          type: 'string',
          description: 'Nội dung bài viết (copy/paste nội dung nhiều dòng vào đây)',
          example: 'Ngày 15/01/2024, tổ chức đã trao 500 phần quà Tết.\n\nChương trình diễn ra tại:\n- Quận 1\n- Quận 3\n\nCảm ơn các tình nguyện viên!'
        },
        coverImage: { type: 'string', format: 'binary' },
      },
      required: ['title', 'content'],
    },
  })
  @UseInterceptors(FileInterceptor('coverImage'))
  async createPost(
    @GetUser('sub') organizationId: string,
    @Body() dto: CreatePostDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.communicationService.createPost(organizationId, dto, coverImage);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Xem danh sách bài viết của TCXH' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getOrgPosts(
    @GetUser('sub') organizationId: string,
    @Query() dto: FilterPostDto,
  ) {
    return this.communicationService.getOrgPosts(organizationId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bài viết' })
  async getPostDetail(
    @GetUser('sub') organizationId: string,
    @Param('id') postId: string,
  ) {
    return this.communicationService.getPostDetail(postId, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: {
          type: 'string',
          description: 'Nội dung bài viết (copy/paste nội dung nhiều dòng vào đây)'
        },
        coverImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('coverImage'))
  async updatePost(
    @GetUser('sub') organizationId: string,
    @Param('id') postId: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    return this.communicationService.updatePost(
      postId,
      organizationId,
      dto,
      coverImage,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  async deletePost(
    @GetUser('sub') organizationId: string,
    @Param('id') postId: string,
  ) {
    return this.communicationService.deletePost(postId, organizationId);
  }
}
