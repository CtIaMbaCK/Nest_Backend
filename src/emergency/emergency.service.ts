import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo SOS request (BENEFICIARY only)
  async createEmergency(beneficiaryId: string, dto: CreateEmergencyDto) {
    // Kiểm tra user có phải là BENEFICIARY không
    const user = await this.prisma.user.findUnique({
      where: { id: beneficiaryId },
      include: { bficiaryProfile: true },
    });

    if (!user || user.role !== 'BENEFICIARY') {
      throw new ForbiddenException('Chỉ người cần giúp đỡ mới có thể gửi SOS');
    }

    if (!user.bficiaryProfile) {
      throw new ForbiddenException('Vui lòng hoàn thiện hồ sơ trước khi gửi SOS');
    }

    // Tạo emergency request
    return this.prisma.emergencyRequest.create({
      data: {
        beneficiaryId: user.bficiaryProfile.userId,
        status: 'NEW',
      },
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  // Lấy danh sách SOS requests (Admin only)
  async getEmergencies(status?: 'NEW' | 'COMPLETED') {
    return this.prisma.emergencyRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Lấy chi tiết 1 SOS request
  async getEmergencyById(id: string) {
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!emergency) {
      throw new NotFoundException('Không tìm thấy yêu cầu SOS');
    }

    return emergency;
  }

  // Cập nhật trạng thái SOS (Admin only)
  async updateEmergency(id: string, dto: UpdateEmergencyDto) {
    const emergency = await this.prisma.emergencyRequest.findUnique({
      where: { id },
    });

    if (!emergency) {
      throw new NotFoundException('Không tìm thấy yêu cầu SOS');
    }

    return this.prisma.emergencyRequest.update({
      where: { id },
      data: {
        status: dto.status,
        completedAt: dto.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        beneficiary: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  // Đếm số SOS chưa xử lý (cho Dashboard)
  async countPendingEmergencies() {
    return this.prisma.emergencyRequest.count({
      where: { status: 'NEW' },
    });
  }
}
