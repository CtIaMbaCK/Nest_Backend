import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserStatus } from 'src/generated/prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async getAllOrganizations(
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'ORGANIZATION',
    };

    // Loc theo trang thai neu co
    if (status) {
      where.status = status as UserStatus;
    }

    // Tim kiem theo email, sdt hoac ten TCXH
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        {
          organizationProfiles: {
            organizationName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizationProfiles: {
            select: {
              organizationName: true,
              avatarUrl: true,
              representativeName: true,
              district: true,
              addressDetail: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrganizationDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'ORGANIZATION' },
      include: {
        organizationProfiles: true,
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            currentVolunteers: true,
            maxVolunteers: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        communicationPosts: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay TCXH');
    }

    return user;
  }

  async updateOrganization(id: string, updateDto: UpdateOrganizationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'ORGANIZATION' },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay TCXH');
    }

    const { organizationName, representativeName, phoneNumber, status } =
      updateDto;

    // Cap nhat thong tin user (status, phoneNumber)
    const updateData: any = {};
    if (status) updateData.status = status;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        organizationProfiles: true,
      },
    });

    // Cap nhat thong tin profile (organizationName, representativeName)
    if (organizationName || representativeName) {
      const profileUpdateData: any = {};
      if (organizationName)
        profileUpdateData.organizationName = organizationName;
      if (representativeName)
        profileUpdateData.representativeName = representativeName;

      await this.prisma.organizationProfile.update({
        where: { userId: id },
        data: profileUpdateData,
      });
    }

    return updated;
  }
}
