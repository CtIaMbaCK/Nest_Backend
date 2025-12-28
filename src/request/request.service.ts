import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import 'dotenv/config';
import { env as ENV } from 'prisma/config';

import { GoongResponse } from './goong.interface';

@Injectable()
export class RequestService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(userId: string, dto: CreateRequestDto) {
    let lat: number | null = null;
    let long: number | null = null;

    try {
      const apiKey = ENV('GOONG_API_KEY');
      const gooongBaseUrl = ENV('GOONG_URL');
      const fullAddress = `${dto.addressDetail}, ${dto.district}, TP. Hồ Chí Minh`;

      const url = `${gooongBaseUrl}?address=${encodeURIComponent(fullAddress)}&api_key=${apiKey}`;

      const response = await axios.get<GoongResponse>(url);

      const data = response.data;

      if (data.results?.length > 0) {
        const location = data.results[0].geometry.location;
        lat = location.lat;
        long = location.lng;
      }
    } catch (error) {
      return new BadRequestException(
        'Lấy tọa độ thất bại, vui lòng kiểm tra lại địa chỉ!',
        { cause: error },
      );
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
    if (existedRequest.volunteerId) {
      throw new BadRequestException('Yêu cầu này đã có người khác nhận rồi!');
    }
    if (existedRequest.requesterId === volunteerId) {
      throw new BadRequestException('Không thể tự nhận yêu cầu của bản thân');
    }

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

  async findAllRequests() {
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

  async getMapLocation() {
    return this.prisma.helpRequest.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        addressDetail: true,

        title: true,
        description: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
