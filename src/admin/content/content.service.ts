import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CampaignStatus } from 'src/generated/prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts(
    search?: string,
    organizationId?: string,
    page: number | string = 1,
    limit: number | string = 20,
  ) {
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 20;
    const skip = (parsedPage - 1) * parsedLimit;

    const where: any = {};

    // Loc theo TCXH neu co
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Tim kiem theo tieu de post
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.communicationPost.findMany({
        where,
        skip,
        take: parsedLimit,
        include: {
          organization: {
            select: {
              id: true,
              email: true,
              organizationProfiles: {
                select: {
                  organizationName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communicationPost.count({ where }),
    ]);

    return {
      items,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async getPostById(id: string) {
    const post = await this.prisma.communicationPost.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            email: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return post;
  }

  async getAllCampaigns(
    search?: string,
    organizationId?: string,
    status?: string,
    page: number | string = 1,
    limit: number | string = 20,
  ) {
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 20;
    const skip = (parsedPage - 1) * parsedLimit;

    const where: any = {};

    // Loc theo TCXH neu co
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Loc theo trang thai neu co
    if (status) {
      where.status = status as CampaignStatus;
    }

    // Tim kiem theo tieu de campaign
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: parsedLimit,
        include: {
          organization: {
            select: {
              id: true,
              email: true,
              organizationProfiles: {
                select: {
                  organizationName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      items,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }

  async approveCampaign(id: string, status: 'APPROVED' | 'REJECTED') {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status },
    });

    return {
      message:
        status === 'APPROVED'
          ? 'Đã duyệt campaign thành công'
          : 'Đã từ chối campaign',
      campaign: updated,
    };
  }
}
