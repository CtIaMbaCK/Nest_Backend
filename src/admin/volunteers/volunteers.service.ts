import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { District, UserStatus } from 'src/generated/prisma/client';
import { CreateAdminCommentDto } from '../certificates/dto/create-admin-comment.dto';

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
      const formattedDistrict = district.toUpperCase() as District;
      andConditions.push({
        volunteerProfile: {
          preferredDistricts: {
            hasSome: [formattedDistrict],
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

  // ==================== ADMIN COMMENTS ====================

  async createAdminComment(dto: CreateAdminCommentDto) {
    // Kiểm tra TNV có tồn tại không
    const volunteer = await this.prisma.user.findUnique({
      where: { id: dto.volunteerId, role: 'VOLUNTEER' },
    });

    if (!volunteer) {
      throw new NotFoundException('Không tìm thấy tình nguyện viên');
    }

    // Tạo nhận xét (organizationId = null cho Admin)
    const comment = await this.prisma.volunteerComment.create({
      data: {
        volunteerId: dto.volunteerId,
        organizationId: null, // Admin comment
        comment: dto.comment,
        rating: dto.rating,
      },
      include: {
        volunteer: {
          select: {
            id: true,
            email: true,
            volunteerProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Đã tạo nhận xét thành công',
      comment,
    };
  }

  async getVolunteerComments(volunteerId: string) {
    // Kiểm tra TNV có tồn tại không
    const volunteer = await this.prisma.user.findUnique({
      where: { id: volunteerId, role: 'VOLUNTEER' },
    });

    if (!volunteer) {
      throw new NotFoundException('Không tìm thấy tình nguyện viên');
    }

    // Lấy tất cả nhận xét (cả Admin và TCXH)
    const comments = await this.prisma.volunteerComment.findMany({
      where: { volunteerId },
      include: {
        organization: {
          select: {
            id: true,
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
    });

    return comments;
  }

  async deleteAdminComment(commentId: string) {
    // Kiểm tra comment có tồn tại và là của Admin không
    const comment = await this.prisma.volunteerComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy nhận xét');
    }

    if (comment.organizationId !== null) {
      throw new BadRequestException('Chỉ có thể xóa nhận xét của Admin');
    }

    await this.prisma.volunteerComment.delete({
      where: { id: commentId },
    });

    return {
      message: 'Đã xóa nhận xét thành công',
    };
  }
}
