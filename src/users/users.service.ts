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
} from './dto/create-user.dto';
import { Role } from 'src/generated/prisma/enums';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
// import { helpHashPassword } from 'src/helpers/utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

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

    // 2. Upload ảnh lẻ
    const avatarUrl = files.avatarUrl?.[0]
      ? await this.cloudinary.uploadFile(files.avatarUrl[0])
      : undefined;

    const cccdFront = files.cccdFront?.[0]
      ? await this.cloudinary.uploadFile(files.cccdFront[0])
      : undefined;

    const cccdBack = files.cccdBack?.[0]
      ? await this.cloudinary.uploadFile(files.cccdBack[0])
      : undefined;

    // 3. Upload mảng ảnh minh chứng
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

  // update thong tin nguoi can giup do
  async updateBenificiaryProfile(
    userId: string,
    dto: UpdateBficiaryProfileDto,
  ) {
    const profileBene = await this.prisma.bficiaryProfile.findUnique({
      where: { userId: userId },
    });

    if (!profileBene) {
      throw new NotFoundException('Hồ sơ người cần giúp không tồn tại');
    }

    return this.prisma.bficiaryProfile.update({
      where: { userId: userId },
      data: { ...dto },
    });
  }

  async updateVolunteerProfile(userId: string, dto: UpdateVolunteerProfileDto) {
    const profileVol = await this.prisma.volunteerProfile.findUnique({
      where: { userId: userId },
    });

    if (!profileVol) {
      throw new NotFoundException('Hồ sơ tình nguyện viên không tồn tại');
    }

    return this.prisma.volunteerProfile.update({
      where: { userId: userId },
      data: { ...dto },
    });
  }
}
