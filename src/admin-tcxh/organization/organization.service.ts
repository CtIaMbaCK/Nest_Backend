import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/generated/prisma/enums';
import {
  GetBeneficiariesDto,
  GetVolunteersDto,
  JoinOrganizationDto,
} from './dto/join-organization.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrgOrThrow(userId: string) {
    const org = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: { organizationProfiles: true },
    });

    if (!org || org.role !== Role.ORGANIZATION) {
      throw new ForbiddenException('Chỉ tổ chức từ thiện mới có quyền này');
    }
    return org;
  }

  async joinOrganization(userId: string, role: Role, dto: JoinOrganizationDto) {
    const { organizationId } = dto;

    //
    const org = await this.prisma.user.findUnique({
      where: {
        id: organizationId,
        role: Role.ORGANIZATION,
      },
    });
    if (!org) throw new NotFoundException('Tổ chức xã hội không tồn tại');

    //
    if (role === Role.VOLUNTEER) {
      return this.prisma.volunteerProfile.update({
        where: { userId },
        data: {
          organizationId: organizationId,
          organizationStatus: 'APPROVED',
          joinedOrganizationAt: new Date(), //thay the null khi pending, newDate khi approve
        },
      });
    }

    if (role === Role.BENEFICIARY) {
      return this.prisma.bficiaryProfile.update({
        where: { userId },
        data: {
          organizationId: organizationId,
          organizationStatus: 'APPROVED',
          joinedOrganizationAt: new Date(), //thay the null khi pending, newDate khi approve
        },
      });
    }

    throw new BadRequestException(
      'Role của bạn không được phép thực hiện chức năng này',
    );
  }

  async leaveOrganization(userId: string, role: Role) {
    if (role === Role.VOLUNTEER) {
      return this.prisma.volunteerProfile.update({
        where: { userId },
        data: {
          organizationId: null,
          organizationStatus: null,
          joinedOrganizationAt: null,
        },
      });
    }

    if (role === Role.BENEFICIARY) {
      return this.prisma.bficiaryProfile.update({
        where: { userId },
        data: {
          organizationId: null,
          organizationStatus: null,
          joinedOrganizationAt: null,
        },
      });
    }

    throw new BadRequestException('Role không hợp lệ');
  }

  // lay ncgd trong to chuc
  async getBeneficiaries(orgId: string, dto: GetBeneficiariesDto) {
    await this.getOrgOrThrow(orgId);
    const { search, page = 1, limit = 10 } = dto;

    const where: Prisma.BficiaryProfileWhereInput = {
      organizationId: orgId,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.bficiaryProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { email: true, phoneNumber: true, status: true } },
        },
      }),
      this.prisma.bficiaryProfile.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // lay tnv trong to chuc
  async getVolunteers(orgId: string, dto: GetVolunteersDto) {
    await this.getOrgOrThrow(orgId);
    const { search, districts, page = 1, limit = 10 } = dto;

    const where: Prisma.VolunteerProfileWhereInput = {
      organizationId: orgId,
      ...(districts && {
        preferredDistricts: {
          hasSome: Array.isArray(districts) ? districts : [districts],
        },
      }),

      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.volunteerProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { email: true, phoneNumber: true, status: true } },
        },
      }),
      this.prisma.volunteerProfile.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  // lay chi tiet tung cas nhan
  async getMemberDetail(organizationId: string, userId: string) {
    await this.getOrgOrThrow(organizationId);

    // Tìm trong cả 2 bảng TNV và NCGD
    const [volunteer, beneficiary] = await Promise.all([
      this.prisma.volunteerProfile.findFirst({
        where: { userId: userId, organizationId: organizationId },
        include: { user: true },
      }),
      this.prisma.bficiaryProfile.findFirst({
        where: { userId: userId, organizationId: organizationId },
        include: { user: true },
      }),
    ]);

    const member = volunteer || beneficiary;
    if (!member)
      throw new NotFoundException(
        'Không tìm thấy thành viên này trong tổ chức',
      );

    return member;
  }
}
