import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ActivityLogEntry {
  id: string;
  type: string;
  action: string;
  user?: {
    id: string;
    phoneNumber: string;
    role: string;
  } | null;
  metadata?: any;
  createdAt: Date;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả activity logs từ các bảng khác nhau
  async getAllActivities(limit = 100): Promise<ActivityLogEntry[]> {
    const activities: ActivityLogEntry[] = [];

    // 1. Emergency SOS
    const emergencies = await this.prisma.emergencyRequest.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                phoneNumber: true,
                role: true,
              },
            },
          },
        },
      },
    });

    emergencies.forEach((e) => {
      activities.push({
        id: e.id,
        type: 'EMERGENCY_SOS',
        action: `Gửi SOS khẩn cấp`,
        user: e.beneficiary.user,
        metadata: { status: e.status },
        createdAt: e.createdAt,
      });
    });

    // 2. Help Requests
    const requests = await this.prisma.helpRequest.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
        volunteer: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    requests.forEach((r) => {
      activities.push({
        id: r.id,
        type: 'REQUEST',
        action: `Tạo yêu cầu hỗ trợ: ${r.title}`,
        user: r.requester,
        metadata: {
          status: r.status,
          district: r.district,
          volunteerId: r.volunteerId,
        },
        createdAt: r.createdAt,
      });

      // Nếu có volunteer nhận
      if (r.volunteer && r.acceptedAt) {
        activities.push({
          id: `${r.id}-accepted`,
          type: 'REQUEST_ACCEPTED',
          action: `Nhận yêu cầu: ${r.title}`,
          user: r.volunteer,
          metadata: { requestId: r.id },
          createdAt: r.acceptedAt,
        });
      }

      // Nếu đã hoàn thành
      if (r.doneAt) {
        activities.push({
          id: `${r.id}-done`,
          type: 'REQUEST_COMPLETED',
          action: `Hoàn thành yêu cầu: ${r.title}`,
          user: r.volunteer,
          metadata: { requestId: r.id },
          createdAt: r.doneAt,
        });
      }
    });

    // 3. Campaigns
    const campaigns = await this.prisma.campaign.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    campaigns.forEach((c) => {
      activities.push({
        id: c.id,
        type: 'CAMPAIGN',
        action: `Tạo chiến dịch: ${c.title}`,
        user: c.organization,
        metadata: {
          status: c.status,
          district: c.district,
          targetVolunteers: c.targetVolunteers,
        },
        createdAt: c.createdAt,
      });
    });

    // 4. Campaign Registrations
    const registrations = await this.prisma.campaignRegistration.findMany({
      take: limit,
      orderBy: { registeredAt: 'desc' },
      include: {
        volunteer: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
        campaign: {
          select: {
            title: true,
          },
        },
      },
    });

    registrations.forEach((r) => {
      activities.push({
        id: r.id,
        type: 'CAMPAIGN_REGISTRATION',
        action: `Đăng ký chiến dịch: ${r.campaign.title}`,
        user: r.volunteer,
        metadata: { status: r.status },
        createdAt: r.registeredAt,
      });
    });

    // 5. Reviews
    const reviews = await this.prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
        target: {
          select: {
            id: true,
            phoneNumber: true,
          },
        },
      },
    });

    reviews.forEach((r) => {
      activities.push({
        id: r.id,
        type: 'REVIEW',
        action: `Đánh giá ${r.rating} sao`,
        user: r.reviewer,
        metadata: {
          targetId: r.targetId,
          rating: r.rating,
        },
        createdAt: r.createdAt,
      });
    });

    // 6. Appreciations
    const appreciations = await this.prisma.appreciation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            phoneNumber: true,
          },
        },
      },
    });

    appreciations.forEach((a) => {
      activities.push({
        id: a.id,
        type: 'APPRECIATION',
        action: `Gửi lời cảm ơn`,
        user: a.sender,
        metadata: { receiverId: a.receiverId },
        createdAt: a.createdAt,
      });
    });

    // 7. Points History
    const points = await this.prisma.pointHistory.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        volunteer: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    points.forEach((p) => {
      activities.push({
        id: p.id,
        type: 'POINTS',
        action: `Nhận ${p.points} điểm từ ${p.source}`,
        user: p.volunteer,
        metadata: {
          points: p.points,
          source: p.source,
        },
        createdAt: p.createdAt,
      });
    });

    // 8. Issued Certificates
    const certificates = await this.prisma.issuedCertificate.findMany({
      take: limit,
      orderBy: { issuedAt: 'desc' },
      include: {
        volunteer: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    certificates.forEach((c) => {
      activities.push({
        id: c.id,
        type: 'CERTIFICATE',
        action: `Nhận chứng chỉ`,
        user: c.volunteer,
        metadata: { templateId: c.templateId },
        createdAt: c.issuedAt,
      });
    });

    // 9. Communication Posts
    const posts = await this.prisma.communicationPost.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        organization: {
          select: {
            id: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });

    posts.forEach((p) => {
      activities.push({
        id: p.id,
        type: 'POST',
        action: `Đăng bài: ${p.title}`,
        user: p.organization,
        metadata: {},
        createdAt: p.createdAt,
      });
    });

    // 10. User creation (from User.createdAt)
    const users = await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    users.forEach((u) => {
      activities.push({
        id: u.id,
        type: 'USER_CREATED',
        action: `Đăng ký tài khoản mới (${u.role})`,
        user: {
          id: u.id,
          phoneNumber: u.phoneNumber,
          role: u.role,
        },
        metadata: { status: u.status },
        createdAt: u.createdAt,
      });
    });

    // Sort tất cả theo thời gian giảm dần và lấy limit
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return activities.slice(0, limit);
  }

  // Statistics: Đếm số lượng hoạt động theo type
  async getActivityStats() {
    const [
      emergencyCount,
      requestCount,
      campaignCount,
      registrationCount,
      reviewCount,
    ] = await Promise.all([
      this.prisma.emergencyRequest.count(),
      this.prisma.helpRequest.count(),
      this.prisma.campaign.count(),
      this.prisma.campaignRegistration.count(),
      this.prisma.review.count(),
    ]);

    return {
      emergencies: emergencyCount,
      requests: requestCount,
      campaigns: campaignCount,
      registrations: registrationCount,
      reviews: reviewCount,
    };
  }
}
