import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateBficiaryProfileDto,
  CreateVolunteerProfileDto,
  UpdateBficiaryProfileDto,
  UpdateVolunteerProfileDto,
  UpdateOrganizationProfileDto,
} from './dto/create-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateOrganizationDto } from 'src/admin-tcxh/organization/dto/create-organization.dto';
// import { helpHashPassword } from 'src/helpers/utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Helper function để loại bỏ undefined fields khỏi object
  private cleanUndefinedFields<T extends Record<string, any>>(
    obj: T,
  ): Partial<T> {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  // get all
  getUsers() {
    return this.prisma.user.findMany();
  }

  // tim kiem 1 user
  getUser(id: string): Promise<any> {
    try {
      return this.prisma.user.findFirst({
        where: { id: String(id) },
      });
    } catch (error) {
      throw new Error('Lỗi xảy ra', { cause: error });
    }
  }

  async getMyProfile(userId: string) {
    // console.log('userId:', userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,

        volunteerProfile: true,
        bficiaryProfile: true,
        organizationProfiles: true,
      },
    });

    // console.log('user', JSON.stringify(user, null, 2));
    // console.log('tcxh:', user?.organizationProfiles);

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createVolunteerProfile(
    userId: string,
    dto: CreateVolunteerProfileDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.role !== Role.VOLUNTEER) {
      throw new ForbiddenException(
        'Lỗi: Tài khoản của bạn không phải là Tình nguyện viên!',
      );
    }

    const avatarUrl = files.avatarUrl?.[0]
      ? await this.cloudinary.uploadFile(files.avatarUrl[0])
      : undefined;
    const cccdFront = files.cccdFront?.[0]
      ? await this.cloudinary.uploadFile(files.cccdFront[0])
      : undefined;
    const cccdBack = files.cccdBack?.[0]
      ? await this.cloudinary.uploadFile(files.cccdBack[0])
      : undefined;

    const profileData = {
      ...dto,
      ...(avatarUrl && { avatarUrl }),
      ...(cccdFront && { cccdFrontFile: cccdFront }),
      ...(cccdBack && { cccdBackFile: cccdBack }),
    };

    return this.prisma.volunteerProfile.upsert({
      where: { userId: userId },
      update: profileData,
      create: { userId, ...profileData },
    });
  }

  async createBenificiaryProfile(
    userId: string,
    dto: CreateBficiaryProfileDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.role !== Role.BENEFICIARY) {
      throw new ForbiddenException(
        'Lỗi: Tài khoản của bạn không phải là Người cần giúp đỡ!',
      );
    }

    // hinh anh cccd
    const avatarUrl = files.avatarUrl?.[0]
      ? await this.cloudinary.uploadFile(files.avatarUrl[0])
      : undefined;

    const cccdFront = files.cccdFront?.[0]
      ? await this.cloudinary.uploadFile(files.cccdFront[0])
      : undefined;

    const cccdBack = files.cccdBack?.[0]
      ? await this.cloudinary.uploadFile(files.cccdBack[0])
      : undefined;

    // anh minh chung
    let proofUrls: string[] = [];
    if (files.proofFiles && files.proofFiles.length > 0) {
      proofUrls = await this.cloudinary.uploadFiles(files.proofFiles);
    }

    const profileData = {
      ...dto,
      ...(avatarUrl && { avatarUrl }),
      ...(cccdFront && { cccdFrontFile: cccdFront }),
      ...(cccdBack && { cccdBackFile: cccdBack }),
      ...(proofUrls.length > 0 && { proofFiles: proofUrls }),
    };

    return this.prisma.bficiaryProfile.upsert({
      where: { userId: userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  // tao tai khoan tcxh
  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      businessLicense?: Express.Multer.File[];
      verificationDocs?: Express.Multer.File[];
    },
  ) {
    const OrganizationUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!OrganizationUser)
      throw new NotFoundException('Người dùng không tồn tại');

    if (OrganizationUser.role !== Role.ORGANIZATION) {
      throw new ForbiddenException(
        'Lỗi: Tài khoản của bạn không phải là Tổ chức xã hội!',
      );
    }

    // xu ly hinh anh
    const avatarUrl = files.avatarUrl?.[0]
      ? await this.cloudinary.uploadFile(files.avatarUrl[0])
      : undefined;

    const businessLicense = files.businessLicense?.[0]
      ? await this.cloudinary.uploadFile(files.businessLicense[0])
      : undefined;

    let verificationDocs: string[] = [];
    if (files.verificationDocs && files.verificationDocs.length > 0) {
      verificationDocs = await this.cloudinary.uploadFiles(
        files.verificationDocs,
      );
    }

    const profileData = {
      ...dto,
      ...(avatarUrl && { avatarUrl }),
      ...(businessLicense && { businessLicense: businessLicense }),
      ...(verificationDocs.length > 0 && { verificationDocs }),
    };

    return this.prisma.organizationProfile.upsert({
      where: { userId: userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });
  }

  // update thong tin nguoi can giup do
  async updateBenificiaryProfile(
    userId: string,
    dto: UpdateBficiaryProfileDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
      proofFiles?: Express.Multer.File[];
    } = {},
  ) {
    // 1. Tìm hồ sơ hiện tại
    const profile = await this.prisma.bficiaryProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại');

    // Clean undefined fields trước khi destructure để tránh ghi đè null vào DB
    const cleanedDto = this.cleanUndefinedFields(dto);
    const { keepingProofFiles, ...prismaData } = cleanedDto;

    // 2. Xóa ảnh cũ trên Cloudinary trước khi upload ảnh mới
    const deletePromises: Promise<void>[] = [];

    // Xóa avatar cũ nếu có upload avatar mới
    if (files.avatarUrl?.[0] && profile.avatarUrl) {
      deletePromises.push(this.cloudinary.deleteFile(profile.avatarUrl));
    }

    // Xóa CCCD front cũ nếu có upload mới
    if (files.cccdFront?.[0] && profile.cccdFrontFile) {
      deletePromises.push(this.cloudinary.deleteFile(profile.cccdFrontFile));
    }

    // Xóa CCCD back cũ nếu có upload mới
    if (files.cccdBack?.[0] && profile.cccdBackFile) {
      deletePromises.push(this.cloudinary.deleteFile(profile.cccdBackFile));
    }

    // Xóa các proof files cũ nếu FE gửi keepingProofFiles (nghĩa là có thay đổi)
    if (keepingProofFiles !== undefined && profile.proofFiles.length > 0) {
      const keepingUrls = Array.isArray(keepingProofFiles)
        ? keepingProofFiles
        : [keepingProofFiles];

      // Tìm các URL cũ KHÔNG nằm trong keepingUrls → xóa chúng
      const urlsToDelete = profile.proofFiles.filter(
        (url) => !keepingUrls.includes(url),
      );

      if (urlsToDelete.length > 0) {
        deletePromises.push(this.cloudinary.deleteFiles(urlsToDelete));
      }
    }

    // Chạy tất cả delete operations song song
    await Promise.all(deletePromises);

    // 3. Upload ảnh mới (nếu có)
    const [newAvatar, newCccdFront, newCccdBack] = await Promise.all([
      files.avatarUrl?.[0]
        ? this.cloudinary.uploadFile(files.avatarUrl[0])
        : Promise.resolve(undefined),
      files.cccdFront?.[0]
        ? this.cloudinary.uploadFile(files.cccdFront[0])
        : Promise.resolve(undefined),
      files.cccdBack?.[0]
        ? this.cloudinary.uploadFile(files.cccdBack[0])
        : Promise.resolve(undefined),
    ]);

    // 4. Xử lý mảng ảnh minh chứng (Hợp nhất cũ và mới)
    let finalProofImages: string[] = profile.proofFiles; // Mặc định là mảng cũ trong DB

    // Nếu FE gửi danh sách ảnh cũ muốn giữ lại
    if (keepingProofFiles !== undefined) {
      finalProofImages = Array.isArray(keepingProofFiles)
        ? keepingProofFiles
        : [keepingProofFiles];
    }

    // Nếu có upload thêm ảnh minh chứng mới -> Đẩy thêm vào mảng
    if (files.proofFiles && files.proofFiles.length > 0) {
      const newProofUrls = await this.cloudinary.uploadFiles(files.proofFiles);
      finalProofImages = [...finalProofImages, ...newProofUrls];
    }

    // 5. Cập nhật vào Database
    return this.prisma.bficiaryProfile.update({
      where: { userId },
      data: {
        ...prismaData,
        ...(newAvatar && { avatarUrl: newAvatar }),
        ...(newCccdFront && { cccdFrontFile: newCccdFront }),
        ...(newCccdBack && { cccdBackFile: newCccdBack }),
        proofFiles: finalProofImages,
      },
    });
  }

  //cap nhat vlunteer
  async updateVolunteerProfile(
    userId: string,
    dto: UpdateVolunteerProfileDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      cccdFront?: Express.Multer.File[];
      cccdBack?: Express.Multer.File[];
    } = {},
  ) {
    const profileVol = await this.prisma.volunteerProfile.findUnique({
      where: { userId: userId },
    });

    if (!profileVol) {
      throw new NotFoundException('Hồ sơ tình nguyện viên không tồn tại');
    }

    // Clean undefined fields trước khi destructure để tránh ghi đè null vào DB
    const cleanedDto = this.cleanUndefinedFields(dto);
    const { experienceYears, ...prismaData } = cleanedDto;

    // Xóa ảnh cũ trên Cloudinary trước khi upload ảnh mới
    const deletePromises: Promise<void>[] = [];

    // Xóa avatar cũ nếu có upload avatar mới
    if (files.avatarUrl?.[0] && profileVol.avatarUrl) {
      deletePromises.push(this.cloudinary.deleteFile(profileVol.avatarUrl));
    }

    // Xóa CCCD front cũ nếu có upload mới
    if (files.cccdFront?.[0] && profileVol.cccdFrontFile) {
      deletePromises.push(this.cloudinary.deleteFile(profileVol.cccdFrontFile));
    }

    // Xóa CCCD back cũ nếu có upload mới
    if (files.cccdBack?.[0] && profileVol.cccdBackFile) {
      deletePromises.push(this.cloudinary.deleteFile(profileVol.cccdBackFile));
    }

    // Chạy tất cả delete operations song song
    await Promise.all(deletePromises);

    // Upload ảnh mới (nếu có)
    const avatarUrl = files.avatarUrl?.[0]
      ? await this.cloudinary.uploadFile(files.avatarUrl[0])
      : undefined;

    const cccdFront = files.cccdFront?.[0]
      ? await this.cloudinary.uploadFile(files.cccdFront[0])
      : undefined;

    const cccdBack = files.cccdBack?.[0]
      ? await this.cloudinary.uploadFile(files.cccdBack[0])
      : undefined;

    return this.prisma.volunteerProfile.update({
      where: { userId: userId },
      data: {
        ...prismaData,
        ...(experienceYears !== undefined && {
          experienceYears: Number(experienceYears),
        }),
        ...(avatarUrl && { avatarUrl: avatarUrl }),
        ...(cccdFront && { cccdFrontFile: cccdFront }),
        ...(cccdBack && { cccdBackFile: cccdBack }),
      },
    });
  }

  // update thong tin organization
  async updateOrganizationProfile(
    userId: string,
    dto: UpdateOrganizationProfileDto,
    files: {
      avatarUrl?: Express.Multer.File[];
      businessLicense?: Express.Multer.File[];
      verificationDocs?: Express.Multer.File[];
    } = {},
  ) {
    // 1. Tìm hồ sơ hiện tại
    const profile = await this.prisma.organizationProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Hồ sơ tổ chức không tồn tại');

    // Clean undefined fields
    const cleanedDto = this.cleanUndefinedFields(dto);
    const { keepingVerificationDocs, ...prismaData } = cleanedDto;

    // 2. Xóa ảnh cũ trên Cloudinary trước khi upload ảnh mới
    const deletePromises: Promise<void>[] = [];

    // Xóa avatar cũ nếu có upload avatar mới
    if (files.avatarUrl?.[0] && profile.avatarUrl) {
      deletePromises.push(this.cloudinary.deleteFile(profile.avatarUrl));
    }

    // Xóa business license cũ nếu có upload mới
    if (files.businessLicense?.[0] && profile.businessLicense) {
      deletePromises.push(this.cloudinary.deleteFile(profile.businessLicense));
    }

    // Xóa các verification docs cũ nếu FE gửi keepingVerificationDocs
    if (
      keepingVerificationDocs !== undefined &&
      profile.verificationDocs.length > 0
    ) {
      const keepingUrls = Array.isArray(keepingVerificationDocs)
        ? keepingVerificationDocs
        : [keepingVerificationDocs];

      // Tìm các URL cũ KHÔNG nằm trong keepingUrls → xóa chúng
      const urlsToDelete = profile.verificationDocs.filter(
        (url) => !keepingUrls.includes(url),
      );

      if (urlsToDelete.length > 0) {
        deletePromises.push(this.cloudinary.deleteFiles(urlsToDelete));
      }
    }

    // Chạy tất cả delete operations song song
    await Promise.all(deletePromises);

    // 3. Upload ảnh mới (nếu có)
    const [newAvatar, newBusinessLicense] = await Promise.all([
      files.avatarUrl?.[0]
        ? this.cloudinary.uploadFile(files.avatarUrl[0])
        : Promise.resolve(undefined),
      files.businessLicense?.[0]
        ? this.cloudinary.uploadFile(files.businessLicense[0])
        : Promise.resolve(undefined),
    ]);

    // 4. Xử lý mảng verification docs (Hợp nhất cũ và mới)
    let finalVerificationDocs: string[] = profile.verificationDocs;

    // Nếu FE gửi danh sách docs cũ muốn giữ lại
    if (keepingVerificationDocs !== undefined) {
      finalVerificationDocs = Array.isArray(keepingVerificationDocs)
        ? keepingVerificationDocs
        : [keepingVerificationDocs];
    }

    // Nếu có upload thêm docs mới -> Đẩy thêm vào mảng
    if (files.verificationDocs && files.verificationDocs.length > 0) {
      const newDocUrls = await this.cloudinary.uploadFiles(
        files.verificationDocs,
      );
      finalVerificationDocs = [...finalVerificationDocs, ...newDocUrls];
    }

    // 5. Cập nhật vào Database
    return this.prisma.organizationProfile.update({
      where: { userId },
      data: {
        ...prismaData,
        ...(newAvatar && { avatarUrl: newAvatar }),
        ...(newBusinessLicense && { businessLicense: newBusinessLicense }),
        verificationDocs: finalVerificationDocs,
      },
    });
  }
}
