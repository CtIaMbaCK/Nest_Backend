import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(receiverId: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        receiverId,
        message,
      },
    });
    
    // Broadcast notification qua Socket.io
    this.notificationGateway.sendNotification(receiverId, notification);
    
    return notification;
  }

  async notifyAdmins(message: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      await this.createNotification(admin.id, message);
    }
  }

  async getNotifications(receiverId: string) {
    return this.prisma.notification.findMany({
      where: { receiverId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(receiverId: string) {
    const count = await this.prisma.notification.count({
      where: { receiverId, isRead: false },
    });
    return { count };
  }

  async markAsRead(receiverId: string) {
    await this.prisma.notification.updateMany({
      where: { receiverId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
