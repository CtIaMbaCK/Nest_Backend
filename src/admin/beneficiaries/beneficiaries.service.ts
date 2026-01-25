import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { UserStatus } from 'src/generated/prisma/client';

@Injectable()
export class BeneficiariesService {
  constructor(private prisma: PrismaService) {}

  async getAllBeneficiaries(
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'BENEFICIARY',
    };

    if (status) {
      where.status = status as UserStatus;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { bficiaryProfile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          bficiaryProfile: {
            select: {
              fullName: true,
              avatarUrl: true,
              vulnerabilityType: true,
              organizationId: true,
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

  async getBeneficiaryDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'BENEFICIARY' },
      include: {
        bficiaryProfile: {
          include: {
            organization: {
              select: {
                id: true,
                organizationProfiles: {
                  select: {
                    organizationName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay NCGD');
    }

    return user;
  }

  async updateBeneficiary(id: string, updateDto: UpdateBeneficiaryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'BENEFICIARY' },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay NCGD');
    }

    const { fullName, phoneNumber, status } = updateDto;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        bficiaryProfile: true,
      },
    });

    if (fullName) {
      await this.prisma.bficiaryProfile.update({
        where: { userId: id },
        data: { fullName },
      });
    }

    return updated;
  }
}
