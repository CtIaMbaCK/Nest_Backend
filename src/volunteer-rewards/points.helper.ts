import { PointSource } from 'src/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class PointsHelper {
  /**
   * Cộng điểm cho TNV khi hoàn thành HelpRequest
   */
  static async addPointsForHelpRequest(
    prisma: PrismaService,
    volunteerId: string,
    helpRequestId: string,
  ): Promise<void> {
    const POINTS = 10;

    // Kiểm tra đã cộng điểm chưa
    const existing = await prisma.pointHistory.findFirst({
      where: {
        volunteerId,
        helpRequestId,
        source: PointSource.HELP_REQUEST,
      },
    });

    if (existing) {
      return; // Đã cộng rồi, không cộng lại
    }

    // Cộng điểm vào VolunteerProfile
    await prisma.volunteerProfile.update({
      where: { userId: volunteerId },
      data: {
        points: {
          increment: POINTS,
        },
      },
    });

    // Lưu lịch sử
    await prisma.pointHistory.create({
      data: {
        volunteerId,
        points: POINTS,
        source: PointSource.HELP_REQUEST,
        description: `Hoàn thành yêu cầu giúp đỡ`,
        helpRequestId,
      },
    });
  }

  /**
   * Cộng điểm cho TNV khi tham gia Campaign
   */
  static async addPointsForCampaign(
    prisma: PrismaService,
    volunteerId: string,
    campaignId: string,
  ): Promise<void> {
    const POINTS = 10;

    // Kiểm tra đã cộng điểm chưa
    const existing = await prisma.pointHistory.findFirst({
      where: {
        volunteerId,
        campaignId,
        source: PointSource.CAMPAIGN,
      },
    });

    if (existing) {
      return; // Đã cộng rồi
    }

    // Cộng điểm vào VolunteerProfile
    await prisma.volunteerProfile.update({
      where: { userId: volunteerId },
      data: {
        points: {
          increment: POINTS,
        },
      },
    });

    // Lưu lịch sử
    await prisma.pointHistory.create({
      data: {
        volunteerId,
        points: POINTS,
        source: PointSource.CAMPAIGN,
        description: `Tham gia campaign`,
        campaignId,
      },
    });
  }
}
