import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAppreciationDto,
  CreateFeedbackDto,
} from './dto/create-feedback.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkCompletedActivity(activityId: string) {
    const activity = await this.prisma.helpRequest.findUnique({
      where: { id: activityId },
      select: { status: true },
    });
    if (!activity) throw new NotFoundException('Hoạt động này không tồn tại');

    if (activity.status !== 'COMPLETED')
      throw new BadRequestException(
        'Bạn chỉ có thể đánh giá khi hoạt động đã hoàn thành',
      );
  }

  // comment
  async createReview(reviewerId: string, dto: CreateFeedbackDto) {
    await this.checkCompletedActivity(dto.activityId);

    const activityExisted = await this.prisma.review.findFirst({
      where: { activityId: dto.activityId, reviewerId: reviewerId },
    });
    if (activityExisted) throw new Error('Bạn đã đánh giá hoạt động này rồi');

    return this.prisma.review.create({
      data: {
        activityId: dto.activityId,
        reviewerId: reviewerId,
        targetId: reviewerId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  // cam on, danh gia
  async createThankYou(senderId: string, dto: CreateAppreciationDto) {
    await this.checkCompletedActivity(dto.activityId);

    const thanksExisted = await this.prisma.appreciation.findFirst({
      where: { activityId: dto.activityId, senderId: senderId },
    });
    if (thanksExisted) {
      throw new Error('Bạn đã gửi lời cảm ơn cho hoạt động này rồi');
    }

    return this.prisma.appreciation.create({
      data: {
        activityId: dto.activityId,
        senderId: senderId,
        receiverId: dto.targetId,
      },
    });
  }

  // cai nay lay danh gia cua nguoi can giup do cho tnv
  // tnv xem lai nguoi can giup do
  async getMyReviews(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            volunteerProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
            bficiaryProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return reviews.map((review) => {
      const userProfile = review.reviewer.volunteerProfile;

      return {
        id: review.id,
        activity: review.activity,
        rating: review.rating,
        comment: review.comment,
        reviewer: {
          id: review.reviewer.id,
          fullName: userProfile?.fullName,
          avatarUrl: userProfile?.avatarUrl,
        },
      };
    });
  }

  async getMyAppreciations(userId: string) {
    const appreciations = await this.prisma.appreciation.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            bficiaryProfile: {
              select: { fullName: true, avatarUrl: true },
            },
            volunteerProfile: {
              select: { fullName: true, avatarUrl: true },
            },
          },
        },
        activity: { select: { id: true, title: true } },
      },
    });

    return appreciations.map((appr) => {
      const userProfile =
        appr.sender.bficiaryProfile || appr.sender.volunteerProfile;

      return {
        id: appr.id,
        createdAt: appr.createdAt,
        activity: appr.activity,
        sender: {
          id: appr.sender.id,
          fullName: userProfile?.fullName || 'Người dùng ẩn danh',
          avatarUrl: userProfile?.avatarUrl || null,
        },
      };
    });
  }
}
