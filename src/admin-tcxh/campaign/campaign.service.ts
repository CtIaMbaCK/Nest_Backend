import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CampaignStatus,
  RegistrationStatus,
  Role,
} from 'src/generated/prisma/enums';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  FilterCampaignDto,
  RegisterCampaignDto,
  SearchCampaignDto,
} from './dto';
import { Prisma } from 'src/generated/prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PointsHelper } from 'src/volunteer-rewards/points.helper';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Kiểm tra user có phải là Organization không
  private async getOrgOrThrow(userId: string) {
    const org = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organizationProfiles: true },
    });

    if (!org || org.role !== Role.ORGANIZATION) {
      throw new ForbiddenException('Chỉ tổ chức xã hội mới có quyền này');
    }
    return org;
  }

  // Tạo campaign mới
  async createCampaign(
    organizationId: string,
    dto: CreateCampaignDto,
    coverImageFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
  ) {
    await this.getOrgOrThrow(organizationId);

    // Validate maxVolunteers phải >= targetVolunteers
    if (dto.maxVolunteers < dto.targetVolunteers) {
      throw new BadRequestException(
        'Số lượng tối đa phải lớn hơn hoặc bằng số lượng mục tiêu',
      );
    }

    // Validate startDate phải trước endDate
    if (dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Upload ảnh lên Cloudinary
    let coverImageUrl: string | undefined;
    let imageUrls: string[] = [];

    if (coverImageFile) {
      coverImageUrl = await this.cloudinary.uploadFile(coverImageFile);
    }

    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await this.cloudinary.uploadFiles(imageFiles);
    }

    return this.prisma.campaign.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description,
        goal: dto.goal,
        district: dto.district,
        addressDetail: dto.addressDetail,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        coverImage: coverImageUrl,
        images: imageUrls,
        targetVolunteers: dto.targetVolunteers,
        maxVolunteers: dto.maxVolunteers,
        status: CampaignStatus.PENDING, // Changed from APPROVED - campaigns need admin approval
      },
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
  }

  // Lấy danh sách campaign của TCXH với filter
  async getCampaigns(organizationId: string, dto: FilterCampaignDto) {
    await this.getOrgOrThrow(organizationId);

    const {
      search,
      status,
      districts,
      createdFrom,
      createdTo,
      startFrom,
      startTo,
      page = 1,
      limit = 10,
    } = dto;

    const where: Prisma.CampaignWhereInput = {
      organizationId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: { in: status } }),
      ...(districts && { district: { in: districts } }),
      ...(createdFrom && { createdAt: { gte: new Date(createdFrom) } }),
      ...(createdTo && { createdAt: { lte: new Date(createdTo) } }),
      ...(startFrom && { startDate: { gte: new Date(startFrom) } }),
      ...(startTo && { startDate: { lte: new Date(startTo) } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          _count: {
            select: { registrations: true },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // Lấy chi tiết campaign
  async getCampaignDetail(campaignId: string, organizationId?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        organization: {
          select: {
            id: true,
            email: true,
            organizationProfiles: {
              select: {
                organizationName: true,
                avatarUrl: true,
                district: true,
                addressDetail: true,
              },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    // Nếu có organizationId, kiểm tra quyền sở hữu
    if (organizationId && campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xem campaign này');
    }

    return campaign;
  }

  // Cập nhật campaign
  async updateCampaign(
    campaignId: string,
    organizationId: string,
    dto: UpdateCampaignDto,
    coverImageFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
  ) {
    await this.getOrgOrThrow(organizationId);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền sửa campaign này');
    }

    // Không cho phép sửa campaign nếu đang diễn ra hoặc đã hoàn thành
    if (
      campaign.status === CampaignStatus.ONGOING ||
      campaign.status === CampaignStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Không thể sửa campaign đang diễn ra hoặc đã hoàn thành',
      );
    }

    // Validate nếu có cập nhật số lượng
    if (dto.maxVolunteers && dto.targetVolunteers) {
      if (dto.maxVolunteers < dto.targetVolunteers) {
        throw new BadRequestException(
          'Số lượng tối đa phải lớn hơn hoặc bằng số lượng mục tiêu',
        );
      }
    }

    // Validate dates nếu có cập nhật
    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) > new Date(dto.endDate)) {
        throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc');
      }
    }

    // Upload ảnh mới nếu có
    let coverImageUrl: string | undefined;
    let imageUrls: string[] | undefined;

    if (coverImageFile) {
      coverImageUrl = await this.cloudinary.uploadFile(coverImageFile);
    }

    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await this.cloudinary.uploadFiles(imageFiles);
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.goal !== undefined && { goal: dto.goal }),
        ...(dto.district && { district: dto.district }),
        ...(dto.addressDetail && { addressDetail: dto.addressDetail }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
        ...(imageUrls && { images: imageUrls }),
        ...(dto.targetVolunteers !== undefined && {
          targetVolunteers: dto.targetVolunteers,
        }),
        ...(dto.maxVolunteers !== undefined && {
          maxVolunteers: dto.maxVolunteers,
        }),
      },
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
  }

  // Lấy danh sách TNV đã đăng ký campaign
  async getCampaignRegistrations(
    campaignId: string,
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    await this.getOrgOrThrow(organizationId);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xem campaign này');
    }

    const [data, total] = await Promise.all([
      this.prisma.campaignRegistration.findMany({
        where: { campaignId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { registeredAt: 'desc' },
        include: {
          volunteer: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              volunteerProfile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  skills: true,
                  experienceYears: true,
                  preferredDistricts: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.campaignRegistration.count({ where: { campaignId } }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // === API CHO TÌNH NGUYỆN VIÊN ===

  // Lấy tất cả campaign, ưu tiên campaign cùng quận lên đầu
  // Loại trừ những campaign mà volunteer đã đăng ký
  async getRecommendedCampaigns(volunteerId: string) {
    // Lấy thông tin TNV
    const volunteer = await this.prisma.volunteerProfile.findUnique({
      where: { userId: volunteerId },
      select: { preferredDistricts: true },
    });

    if (!volunteer) {
      throw new NotFoundException('Không tìm thấy profile tình nguyện viên');
    }

    const { preferredDistricts } = volunteer;

    // Lấy danh sách ID các campaign mà volunteer đã đăng ký
    const registeredCampaigns = await this.prisma.campaignRegistration.findMany({
      where: {
        volunteerId,
        status: {
          in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED],
        },
      },
      select: { campaignId: true },
    });

    const registeredCampaignIds = registeredCampaigns.map((r) => r.campaignId);

    // Lấy TẤT CẢ campaign có status APPROVED, LOẠI TRỪ những campaign đã đăng ký
    const allCampaigns = (await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.APPROVED, // Chỉ hiển thị campaign đã được duyệt
        id: {
          notIn: registeredCampaignIds, // Loại trừ campaign đã đăng ký
        },
      },
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
        _count: {
          select: { registrations: true },
        },
      },
    })) as any[];

    // Sắp xếp:
    // 1. Campaign cùng quận (preferredDistricts) lên đầu
    // 2. Trong cùng nhóm (cùng quận hoặc khác quận), sắp xếp theo startDate tăng dần
    const sorted = allCampaigns.sort((a: any, b: any) => {
      const aMatch = preferredDistricts.includes(a.district);
      const bMatch = preferredDistricts.includes(b.district);

      // Ưu tiên campaign cùng quận
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      // Nếu cùng nhóm (cả 2 cùng quận hoặc cả 2 khác quận), sắp xếp theo startDate
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return sorted;
  }

  // Tìm kiếm campaign theo từ khóa
  // Loại trừ những campaign mà volunteer đã đăng ký
  async searchCampaigns(volunteerId: string, dto: SearchCampaignDto) {
    // Kiểm tra TNV có tồn tại không
    const volunteer = await this.prisma.volunteerProfile.findUnique({
      where: { userId: volunteerId },
      select: { preferredDistricts: true },
    });

    if (!volunteer) {
      throw new NotFoundException('Không tìm thấy profile tình nguyện viên');
    }

    const { preferredDistricts } = volunteer;
    const { search } = dto;

    // Lấy danh sách ID các campaign mà volunteer đã đăng ký
    const registeredCampaigns = await this.prisma.campaignRegistration.findMany({
      where: {
        volunteerId,
        status: {
          in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED],
        },
      },
      select: { campaignId: true },
    });

    const registeredCampaignIds = registeredCampaigns.map((r) => r.campaignId);

    // Build where condition
    const where: any = {
      status: CampaignStatus.APPROVED,
      id: {
        notIn: registeredCampaignIds, // Loại trừ campaign đã đăng ký
      },
    };

    // Nếu có từ khóa tìm kiếm, tìm trong title và description
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const allCampaigns = (await this.prisma.campaign.findMany({
      where,
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
        _count: {
          select: { registrations: true },
        },
      },
    })) as any[];

    // Sắp xếp: ưu tiên campaign cùng quận lên đầu
    const sorted = allCampaigns.sort((a: any, b: any) => {
      const aMatch = preferredDistricts.includes(a.district);
      const bMatch = preferredDistricts.includes(b.district);

      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;

      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return sorted;
  }

  // TNV đăng ký tham gia campaign
  async registerCampaign(
    volunteerId: string,
    campaignId: string,
    dto: RegisterCampaignDto,
  ) {
    // Kiểm tra TNV có tồn tại không
    const volunteer = await this.prisma.user.findUnique({
      where: { id: volunteerId },
      include: { volunteerProfile: true },
    });

    if (!volunteer || volunteer.role !== Role.VOLUNTEER) {
      throw new ForbiddenException('Chỉ tình nguyện viên mới có quyền này');
    }

    // Kiểm tra campaign có tồn tại không
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    // TODO: Kiểm tra status sau khi có logic duyệt
    // if (campaign.status !== CampaignStatus.APPROVED) {
    //   throw new BadRequestException('Campaign này chưa được duyệt');
    // }

    // Use transaction to prevent race condition
    const registration = await this.prisma.$transaction(async (tx) => {
      // Kiểm tra đã đăng ký chưa
      const existing = await tx.campaignRegistration.findUnique({
        where: {
          campaignId_volunteerId: {
            campaignId,
            volunteerId,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Bạn đã đăng ký campaign này rồi');
      }

      // Get fresh campaign data with lock
      const campaignInTx = await tx.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaignInTx) {
        throw new NotFoundException('Không tìm thấy campaign');
      }

      // Kiểm tra campaign phải có status APPROVED hoặc ONGOING
      if (campaignInTx.status !== CampaignStatus.APPROVED && campaignInTx.status !== CampaignStatus.ONGOING) {
        throw new BadRequestException('Campaign này chưa được duyệt hoặc đã kết thúc');
      }

      // KHÔNG cho đăng ký khi đã quá startDate
      const now = new Date();
      if (now >= campaignInTx.startDate) {
        throw new BadRequestException('Không thể đăng ký sau khi campaign đã bắt đầu');
      }

      // Kiểm tra còn chỗ không (inside transaction to avoid race condition)
      if (campaignInTx.currentVolunteers >= campaignInTx.maxVolunteers) {
        throw new BadRequestException(
          'Campaign đã đủ số lượng tình nguyện viên',
        );
      }

      // Tạo registration
      const newRegistration = await tx.campaignRegistration.create({
        data: {
          campaignId,
          volunteerId,
          status: RegistrationStatus.REGISTERED,
          notes: dto.notes,
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              district: true,
            },
          },
        },
      });

      // Cập nhật currentVolunteers
      await tx.campaign.update({
        where: { id: campaignId },
        data: { currentVolunteers: { increment: 1 } },
      });

      return newRegistration;
    });

    return registration;
  }

  // TNV hủy đăng ký campaign
  async cancelRegistration(volunteerId: string, campaignId: string) {
    const registration = await this.prisma.campaignRegistration.findUnique({
      where: {
        campaignId_volunteerId: {
          campaignId,
          volunteerId,
        },
      },
      include: { campaign: true },
    });

    if (!registration) {
      throw new NotFoundException('Bạn chưa đăng ký campaign này');
    }

    // CHỈ cho phép hủy TRƯỚC khi campaign bắt đầu
    const now = new Date();
    if (now >= registration.campaign.startDate) {
      throw new BadRequestException(
        'Không thể hủy đăng ký sau khi campaign đã bắt đầu',
      );
    }

    // Xóa registration và giảm currentVolunteers
    await this.prisma.$transaction([
      this.prisma.campaignRegistration.delete({
        where: {
          campaignId_volunteerId: {
            campaignId,
            volunteerId,
          },
        },
      }),
      this.prisma.campaign.update({
        where: { id: campaignId },
        data: { currentVolunteers: { decrement: 1 } },
      }),
    ]);

    return { message: 'Đã hủy đăng ký campaign thành công' };
  }

  // Lấy danh sách campaign TNV đã đăng ký
  async getMyRegistrations(volunteerId: string) {
    const registrations = await this.prisma.campaignRegistration.findMany({
      where: { volunteerId },
      orderBy: { registeredAt: 'desc' },
      include: {
        campaign: {
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
        },
      },
    });

    return registrations;
  }

  // [TCXH] Cập nhật trạng thái registration (ATTENDED để cộng điểm)
  async updateRegistrationStatus(
    organizationId: string,
    registrationId: string,
    status: RegistrationStatus,
  ) {
    const registration = await this.prisma.campaignRegistration.findUnique({
      where: { id: registrationId },
      include: { campaign: true },
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đăng ký này');
    }

    if (registration.campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đăng ký này');
    }

    const updated = await this.prisma.campaignRegistration.update({
      where: { id: registrationId },
      data: { status },
    });

    // Tự động cộng +10 điểm khi TNV tham gia campaign (status = ATTENDED)
    if (status === RegistrationStatus.ATTENDED) {
      await PointsHelper.addPointsForCampaign(
        this.prisma,
        registration.volunteerId,
        registration.campaignId,
      );
    }

    return updated;
  }

  // Helper: Tự động chuyển campaign status theo thời gian
  async autoTransitionCampaigns() {
    const now = new Date();
    let totalUpdated = 0;
    const results: any = {};

    // 1. Chuyển APPROVED -> ONGOING khi startDate đến
    const campaignsToStart = await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.APPROVED,
        startDate: { lte: now },
      },
    });

    if (campaignsToStart.length > 0) {
      await this.prisma.campaign.updateMany({
        where: {
          id: { in: campaignsToStart.map((c) => c.id) },
        },
        data: { status: CampaignStatus.ONGOING },
      });
      totalUpdated += campaignsToStart.length;
      results.started = {
        count: campaignsToStart.length,
        campaignIds: campaignsToStart.map((c) => c.id),
      };
    }

    // 2. Chuyển ONGOING -> COMPLETED khi endDate qua và chưa có proofImages
    const campaignsToComplete = await this.prisma.campaign.findMany({
      where: {
        status: CampaignStatus.ONGOING,
        endDate: { not: null, lte: now },
      },
    });

    if (campaignsToComplete.length > 0) {
      await this.prisma.campaign.updateMany({
        where: {
          id: { in: campaignsToComplete.map((c) => c.id) },
        },
        data: { status: CampaignStatus.COMPLETED },
      });
      totalUpdated += campaignsToComplete.length;
      results.completed = {
        count: campaignsToComplete.length,
        campaignIds: campaignsToComplete.map((c) => c.id),
      };
    }

    if (totalUpdated === 0) {
      return { message: 'Không có campaign nào cần chuyển trạng thái', count: 0 };
    }

    return {
      message: `Đã cập nhật ${totalUpdated} campaigns`,
      totalUpdated,
      details: results,
    };
  }

  // [TCXH] Upload hình ảnh minh chứng hoàn thành campaign - tự động cộng điểm cho tất cả TNV
  async completeCampaign(
    campaignId: string,
    organizationId: string,
    proofImageFiles?: Express.Multer.File[],
  ) {
    await this.getOrgOrThrow(organizationId);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        registrations: {
          where: {
            status: {
              in: [RegistrationStatus.REGISTERED, RegistrationStatus.ATTENDED],
            },
          },
          select: {
            volunteerId: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật campaign này');
    }

    if (!proofImageFiles || proofImageFiles.length === 0) {
      throw new BadRequestException('Vui lòng upload ít nhất 1 ảnh minh chứng');
    }

    // Upload ảnh minh chứng lên Cloudinary
    const proofImageUrls = await this.cloudinary.uploadFiles(proofImageFiles);

    // Cập nhật campaign: thêm proofImages, doneAt, và status = COMPLETED
    const updatedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        proofImages: proofImageUrls,
        doneAt: new Date(),
        status: CampaignStatus.COMPLETED,
      },
    });

    // Cộng điểm cho TẤT CẢ tình nguyện viên đã tham gia (REGISTERED hoặc ATTENDED)
    const pointPromises = campaign.registrations.map((reg) =>
      PointsHelper.addPointsForCampaign(
        this.prisma,
        reg.volunteerId,
        campaignId,
      ),
    );

    await Promise.all(pointPromises);

    return {
      message: `Đã hoàn thành campaign và cộng điểm cho ${campaign.registrations.length} tình nguyện viên`,
      campaign: updatedCampaign,
      volunteersAwarded: campaign.registrations.length,
    };
  }

  // [TCXH] Xóa campaign (chỉ được phép nếu chưa có TNV nào đăng ký)
  async deleteCampaign(campaignId: string, organizationId: string) {
    await this.getOrgOrThrow(organizationId);

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Không tìm thấy campaign');
    }

    if (campaign.organizationId !== organizationId) {
      throw new ForbiddenException('Bạn không có quyền xóa campaign này');
    }

    // Kiểm tra xem có TNV nào đã đăng ký chưa
    if (campaign._count.registrations > 0) {
      throw new BadRequestException(
        'Không thể xóa campaign đã có tình nguyện viên đăng ký',
      );
    }

    // Xóa campaign
    await this.prisma.campaign.delete({
      where: { id: campaignId },
    });

    return { message: 'Xóa campaign thành công' };
  }
}
