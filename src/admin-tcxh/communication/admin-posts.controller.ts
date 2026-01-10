import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@ApiTags('Admin - Communication Posts Management')
@ApiBearerAuth('JWT-auth')
@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly communicationService: CommunicationService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: '[Admin] Xóa bài viết của bất kỳ TCXH nào',
    description: 'Chỉ Admin mới có quyền xóa bài viết của TCXH khác',
  })
  async deletePostAsAdmin(
    @GetUser('sub') adminId: string,
    @Param('id') postId: string,
  ) {
    return this.communicationService.deletePostAsAdmin(postId, adminId);
  }
}
