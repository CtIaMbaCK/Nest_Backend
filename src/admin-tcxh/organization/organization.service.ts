import {
  BadRequestException,
  ConflictException,
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
import {
  UpdateVolunteerProfileDto,
  UpdateBeneficiaryProfileDto,
} from './dto/update-member.dto';
import {
  CreateAccountVolunteerDto,
  CreateAccountBeneficiaryDto,
} from './dto/create-account.dto';
import { Prisma } from 'src/generated/prisma/client';
import { helpHashPassword } from 'src/helpers/utils';

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
    const { search, status, page = 1, limit = 10 } = dto;

    const where: Prisma.BficiaryProfileWhereInput = {
      organizationId: orgId,
      // Nếu có status thì filter, không thì lấy APPROVED (mặc định)
      organizationStatus: status || 'APPROVED',
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [profiles, total] = await Promise.all([
      this.prisma.bficiaryProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.bficiaryProfile.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const data = profiles.map((profile) => ({
      id: profile.user.id,
      email: profile.user.email,
      status: profile.organizationStatus, // Sửa: dùng organizationStatus thay vì user.status
      createdAt: profile.user.createdAt,
      bficiaryProfile: {
        fullName: profile.fullName,
        phone: profile.user.phoneNumber,
        email: profile.user.email,
        avatarUrl: profile.avatarUrl,
        vulnerabilityType: profile.vulnerabilityType,
      },
    }));

    const totalPages = Math.ceil(total / limit);
    return { data, meta: { total, page, limit, totalPages } };
  }

  // lay tnv trong to chuc
  async getVolunteers(orgId: string, dto: GetVolunteersDto) {
    await this.getOrgOrThrow(orgId);
    const { search, status, districts, page = 1, limit = 10 } = dto;

    const where: Prisma.VolunteerProfileWhereInput = {
      organizationId: orgId,
      // Nếu có status thì filter, không thì lấy APPROVED (mặc định)
      organizationStatus: status || 'APPROVED',
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

    const [profiles, total] = await Promise.all([
      this.prisma.volunteerProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.volunteerProfile.count({ where }),
    ]);

    // Transform data to match frontend expectations
    const data = profiles.map((profile) => ({
      id: profile.user.id,
      email: profile.user.email,
      status: profile.organizationStatus, // Sửa: dùng organizationStatus thay vì user.status
      createdAt: profile.user.createdAt,
      volunteerProfile: {
        fullName: profile.fullName,
        phone: profile.user.phoneNumber,
        email: profile.user.email,
        avatarUrl: profile.avatarUrl,
        points: profile.points,
        skills: profile.skills,
        district: profile.preferredDistricts?.[0],
      },
    }));

    const totalPages = Math.ceil(total / limit);
    return { data, meta: { total, page, limit, totalPages } };
  }

  // lay chi tiet tung cas nhan
  async getMemberDetail(organizationId: string, userId: string) {
    await this.getOrgOrThrow(organizationId);

    // Tìm trong cả 2 bảng TNV và NCGD
    const [volunteer, beneficiary] = await Promise.all([
      this.prisma.volunteerProfile.findFirst({
        where: { userId: userId, organizationId: organizationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.bficiaryProfile.findFirst({
        where: { userId: userId, organizationId: organizationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    if (!volunteer && !beneficiary) {
      throw new NotFoundException(
        'Không tìm thấy thành viên này trong tổ chức',
      );
    }

    // Transform data to match frontend expectations
    if (volunteer) {
      return {
        id: volunteer.user.id,
        email: volunteer.user.email,
        status: volunteer.user.status,
        createdAt: volunteer.user.createdAt,
        volunteerProfile: {
          fullName: volunteer.fullName,
          phone: volunteer.user.phoneNumber,
          email: volunteer.user.email,
          avatarUrl: volunteer.avatarUrl,
          points: volunteer.points,
          skills: volunteer.skills,
          experienceYears: volunteer.experienceYears,
          bio: volunteer.bio,
          preferredDistricts: volunteer.preferredDistricts,
          cccdFrontFile: volunteer.cccdFrontFile,
          cccdBackFile: volunteer.cccdBackFile,
        },
      };
    }

    // Beneficiary (guaranteed to exist at this point)
    if (beneficiary) {
      return {
        id: beneficiary.user.id,
        email: beneficiary.user.email,
        status: beneficiary.user.status,
        createdAt: beneficiary.user.createdAt,
        bficiaryProfile: {
          fullName: beneficiary.fullName,
          phone: beneficiary.user.phoneNumber,
          email: beneficiary.user.email,
          avatarUrl: beneficiary.avatarUrl,
          vulnerabilityType: beneficiary.vulnerabilityType,
          situationDescription: beneficiary.situationDescription,
          healthCondition: beneficiary.healthCondition,
          guardianName: beneficiary.guardianName,
          guardianPhone: beneficiary.guardianPhone,
          guardianRelation: beneficiary.guardianRelation,
          cccdFrontFile: beneficiary.cccdFrontFile,
          cccdBackFile: beneficiary.cccdBackFile,
        },
      };
    }

    // This should never happen due to the check above, but TypeScript needs it
    throw new NotFoundException(
      'Không tìm thấy thành viên này trong tổ chức',
    );
  }

  /**
   * Cập nhật trạng thái thành viên
   */
  async updateMemberStatus(
    organizationId: string,
    userId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) {
    // Verify organization
    await this.getOrgOrThrow(organizationId);

    // Kiểm tra member có thuộc organization không
    const [volunteer, beneficiary] = await Promise.all([
      this.prisma.volunteerProfile.findFirst({
        where: { userId, organizationId },
      }),
      this.prisma.bficiaryProfile.findFirst({
        where: { userId, organizationId },
      }),
    ]);

    if (!volunteer && !beneficiary) {
      throw new NotFoundException(
        'Không tìm thấy thành viên này trong tổ chức',
      );
    }

    // Cập nhật organizationStatus trong profile (KHÔNG phải user.status)
    if (volunteer) {
      await this.prisma.volunteerProfile.update({
        where: { userId },
        data: {
          organizationStatus: status,
          // Nếu APPROVED thì set joinedOrganizationAt, còn không thì null
          joinedOrganizationAt: status === 'APPROVED' ? new Date() : null,
        },
      });
    }

    if (beneficiary) {
      await this.prisma.bficiaryProfile.update({
        where: { userId },
        data: {
          organizationStatus: status,
          // Nếu APPROVED thì set joinedOrganizationAt, còn không thì null
          joinedOrganizationAt: status === 'APPROVED' ? new Date() : null,
        },
      });
    }

    return { success: true, message: 'Đã cập nhật trạng thái' };
  }

  /**
   * Cập nhật thông tin Volunteer Profile
   */
  async updateVolunteerProfile(
    organizationId: string,
    userId: string,
    dto: UpdateVolunteerProfileDto,
  ) {
    // Verify organization
    await this.getOrgOrThrow(organizationId);

    // Kiểm tra volunteer có thuộc organization không
    const volunteer = await this.prisma.volunteerProfile.findFirst({
      where: { userId, organizationId },
      include: { user: true },
    });

    if (!volunteer) {
      throw new NotFoundException(
        'Không tìm thấy tình nguyện viên này trong tổ chức',
      );
    }

    // Cập nhật VolunteerProfile
    const updatedProfile = await this.prisma.volunteerProfile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        skills: dto.skills,
        experienceYears: dto.experienceYears,
        bio: dto.bio,
        preferredDistricts: dto.preferredDistricts,
        cccdFrontFile: dto.cccdFrontFile,
        cccdBackFile: dto.cccdBackFile,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      id: updatedProfile.user.id,
      email: updatedProfile.user.email,
      status: updatedProfile.user.status,
      createdAt: updatedProfile.user.createdAt,
      volunteerProfile: {
        fullName: updatedProfile.fullName,
        phone: updatedProfile.user.phoneNumber,
        email: updatedProfile.user.email,
        avatarUrl: updatedProfile.avatarUrl,
        points: updatedProfile.points,
        skills: updatedProfile.skills,
        experienceYears: updatedProfile.experienceYears,
        bio: updatedProfile.bio,
        preferredDistricts: updatedProfile.preferredDistricts,
        cccdFrontFile: updatedProfile.cccdFrontFile,
        cccdBackFile: updatedProfile.cccdBackFile,
      },
    };
  }

  /**
   * Cập nhật thông tin Beneficiary Profile
   */
  async updateBeneficiaryProfile(
    organizationId: string,
    userId: string,
    dto: UpdateBeneficiaryProfileDto,
  ) {
    // Verify organization
    await this.getOrgOrThrow(organizationId);

    // Kiểm tra beneficiary có thuộc organization không
    const beneficiary = await this.prisma.bficiaryProfile.findFirst({
      where: { userId, organizationId },
      include: { user: true },
    });

    if (!beneficiary) {
      throw new NotFoundException(
        'Không tìm thấy người cần giúp đỡ này trong tổ chức',
      );
    }

    // Cập nhật BficiaryProfile
    const updatedProfile = await this.prisma.bficiaryProfile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        vulnerabilityType: dto.vulnerabilityType,
        situationDescription: dto.situationDescription,
        healthCondition: dto.healthCondition,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        guardianRelation: dto.guardianRelation,
        cccdFrontFile: dto.cccdFrontFile,
        cccdBackFile: dto.cccdBackFile,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      id: updatedProfile.user.id,
      email: updatedProfile.user.email,
      status: updatedProfile.user.status,
      createdAt: updatedProfile.user.createdAt,
      bficiaryProfile: {
        fullName: updatedProfile.fullName,
        phone: updatedProfile.user.phoneNumber,
        email: updatedProfile.user.email,
        avatarUrl: updatedProfile.avatarUrl,
        vulnerabilityType: updatedProfile.vulnerabilityType,
        situationDescription: updatedProfile.situationDescription,
        healthCondition: updatedProfile.healthCondition,
        guardianName: updatedProfile.guardianName,
        guardianPhone: updatedProfile.guardianPhone,
        guardianRelation: updatedProfile.guardianRelation,
        cccdFrontFile: updatedProfile.cccdFrontFile,
        cccdBackFile: updatedProfile.cccdBackFile,
      },
    };
  }

  /**
   * Tạo tài khoản Tình nguyện viên bởi TCXH
   */
  async createVolunteerAccount(
    organizationId: string,
    dto: CreateAccountVolunteerDto,
  ) {
    // Verify organization
    await this.getOrgOrThrow(organizationId);

    // Kiểm tra email và phoneNumber đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email hoặc số điện thoại đã được sử dụng',
      );
    }

    // Hash password
    const passwordHash = await helpHashPassword(dto.password);

    // Tạo User và VolunteerProfile trong một transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Tạo User
      const newUser = await prisma.user.create({
        data: {
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          passwordHash: passwordHash,
          role: Role.VOLUNTEER,
          status: 'ACTIVE', // Set status = ACTIVE khi tạo
        },
      });

      // Tạo VolunteerProfile và gán vào tổ chức
      const volunteerProfile = await prisma.volunteerProfile.create({
        data: {
          userId: newUser.id,
          fullName: dto.fullName,
          avatarUrl: dto.avatarUrl,
          cccdFrontFile: dto.cccdFrontFile,
          cccdBackFile: dto.cccdBackFile,
          skills: dto.skills,
          experienceYears: dto.experienceYears,
          bio: dto.bio,
          preferredDistricts: dto.preferredDistricts,
          organizationId: organizationId, // Gán vào tổ chức
          organizationStatus: 'APPROVED', // Set status = APPROVED
          joinedOrganizationAt: new Date(), // Set ngày gia nhập
        },
      });

      return { newUser, volunteerProfile };
    });

    // Return data theo format frontend expectations
    return {
      id: result.newUser.id,
      email: result.newUser.email,
      status: result.newUser.status,
      createdAt: result.newUser.createdAt,
      volunteerProfile: {
        fullName: result.volunteerProfile.fullName,
        phone: result.newUser.phoneNumber,
        email: result.newUser.email,
        avatarUrl: result.volunteerProfile.avatarUrl,
        points: result.volunteerProfile.points,
        skills: result.volunteerProfile.skills,
        experienceYears: result.volunteerProfile.experienceYears,
        bio: result.volunteerProfile.bio,
        preferredDistricts: result.volunteerProfile.preferredDistricts,
        cccdFrontFile: result.volunteerProfile.cccdFrontFile,
        cccdBackFile: result.volunteerProfile.cccdBackFile,
      },
    };
  }

  /**
   * Tạo tài khoản Người cần giúp đỡ bởi TCXH
   */
  async createBeneficiaryAccount(
    organizationId: string,
    dto: CreateAccountBeneficiaryDto,
  ) {
    // Verify organization
    await this.getOrgOrThrow(organizationId);

    // Kiểm tra email và phoneNumber đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email hoặc số điện thoại đã được sử dụng',
      );
    }

    // Hash password
    const passwordHash = await helpHashPassword(dto.password);

    // Tạo User và BficiaryProfile trong một transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Tạo User
      const newUser = await prisma.user.create({
        data: {
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          passwordHash: passwordHash,
          role: Role.BENEFICIARY,
          status: 'ACTIVE', // Set status = ACTIVE khi tạo
        },
      });

      // Tạo BficiaryProfile và gán vào tổ chức
      const beneficiaryProfile = await prisma.bficiaryProfile.create({
        data: {
          userId: newUser.id,
          fullName: dto.fullName,
          avatarUrl: dto.avatarUrl,
          cccdFrontFile: dto.cccdFrontFile,
          cccdBackFile: dto.cccdBackFile,
          vulnerabilityType: dto.vulnerabilityType,
          situationDescription: dto.situationDescription,
          healthCondition: dto.healthCondition,
          guardianName: dto.guardianName,
          guardianPhone: dto.guardianPhone,
          guardianRelation: dto.guardianRelation,
          organizationId: organizationId, // Gán vào tổ chức
          organizationStatus: 'APPROVED', // Set status = APPROVED
          joinedOrganizationAt: new Date(), // Set ngày gia nhập
        },
      });

      return { newUser, beneficiaryProfile };
    });

    // Return data theo format frontend expectations
    return {
      id: result.newUser.id,
      email: result.newUser.email,
      status: result.newUser.status,
      createdAt: result.newUser.createdAt,
      bficiaryProfile: {
        fullName: result.beneficiaryProfile.fullName,
        phone: result.newUser.phoneNumber,
        email: result.newUser.email,
        avatarUrl: result.beneficiaryProfile.avatarUrl,
        vulnerabilityType: result.beneficiaryProfile.vulnerabilityType,
        situationDescription: result.beneficiaryProfile.situationDescription,
        healthCondition: result.beneficiaryProfile.healthCondition,
        guardianName: result.beneficiaryProfile.guardianName,
        guardianPhone: result.beneficiaryProfile.guardianPhone,
        guardianRelation: result.beneficiaryProfile.guardianRelation,
        cccdFrontFile: result.beneficiaryProfile.cccdFrontFile,
        cccdBackFile: result.beneficiaryProfile.cccdBackFile,
      },
    };
  }
}
