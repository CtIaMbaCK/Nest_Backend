import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilterPostDto } from './dto';

@ApiTags('Public - Communication Posts')
@Controller('posts')
export class PublicPostsController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get()
  @ApiOperation({
    summary: '[Public] Xem tất cả bài viết truyền thông',
    description: 'API công khai, không cần đăng nhập',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllPosts(@Query() dto: FilterPostDto) {
    return this.communicationService.getAllPosts(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '[Public] Xem chi tiết bài viết',
    description: 'API công khai, không cần đăng nhập',
  })
  async getPostDetail(@Param('id') postId: string) {
    return this.communicationService.getPublicPostDetail(postId);
  }
}
