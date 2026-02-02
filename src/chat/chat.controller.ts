import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ==================== PUBLIC ====================
  @Get('admin-user')
  async getAdminUser() {
    return this.chatService.getAdminUser();
  }

  // ==================== USER SEARCH ====================
  @UseGuards(JwtAuthGuard)
  @Get('search-users')
  async searchUsers(
    @GetUser('sub') userId: string,
    @Query('q') searchTerm: string,
  ) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }
    return this.chatService.searchUsers(userId, searchTerm);
  }

  // ==================== CONVERSATION ====================
  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@GetUser('sub') userId: string) {
    return this.chatService.getUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  async createConversation(
    @GetUser('sub') userId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(userId, dto.targetUserId);
  }

  // ==================== MESSAGES ====================
  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async getMessages(
    @GetUser('sub') userId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.chatService.getMessages(
      query.conversationId,
      userId,
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('conversations/:conversationId/mark-read')
  async markConversationAsRead(
    @GetUser('sub') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.markConversationAsRead(conversationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@GetUser('sub') userId: string) {
    return this.chatService.getUnreadCount(userId);
  }

  // ==================== ORGANIZATION ====================

  @UseGuards(JwtAuthGuard)
  @Post('join-organization')
  async joinOrganization(
    @GetUser('sub') userId: string,
    @Body('organizationId') organizationId: string,
  ) {
    return this.chatService.requestJoinOrganization(userId, organizationId);
  }
}
