import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ==================== UTILITY METHODS ====================

  // Verify token và lấy userId (dùng cho WebSocket)
  async verifyTokenAndGetUserId(token: string): Promise<string | null> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });
      return payload.sub; // userId
    } catch {
      return null;
    }
  }

  // Helper: Lấy profile info theo role
  private getUserProfile(user: any) {
    if (user.role === 'ADMIN') {
      return {
        fullName: 'Admin BetterUS',
        avatarUrl: null,
      };
    } else if (user.role === 'VOLUNTEER') {
      return {
        fullName: user.volunteerProfile?.fullName || null,
        avatarUrl: user.volunteerProfile?.avatarUrl || null,
        organizationId: user.volunteerProfile?.organizationId || null,
        organizationStatus: user.volunteerProfile?.organizationStatus || null,
      };
    } else if (user.role === 'BENEFICIARY') {
      return {
        fullName: user.bficiaryProfile?.fullName || null,
        avatarUrl: user.bficiaryProfile?.avatarUrl || null,
        organizationId: user.bficiaryProfile?.organizationId || null,
        organizationStatus: user.bficiaryProfile?.organizationStatus || null,
      };
    } else if (user.role === 'ORGANIZATION') {
      return {
        organizationName: user.organizationProfiles?.organizationName || null,
        avatarUrl: user.organizationProfiles?.avatarUrl || null,
      };
    }
    return null;
  }

  // Helper: Order user IDs (user nhỏ hơn luôn là user1)
  private orderUserIds(id1: string, id2: string): [string, string] {
    return id1 < id2 ? [id1, id2] : [id2, id1];
  }

  // ==================== SEARCH & USERS ====================

  // Tìm kiếm users (cho search bar)
  async searchUsers(currentUserId: string, searchTerm: string) {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } }, // Không search chính mình
          {
            OR: [
              { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              {
                volunteerProfile: {
                  fullName: { contains: searchTerm, mode: 'insensitive' },
                },
              },
              {
                bficiaryProfile: {
                  fullName: { contains: searchTerm, mode: 'insensitive' },
                },
              },
              {
                organizationProfiles: {
                  organizationName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        volunteerProfile: true,
        bficiaryProfile: true,
        organizationProfiles: true,
      },
      take: 20,
    });

    // Sort: ADMIN → ORGANIZATION → VOLUNTEER → BENEFICIARY
    const roleOrder = {
      ADMIN: 1,
      ORGANIZATION: 2,
      VOLUNTEER: 3,
      BENEFICIARY: 4,
    };
    users.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

    return users.map((user) => ({
      id: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profile: this.getUserProfile(user),
    }));
  }

  // Lấy thông tin admin để hiển thị lên đầu danh sách
  async getAdminUser() {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) return null;

    return {
      id: admin.id,
      role: admin.role,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      profile: {
        fullName: 'Admin BetterUS',
        avatarUrl: null,
      },
    };
  }

  // ==================== CONVERSATION METHODS ====================

  // Tạo hoặc lấy conversation giữa 2 user
  async getOrCreateConversation(currentUserId: string, targetUserId: string) {
    // Đảm bảo user1 < user2 để tránh duplicate
    const [smallerId, largerId] = this.orderUserIds(
      currentUserId,
      targetUserId,
    );

    const includeConfig = {
      user1: {
        include: {
          volunteerProfile: true,
          bficiaryProfile: true,
          organizationProfiles: true,
        },
      },
      user2: {
        include: {
          volunteerProfile: true,
          bficiaryProfile: true,
          organizationProfiles: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
      },
    };

    // Tìm conversation hiện có
    let conversation = await this.prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: smallerId,
          user2Id: largerId,
        },
      },
      include: includeConfig,
    });

    // Nếu chưa có, tạo mới
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: smallerId,
          user2Id: largerId,
        },
        include: includeConfig,
      });
    }

    // Format response giống getUserConversations
    const otherUser =
      conversation.user1Id === currentUserId
        ? conversation.user2
        : conversation.user1;
    const lastMessage = conversation.messages?.[0];

    return {
      id: conversation.id,
      otherUser: {
        id: otherUser.id,
        role: otherUser.role,
        email: otherUser.email,
        phoneNumber: otherUser.phoneNumber,
        profile: this.getUserProfile(otherUser),
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
            senderId: lastMessage.senderId,
          }
        : null,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
    };
  }

  // Lấy danh sách conversations của user
  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          include: {
            volunteerProfile: true,
            bficiaryProfile: true,
            organizationProfiles: true,
          },
        },
        user2: {
          include: {
            volunteerProfile: true,
            bficiaryProfile: true,
            organizationProfiles: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Lấy tin nhắn cuối
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Format response
    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          role: otherUser.role,
          email: otherUser.email,
          phoneNumber: otherUser.phoneNumber,
          profile: this.getUserProfile(otherUser),
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.isRead,
              senderId: lastMessage.senderId,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    // Sort: Admin luôn lên đầu, sau đó sort theo lastMessageAt
    formattedConversations.sort((a, b) => {
      // Admin lên đầu
      if (a.otherUser.role === 'ADMIN') return -1;
      if (b.otherUser.role === 'ADMIN') return 1;

      // Sau đó sort theo lastMessageAt (mới nhất lên đầu)
      const timeA = a.lastMessageAt?.getTime() || 0;
      const timeB = b.lastMessageAt?.getTime() || 0;
      return timeB - timeA;
    });

    return formattedConversations;
  }

  // Lấy conversation by ID
  async getConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  // ==================== MESSAGE METHODS ====================

  // Lấy messages trong conversation
  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    // Verify user là thành viên của conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.user1Id !== userId && conversation.user2Id !== userId)
    ) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn này');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            volunteerProfile: { select: { fullName: true, avatarUrl: true } },
            bficiaryProfile: { select: { fullName: true, avatarUrl: true } },
            organizationProfiles: {
              select: { organizationName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return messages.reverse(); // Reverse để oldest first
  }

  // Tạo message mới
  async createMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
  }) {
    // Verify sender là thành viên của conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (
      !conversation ||
      (conversation.user1Id !== data.senderId &&
        conversation.user2Id !== data.senderId)
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này',
      );
    }

    // Tạo message
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            volunteerProfile: { select: { fullName: true, avatarUrl: true } },
            bficiaryProfile: { select: { fullName: true, avatarUrl: true } },
            organizationProfiles: {
              select: { organizationName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    // Update lastMessageAt trong conversation
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    // Chỉ receiver mới mark được
    const { conversation } = message;
    const receiverId =
      conversation.user1Id === message.senderId
        ? conversation.user2Id
        : conversation.user1Id;

    if (userId !== receiverId) {
      throw new ForbiddenException('Bạn không thể đánh dấu tin nhắn này');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.user1Id !== userId && conversation.user2Id !== userId)
    ) {
      throw new ForbiddenException('Bạn không có quyền');
    }

    // Update tất cả message chưa đọc mà không phải mình gửi
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  // Đếm unread messages
  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    const unreadCount = await this.prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId }, // Không đếm tin nhắn của chính mình
        isRead: false,
      },
    });

    return { unreadCount };
  }

  // ==================== ORGANIZATION JOIN ====================

  // Join organization từ chat (bonus feature)
  async requestJoinOrganization(userId: string, organizationId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        volunteerProfile: true,
        bficiaryProfile: true,
      },
    });

    if (!user) throw new NotFoundException('User không tồn tại');

    // Kiểm tra organizationId có phải là ORGANIZATION không
    const organization = await this.prisma.user.findUnique({
      where: { id: organizationId },
    });

    if (!organization || organization.role !== 'ORGANIZATION') {
      throw new ForbiddenException('ID không phải là tổ chức xã hội');
    }

    if (user.role === 'VOLUNTEER' && user.volunteerProfile) {
      // Kiểm tra đã tham gia chưa
      if (user.volunteerProfile.organizationId === organizationId) {
        throw new ForbiddenException(
          'Bạn đã gửi yêu cầu hoặc đã tham gia TCXH này',
        );
      }

      await this.prisma.volunteerProfile.update({
        where: { userId },
        data: {
          organizationId,
          organizationStatus: 'PENDING',
          joinedOrganizationAt: new Date(),
        },
      });
    } else if (user.role === 'BENEFICIARY' && user.bficiaryProfile) {
      // Kiểm tra đã tham gia chưa
      if (user.bficiaryProfile.organizationId === organizationId) {
        throw new ForbiddenException(
          'Bạn đã gửi yêu cầu hoặc đã tham gia TCXH này',
        );
      }

      await this.prisma.bficiaryProfile.update({
        where: { userId },
        data: {
          organizationId,
          organizationStatus: 'PENDING',
          joinedOrganizationAt: new Date(),
        },
      });
    } else {
      throw new ForbiddenException('Chỉ TNV và NCGĐ mới có thể tham gia TCXH');
    }

    return { success: true, message: 'Đã gửi yêu cầu tham gia tổ chức' };
  }
}
