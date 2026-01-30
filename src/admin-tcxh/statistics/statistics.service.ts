import { Injectable } from '@nestjs/common';
import {
  CampaignStatus,
  Prisma,
  RegistrationStatus,
  UserStatus,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  // Lay thong ke tong quan
  async getOverviewStatistics(organizationId: string) {
    // Đếm tổng số tình nguyện viên
    const totalVolunteers = await this.prisma.volunteerProfile.count({
      where: {
        organizationId,
        user: { status: UserStatus.ACTIVE },
      },
    });

    // Đếm tổng số người cần giúp đỡ
    const totalBeneficiaries = await this.prisma.bficiaryProfile.count({
      where: {
        organizationId,
        user: { status: UserStatus.ACTIVE },
      },
    });

    // Đếm tổng số chiến dịch
    const totalCampaigns = await this.prisma.campaign.count({
      where: { organizationId },
    });

    // Đếm chiến dịch đang diễn ra
    const ongoingCampaigns = await this.prisma.campaign.count({
      where: {
        organizationId,
        status: CampaignStatus.ONGOING,
      },
    });

    // Đếm tổng số bài viết
    const totalPosts = await this.prisma.communicationPost.count({
      where: { organizationId },
    });

    // TNV mới trong tháng này
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newVolunteersThisMonth = await this.prisma.volunteerProfile.count({
      where: {
        organizationId,
        joinedOrganizationAt: {
          gte: startOfMonth,
        },
      },
    });

    // NCGĐ mới trong tháng này
    const newBeneficiariesThisMonth = await this.prisma.bficiaryProfile.count({
      where: {
        organizationId,
        joinedOrganizationAt: {
          gte: startOfMonth,
        },
      },
    });

    return {
      totalVolunteers,
      totalBeneficiaries,
      totalCampaigns,
      ongoingCampaigns,
      totalPosts,
      newVolunteersThisMonth,
      newBeneficiariesThisMonth,
    };
  }

  // Thong ke tinh nguyen vien
  async getVolunteerStatistics(organizationId: string) {
    // TNV theo trạng thái
    const volunteersByStatus = await this.prisma.user.groupBy({
      by: ['status'],
      where: {
        role: 'VOLUNTEER',
        volunteerProfile: {
          organizationId,
        },
      },
      _count: true,
    });

    // Top TNV có điểm cao nhất
    const topVolunteersByPoints = await this.prisma.volunteerProfile.findMany({
      where: {
        organizationId,
        user: { status: UserStatus.ACTIVE },
      },
      orderBy: { points: 'desc' },
      take: 10,
      select: {
        userId: true,
        fullName: true,
        avatarUrl: true,
        points: true,
        totalThanks: true,
      },
    });

    // TNV tham gia nhiều chiến dịch nhất
    const topVolunteersByCampaigns =
      await this.prisma.campaignRegistration.groupBy({
        by: ['volunteerId'],
        where: {
          campaign: { organizationId },
          status: RegistrationStatus.REGISTERED,
        },
        _count: true,
        orderBy: {
          _count: {
            volunteerId: 'desc',
          },
        },
        take: 10,
      });

    // Lấy thông tin chi tiết của top volunteers
    const topVolunteerIds = topVolunteersByCampaigns.map((v) => v.volunteerId);
    const volunteerDetails = await this.prisma.volunteerProfile.findMany({
      where: {
        userId: { in: topVolunteerIds },
      },
      select: {
        userId: true,
        fullName: true,
        avatarUrl: true,
        points: true,
      },
    });

    const topVolunteersWithCampaignCount = topVolunteersByCampaigns.map((v) => {
      const detail = volunteerDetails.find((d) => d.userId === v.volunteerId);
      return {
        ...detail,
        campaignCount: v._count,
      };
    });

    // Thống kê theo khu vực ưa thích
    const volunteersByDistrict = await this.prisma.volunteerProfile.findMany({
      where: {
        organizationId,
        user: { status: UserStatus.ACTIVE },
      },
      select: {
        preferredDistricts: true,
      },
    });

    // Đếm số TNV theo từng quận
    const districtCounts: Record<string, number> = {};
    volunteersByDistrict.forEach((v) => {
      v.preferredDistricts.forEach((district) => {
        districtCounts[district] = (districtCounts[district] || 0) + 1;
      });
    });

    return {
      volunteersByStatus: volunteersByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      topVolunteersByPoints,
      topVolunteersByCampaigns: topVolunteersWithCampaignCount,
      volunteersByDistrict: Object.entries(districtCounts).map(
        ([district, count]) => ({
          district,
          count,
        }),
      ),
    };
  }

  // Thong ke nguoi can giup do
  async getBeneficiaryStatistics(organizationId: string) {
    // NCGĐ theo trạng thái
    const beneficiariesByStatus = await this.prisma.user.groupBy({
      by: ['status'],
      where: {
        role: 'BENEFICIARY',
        bficiaryProfile: {
          organizationId,
        },
      },
      _count: true,
    });

    // NCGĐ theo loại hoàn cảnh
    const beneficiariesByVulnerability =
      await this.prisma.bficiaryProfile.groupBy({
        by: ['vulnerabilityType'],
        where: {
          organizationId,
          user: { status: UserStatus.ACTIVE },
        },
        _count: true,
      });

    return {
      beneficiariesByStatus: beneficiariesByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      beneficiariesByVulnerability: beneficiariesByVulnerability.map(
        (item) => ({
          vulnerabilityType: item.vulnerabilityType,
          count: item._count,
        }),
      ),
    };
  }

  // Thong ke chien dich
  async getCampaignStatistics(organizationId: string) {
    // Chiến dịch theo trạng thái
    const campaignsByStatus = await this.prisma.campaign.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    // Chiến dịch theo khu vực
    const campaignsByDistrict = await this.prisma.campaign.groupBy({
      by: ['district'],
      where: { organizationId },
      _count: true,
    });

    // Top chiến dịch có nhiều TNV đăng ký nhất
    const topCampaignsByRegistrations = await this.prisma.campaign.findMany({
      where: { organizationId },
      orderBy: { currentVolunteers: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        currentVolunteers: true,
        maxVolunteers: true,
        targetVolunteers: true,
        status: true,
        startDate: true,
      },
    });

    // Tổng số lượt đăng ký
    const totalRegistrations = await this.prisma.campaignRegistration.count({
      where: {
        campaign: { organizationId },
      },
    });

    return {
      campaignsByStatus: campaignsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      campaignsByDistrict: campaignsByDistrict.map((item) => ({
        district: item.district,
        count: item._count,
      })),
      topCampaignsByRegistrations,
      totalRegistrations,
    };
  }

  // Thong ke hoat dong theo thoi gian
  async getActivityStatistics(organizationId: string, days?: number) {
    const startDate = days
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    // TNV mới theo tháng
    const volunteersPerMonth = await this.prisma.$queryRaw<
      Array<{ month: string; count: bigint }>
    >`
      SELECT
        TO_CHAR(joined_organization_at, 'YYYY-MM') as month,
        COUNT(*)::bigint as count
      FROM "VolunteerProfile"
      WHERE organization_id = ${organizationId}
        AND joined_organization_at >= ${startDate}
      GROUP BY TO_CHAR(joined_organization_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // NCGĐ mới theo tháng
    const beneficiariesPerMonth = await this.prisma.$queryRaw<
      Array<{ month: string; count: bigint }>
    >`
      SELECT
        TO_CHAR(joined_organization_at, 'YYYY-MM') as month,
        COUNT(*)::bigint as count
      FROM "BficiaryProfile"
      WHERE organization_id = ${organizationId}
        AND joined_organization_at >= ${startDate}
      GROUP BY TO_CHAR(joined_organization_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Chiến dịch mới theo tháng
    const campaignsPerMonth = await this.prisma.$queryRaw<
      Array<{ month: string; count: bigint }>
    >`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::bigint as count
      FROM "Campaign"
      WHERE organization_id = ${organizationId}
        AND created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Bài viết mới theo tháng
    const postsPerMonth = await this.prisma.$queryRaw<
      Array<{ month: string; count: bigint }>
    >`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::bigint as count
      FROM communication_posts
      WHERE organization_id = ${organizationId}
        AND created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    return {
      volunteersPerMonth: volunteersPerMonth.map((item) => ({
        month: item.month,
        count: Number(item.count),
      })),
      beneficiariesPerMonth: beneficiariesPerMonth.map((item) => ({
        month: item.month,
        count: Number(item.count),
      })),
      campaignsPerMonth: campaignsPerMonth.map((item) => ({
        month: item.month,
        count: Number(item.count),
      })),
      postsPerMonth: postsPerMonth.map((item) => ({
        month: item.month,
        count: Number(item.count),
      })),
    };
  }

  // Thong ke hoat dong ho tro
  async getHelpRequestStatistics(organizationId: string, days?: number) {
    const startDate = days
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      : null;

    const whereClause: any = {
      OR: [
        { requester: { volunteerProfile: { organizationId } } },
        { requester: { bficiaryProfile: { organizationId } } },
        { volunteer: { volunteerProfile: { organizationId } } },
      ],
    };

    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    // Tổng số hoạt động theo trạng thái
    const helpRequestsByStatus = await this.prisma.helpRequest.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    // Hoạt động theo danh mục
    const helpRequestsByCategory = await this.prisma.helpRequest.groupBy({
      by: ['activityType'],
      where: whereClause,
      _count: true,
    });

    // Hoạt động theo khu vực
    const helpRequestsByDistrict = await this.prisma.helpRequest.groupBy({
      by: ['district'],
      where: whereClause,
      _count: true,
    });

    // Hoạt động theo thời gian (theo tháng)
    const helpRequestsPerMonth = await this.prisma.$queryRaw<
      Array<{ month: string; status: string; count: bigint }>
    >`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        status,
        COUNT(*)::bigint as count
      FROM "HelpRequest" hr
      WHERE (
        EXISTS (SELECT 1 FROM "VolunteerProfile" vp WHERE vp.user_id = hr.requester_id AND vp.organization_id = ${organizationId})
        OR EXISTS (SELECT 1 FROM "BficiaryProfile" bp WHERE bp.user_id = hr.requester_id AND bp.organization_id = ${organizationId})
        OR EXISTS (SELECT 1 FROM "VolunteerProfile" vp WHERE vp.user_id = hr.volunteer_id AND vp.organization_id = ${organizationId})
      )
      ${startDate ? Prisma.sql`AND created_at >= ${startDate}` : Prisma.empty}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), status
      ORDER BY month ASC
    `;

    return {
      helpRequestsByStatus: helpRequestsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      helpRequestsByCategory: helpRequestsByCategory.map((item) => ({
        category: item.activityType,
        count: item._count,
      })),
      helpRequestsByDistrict: helpRequestsByDistrict.map((item) => ({
        district: item.district,
        count: item._count,
      })),
      helpRequestsPerMonth: helpRequestsPerMonth.map((item) => ({
        month: item.month,
        status: item.status,
        count: Number(item.count),
      })),
    };
  }

  // API public - Top TNV toan he thong
  async getTopVolunteersGlobal(limit: number = 10) {
    const topVolunteers = await this.prisma.volunteerProfile.findMany({
      where: {
        user: { status: UserStatus.ACTIVE },
      },
      orderBy: { points: 'desc' },
      take: limit,
      select: {
        userId: true,
        fullName: true,
        avatarUrl: true,
        points: true,
        totalThanks: true,
        organization: {
          select: {
            organizationProfiles: {
              select: {
                organizationName: true,
              },
            },
          },
        },
      },
    });

    return topVolunteers.map((v) => ({
      userId: v.userId,
      fullName: v.fullName,
      avatarUrl: v.avatarUrl,
      points: v.points,
      totalThanks: v.totalThanks,
      organizationName:
        v.organization?.organizationProfiles?.organizationName || null,
    }));
  }

  async getTopOrganizationsGlobal(limit: number = 10) {
    // Lấy danh sách tổ chức với số campaign COMPLETED
    const organizations = await this.prisma.user.findMany({
      where: {
        role: 'ORGANIZATION',
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        organizationProfiles: {
          select: {
            organizationName: true,
            avatarUrl: true,
            description: true,
          },
        },
        campaigns: {
          where: {
            status: CampaignStatus.COMPLETED,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Map và sắp xếp theo số campaign hoàn thành
    const topOrgs = organizations
      .map((org) => ({
        organizationId: org.id,
        organizationName: org.organizationProfiles?.organizationName || 'Unknown',
        avatarUrl: org.organizationProfiles?.avatarUrl,
        description: org.organizationProfiles?.description,
        completedCampaigns: org.campaigns.length,
      }))
      .sort((a, b) => b.completedCampaigns - a.completedCampaigns)
      .slice(0, limit);

    return topOrgs;
  }
}
