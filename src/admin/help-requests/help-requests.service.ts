import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ActivityStatus,
  District,
  RequestCategory,
  UrgencyLevel,
} from 'src/generated/prisma/enums';

interface GetHelpRequestsParams {
  search?: string;
  status?: string;
  district?: string;
  activityType?: string;
  urgencyLevel?: string;
  page: number;
  limit: number;
}

@Injectable()
export class HelpRequestsService {
  constructor(private prisma: PrismaService) {}

  async getAllHelpRequests(params: GetHelpRequestsParams) {
    const {
      search,
      status,
      district,
      activityType,
      urgencyLevel,
      page,
      limit,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (
      status &&
      Object.values(ActivityStatus).includes(status as ActivityStatus)
    ) {
      where.status = status as ActivityStatus;
    }

    if (district) {
      const selectedDistricts = district
        .split(',')
        .map((d) => d.trim())
        .filter((d) => Object.values(District).includes(d as District));
      
      if (selectedDistricts.length > 0) {
        where.district = { in: selectedDistricts as District[] };
      }
    }

    if (
      activityType &&
      Object.values(RequestCategory).includes(activityType as RequestCategory)
    ) {
      where.activityType = activityType as RequestCategory;
    }

    if (
      urgencyLevel &&
      Object.values(UrgencyLevel).includes(urgencyLevel as UrgencyLevel)
    ) {
      where.urgencyLevel = urgencyLevel as UrgencyLevel;
    }

    // Count total
    const total = await this.prisma.helpRequest.count({ where });

    // Get requests
    const items = await this.prisma.helpRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        activityType: true,
        urgencyLevel: true,
        district: true,
        addressDetail: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
        doneAt: true,
        activityImages: true,
        proofImages: true,
        completionNotes: true,
        requester: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            bficiaryProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
                vulnerabilityType: true,
              },
            },
          },
        },
        volunteer: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            volunteerProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
                points: true,
              },
            },
          },
        },
      },
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHelpRequestDetail(id: string) {
    const helpRequest = await this.prisma.helpRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            bficiaryProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
                vulnerabilityType: true,
                healthCondition: true,
                situationDescription: true,
              },
            },
          },
        },
        volunteer: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            volunteerProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
                points: true,
                skills: true,
              },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                email: true,
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
          },
        },
      },
    });

    if (!helpRequest) {
      throw new NotFoundException('Không tìm thấy yêu cầu giúp đỡ');
    }

    return helpRequest;
  }

  async approveHelpRequest(id: string, status: 'APPROVED' | 'REJECTED') {
    const helpRequest = await this.prisma.helpRequest.findUnique({
      where: { id },
    });

    if (!helpRequest) {
      throw new NotFoundException('Không tìm thấy yêu cầu giúp đỡ');
    }

    const updated = await this.prisma.helpRequest.update({
      where: { id },
      data: { status: status as ActivityStatus },
    });

    return {
      message:
        status === 'APPROVED'
          ? 'Đã duyệt yêu cầu giúp đỡ thành công'
          : 'Đã từ chối yêu cầu giúp đỡ',
      helpRequest: updated,
    };
  }
}
