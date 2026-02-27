import { Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@Req() req: any) {
    return this.notificationService.getNotifications(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Patch('mark-read')
  markAsRead(@Req() req: any) {
    return this.notificationService.markAsRead(req.user.id);
  }
}
