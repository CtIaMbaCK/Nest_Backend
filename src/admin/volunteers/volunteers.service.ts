import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { District, UserStatus } from 'src/generated/prisma/client';

@Injectable()
export class VolunteersService {
  constructor(private prisma: PrismaService) {}

  async getAllVolunteers(
    search?: string,
    status?: string,
    district?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'VOLUNTEER',
    };

    if (status) {
      where.status = status as UserStatus;
    }

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
          { volunteerProfile: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (district) {
      andConditions.push({
        volunteerProfile: {
          preferredDistricts: {
            hasSome: [district],
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          volunteerProfile: {
            select: {
              fullName: true,
              avatarUrl: true,
              skills: true,
              preferredDistricts: true,
              points: true,
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

  async getVolunteerDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'VOLUNTEER' },
      include: {
        volunteerProfile: {
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
      throw new NotFoundException('Khong tim thay TNV');
    }

    return user;
  }

  async updateVolunteer(id: string, updateDto: UpdateVolunteerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, role: 'VOLUNTEER' },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay TNV');
    }

    const { fullName, phoneNumber, status } = updateDto;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        volunteerProfile: true,
      },
    });

    if (fullName) {
      await this.prisma.volunteerProfile.update({
        where: { userId: id },
        data: { fullName },
      });
    }

    return updated;
  }
}
