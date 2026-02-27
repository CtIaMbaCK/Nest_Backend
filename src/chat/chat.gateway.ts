import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { EmergencyService } from 'src/emergency/emergency.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Production: giới hạn domain cụ thể
    credentials: false,
  },
  namespace: '/chat', // Socket namespace riêng cho chat
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map để lưu userId → socketId
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly emergencyService: EmergencyService,
  ) {}

  // ==================== CONNECTION HANDLERS ====================

  async handleConnection(client: Socket) {
    try {
      // Extract token từ handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify token và lấy userId
      const userId = await this.chatService.verifyTokenAndGetUserId(token);

      if (!userId) {
        this.logger.warn(`Client ${client.id} has invalid token`);
        client.disconnect();
        return;
      }

      // Lưu mapping userId → socketId
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join room riêng của user (để nhận tin nhắn)
      client.join(`user:${userId}`);

      this.logger.log(
        `User ${userId} connected with socket ${client.id}. Total users: ${this.connectedUsers.size}`,
      );

      // Emit online status
      this.server.emit('user_online', { userId });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(
        `User ${userId} disconnected. Total users: ${this.connectedUsers.size}`,
      );
      this.server.emit('user_offline', { userId });
    }
  }

  // ==================== MESSAGE HANDLERS ====================

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const senderId = client.data.userId;

      if (!senderId) {
        client.emit('error', { message: 'Bạn chưa đăng nhập' });
        return;
      }

      // Validate input
      if (!data.conversationId || !data.content || data.content.trim() === '') {
        client.emit('error', { message: 'Dữ liệu không hợp lệ' });
        return;
      }

      // Tạo message trong DB
      const message = await this.chatService.createMessage({
        conversationId: data.conversationId,
        senderId,
        content: data.content.trim(),
      });

      // Lấy thông tin conversation để biết receiver
      const conversation = await this.chatService.getConversationById(
        data.conversationId,
      );

      if (!conversation) {
        client.emit('error', { message: 'Conversation không tồn tại' });
        return;
      }

      const receiverId =
        conversation.user1Id === senderId
          ? conversation.user2Id
          : conversation.user1Id;

      // Emit cho receiver (nếu online)
      this.server.to(`user:${receiverId}`).emit('new_message', {
        ...message,
        conversationId: data.conversationId,
      });

      // Emit lại cho sender (confirm đã gửi thành công)
      client.emit('message_sent', {
        ...message,
        conversationId: data.conversationId,
      });

      this.logger.log(
        `Message sent from ${senderId} to ${receiverId} in conversation ${data.conversationId}`,
      );

      return { success: true, message };
    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', {
        message: error.message || 'Gửi tin nhắn thất bại',
      });
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        client.emit('error', { message: 'Bạn chưa đăng nhập' });
        return;
      }

      const message = await this.chatService.markMessageAsRead(
        data.messageId,
        userId,
      );

      // Notify sender về read receipt
      const senderId = message.senderId;
      this.server.to(`user:${senderId}`).emit('message_read', {
        messageId: data.messageId,
        readAt: message.readAt,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Mark read error:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark_conversation_read')
  async handleMarkConversationRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        client.emit('error', { message: 'Bạn chưa đăng nhập' });
        return;
      }

      await this.chatService.markConversationAsRead(
        data.conversationId,
        userId,
      );

      // Notify về việc đã đọc toàn bộ conversation
      const conversation = await this.chatService.getConversationById(
        data.conversationId,
      );

      if (!conversation) {
        return;
      }

      const otherUserId =
        conversation.user1Id === userId
          ? conversation.user2Id
          : conversation.user1Id;

      this.server.to(`user:${otherUserId}`).emit('conversation_read', {
        conversationId: data.conversationId,
        userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Mark conversation read error:', error);
      client.emit('error', { message: error.message });
    }
  }

  // ==================== TYPING INDICATOR ====================

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const senderId = client.data.userId;

      if (!senderId) {
        return;
      }

      const conversation = await this.chatService.getConversationById(
        data.conversationId,
      );

      if (!conversation) {
        return;
      }

      const receiverId =
        conversation.user1Id === senderId
          ? conversation.user2Id
          : conversation.user1Id;

      this.server.to(`user:${receiverId}`).emit('user_typing', {
        conversationId: data.conversationId,
        userId: senderId,
        isTyping: data.isTyping,
      });
    } catch (error) {
      // Silent fail for typing indicator
      this.logger.debug('Typing indicator error:', error);
    }
  }

  // ==================== EMERGENCY SOS HANDLERS ====================

  @SubscribeMessage('send_sos')
  async handleSendSOS(
    @MessageBody() data: { notes?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;

      if (!userId) {
        client.emit('error', { message: 'Bạn chưa đăng nhập' });
        return;
      }

      this.logger.warn(`🚨 SOS Emergency triggered by user ${userId}`);

      // Tạo emergency request trong DB
      const emergency = await this.emergencyService.createEmergency(userId, {
        notes: data.notes,
      });

      // Emit cho tất cả ADMIN đang online
      this.server.emit('sos_alert', {
        emergencyId: emergency.id,
        beneficiary: emergency.beneficiary,
        createdAt: emergency.createdAt,
        notes: data.notes,
      });

      // Confirm cho người gửi
      client.emit('sos_sent', {
        success: true,
        emergencyId: emergency.id,
        message: 'Đã gửi SOS thành công. Admin sẽ liên hệ với bạn sớm nhất.',
      });

      this.logger.log(
        `✅ SOS alert sent to all admins for emergency ${emergency.id}`,
      );

      return { success: true, emergency };
    } catch (error) {
      this.logger.error('Send SOS error:', error);
      client.emit('error', {
        message: error.message || 'Gửi SOS thất bại',
      });
    }
  }

  // ==================== UTILITY METHODS ====================

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get socket ID by user ID
  getSocketIdByUserId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  // Broadcast SOS alert to all connected admins (called from service)
  broadcastSOSToAdmins(emergency: any) {
    this.server.emit('sos_alert', emergency);
    this.logger.log(`📢 Broadcasting SOS alert to all connected clients`);
  }
}
