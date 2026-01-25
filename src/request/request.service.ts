import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto, UpdateStatusDto } from './dto/update-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import 'dotenv/config';
import { env as ENV } from 'prisma/config';

import { GoongResponse } from './goong.interface';
import { FilterActivityDto } from './dto/filter.dto';
import { PointsHelper } from '../volunteer-rewards/points.helper';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(userId: string, dto: CreateRequestDto) {
    let lat: number | null = null;
    let long: number | null = null;

    try {
      // Sử dụng Google Maps Geocoding API thay vì Goong
      const apiKey = ENV('GOOGLE_MAPS_API_KEY');

      // Chỉ geocoding nếu có API key hợp lệ
      if (apiKey && apiKey !== '' && apiKey !== 'your-google-maps-api-key') {
        const fullAddress = `${dto.addressDetail}, ${dto.district}, TP. Hồ Chí Minh`;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;

        try {
          const response = await axios.get(url);
          const data = response.data;

          if (data.status === 'OK' && data.results?.length > 0) {
            const location = data.results[0].geometry.location;
            lat = location.lat;
            long = location.lng;
          } else {
            console.warn(`Geocoding warning: ${data.status}`);
          }
        } catch (geoError) {
          console.warn('Geocoding failed, continuing without coordinates:', geoError);
        }
      } else {
        console.warn('Google Maps API key not configured, creating request without coordinates');
      }
      // Nếu không có API key hoặc geocoding fail, vẫn cho phép tạo request (lat/long = null)
    } catch (error) {
      console.warn('Error in geocoding process:', error);
      // Không throw error, vẫn tiếp tục tạo request
    }
    return this.prisma.helpRequest.create({
      data: {
        title: dto.title,
        activityType: dto.activityType,
        description: dto.description,
        district: dto.district,
        addressDetail: dto.addressDetail,

        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),

        urgencyLevel: dto.urgencyLevel || 'STANDARD', // Fix: Thêm urgencyLevel

        latitude: lat,
        longitude: long,

        recurrence: dto.recurrence || 'NONE',
        activityImages: dto.activityImages || [],

        requester: {
          connect: { id: userId },
        },
        status: 'PENDING',
      },
    });
  }

  // xem chi tiet
  async getRequestDetail(id: string) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            phoneNumber: true,
            bficiaryProfile: {
              select: {
                fullName: true,
                avatarUrl: true,
                guardianName: true,
                guardianPhone: true,
                guardianRelation: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy hoạt động/yêu cầu này');
    }

    const { requester, ...requestInfo } = request; // Tách requester ra khỏi requestInfo

    return {
      ...requestInfo,
      requester: {
        id: requester.id, //cai nay bo dc
        phoneNumber: requester.phoneNumber,

        fullName: requester.bficiaryProfile?.fullName || 'Người cần giúp đỡ',
        avatarUrl: requester.bficiaryProfile?.avatarUrl || null,

        guardianName: requester.bficiaryProfile?.guardianName || null,
        guardianPhone: requester.bficiaryProfile?.guardianPhone || null,
        guardianRelation: requester.bficiaryProfile?.guardianRelation || null,
      },
    };
  }

  async acceptRequest(volunteerId: string, requesterId: string) {
    const existedRequest = await this.prisma.helpRequest.findUnique({
      where: {
        id: requesterId,
      },
    });

    // check
    if (!existedRequest) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }

    // Check status - only allow accepting APPROVED requests
    if (existedRequest.status !== 'APPROVED') {
      throw new BadRequestException(
        `Không thể nhận yêu cầu có trạng thái ${existedRequest.status}`,
      );
    }

    if (existedRequest.volunteerId) {
      throw new BadRequestException('Yêu cầu này đã có người khác nhận rồi!');
    }

    if (existedRequest.requesterId === volunteerId) {
      throw new BadRequestException('Không thể tự nhận yêu cầu của bản thân');
    }

    // KHÔNG cho accept khi đã quá startDate + startTime
    // Note: Tạm thời comment để test - sẽ bỏ comment sau khi confirm logic đúng
    /*
    const now = new Date();
    const startDateTime = new Date(existedRequest.startDate);
    // Combine date và time để so sánh chính xác
    if (existedRequest.startTime) {
      const time = new Date(existedRequest.startTime);
      startDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    }

    if (now >= startDateTime) {
      throw new BadRequestException('Không thể nhận yêu cầu sau thời gian bắt đầu');
    }
    */

    return this.prisma.helpRequest.update({
      where: { id: requesterId },
      data: {
        volunteer: {
          connect: { id: volunteerId },
        },
        status: 'ONGOING',
        acceptedAt: new Date(),
      },
    });
  }

  // cap nhat trang thai yeu cau khi hoan thanh
  async updateStatusRequestWhenComplete(
    userId: string,
    requestId: string,
    dto: UpdateStatusDto,
  ) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    if (request.volunteerId !== userId) {
      throw new ForbiddenException(
        'Bạn không thực hiện hoạt động này để cập nhật trạng thái',
      );
    }

    if (request.status === 'COMPLETED') {
      throw new BadRequestException(
        'Yêu cầu này đã hoàn thành, không thể cập nhật trạng thái nữa!',
      );
    }

    const updated = await this.prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        doneAt: new Date(),

        proofImages: dto.proofImages,
        completionNotes: dto.completionNotes,
      },
    });

    // Tự động cộng +10 điểm cho TNV khi hoàn thành request
    if (request.volunteerId) {
      await PointsHelper.addPointsForHelpRequest(
        this.prisma,
        request.volunteerId,
        requestId,
      );
    }

    return updated;
  }

  // cap nhat yeu cau giup do
  async updateRequest(
    volunteerId: string,
    requestId: string,
    dto: UpdateRequestDto,
  ) {
    const request = await this.prisma.helpRequest.findUnique({
      where: { id: requestId },
    });

    // check
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu này');
    }
    if (request.requesterId !== volunteerId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa yêu cầu của người khác',
      );
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Yêu cầu này đã có người nhận hoặc đã hoàn thành, không thể chỉnh sửa nữa!',
      );
    }

    return this.prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        title: dto.title,
        description: dto.description,
        activityType: dto.activityType,
        district: dto.district,
        addressDetail: dto.addressDetail,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        recurrence: dto.recurrence,
        activityImages: dto.activityImages,
      },
    });
  }

  // Lấy tất cả yêu cầu giúp đỡ - cho admin, tnv cung co the dung de dang ky
  async findAllRequests() {
    // them chuc nang la admin moi coi dc
    return this.prisma.helpRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            phoneNumber: true,
            volunteerProfile: true,
          },
        },
      },
    });
  }

  // Lấy tất cả yêu cầu giúp đỡ của người can giup do
  async findRequestsByRequester(userId: string) {
    return this.prisma.helpRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        volunteer: true,
      },
    });
  }

  // Lấy tất cả yêu cầu giúp đỡ của tình nguyện viên
  async findRequestsByVolunteer(userId: string) {
    return this.prisma.helpRequest.findMany({
      where: { volunteerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: true,
      },
    });
  }

  async getMapLocation() {
    return this.prisma.helpRequest.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        // Chỉ lấy các request chưa có người nhận (volunteerId null)
        // và status là APPROVED (đã được admin duyệt)
        volunteerId: null,
        status: 'APPROVED',
      },
      select: {
        id: true,
        requesterId: true,
        volunteerId: true,
        acceptedAt: true,
        latitude: true,
        longitude: true,
        addressDetail: true,
        title: true,
        description: true,
        status: true,
        urgencyLevel: true,
        activityType: true,
        district: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        recurrence: true,
        activityImages: true,
        createdAt: true,
        doneAt: true,
        proofImages: true,
        completionNotes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // SUA SAU
  async findAllByUserId(userId: string, dto: FilterActivityDto) {
    const { search, status, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      requesterId: userId,
    };

    if (search && search.trim() !== '') {
      whereCondition.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.helpRequest.findMany({
        where: whereCondition,
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              bficiaryProfile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.helpRequest.count({ where: whereCondition }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Helper: Tự động chuyển request status theo thời gian
  async autoTransitionRequests() {
    const now = new Date();
    let totalUpdated = 0;
    const results: any = {};

    // Tìm requests ONGOING đã quá endDate
    const expiredRequests = await this.prisma.helpRequest.findMany({
      where: {
        status: 'ONGOING',
        endDate: { not: null, lte: now },
      },
      select: {
        id: true,
        volunteerId: true,
      },
    });

    if (expiredRequests.length > 0) {
      // Tất cả đều chuyển COMPLETED vì đã có volunteer accept
      const requestIds = expiredRequests.map((r) => r.id);

      await this.prisma.helpRequest.updateMany({
        where: { id: { in: requestIds } },
        data: { status: 'COMPLETED' },
      });

      totalUpdated += expiredRequests.length;
      results.completed = {
        count: expiredRequests.length,
        requestIds,
      };
    }

    // Tìm requests APPROVED (chưa có ai nhận) đã quá endDate
    const abandonedRequests = await this.prisma.helpRequest.findMany({
      where: {
        status: 'APPROVED',
        volunteerId: null,
        endDate: { not: null, lte: now },
      },
      select: { id: true },
    });

    if (abandonedRequests.length > 0) {
      const requestIds = abandonedRequests.map((r) => r.id);

      await this.prisma.helpRequest.updateMany({
        where: { id: { in: requestIds } },
        data: { status: 'CANCELLED' },
      });

      totalUpdated += abandonedRequests.length;
      results.cancelled = {
        count: abandonedRequests.length,
        requestIds,
      };
    }

    if (totalUpdated === 0) {
      return { message: 'Không có request nào cần chuyển trạng thái', count: 0 };
    }

    return {
      message: `Đã cập nhật ${totalUpdated} requests`,
      totalUpdated,
      details: results,
    };
  }
}
