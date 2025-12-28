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
// import { helpHashPassword } from 'src/helpers/utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createVolunteerProfile(userId: string, dto: CreateVolunteerProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.role !== Role.VOLUNTEER) {
      throw new ForbiddenException(
        'Lỗi: Tài khoản của bạn không phải là Tình nguyện viên!',
      );
    }
    return this.prisma.volunteerProfile.upsert({
      where: { userId: userId },
      update: { ...dto },
      create: { userId, ...dto },
    });
  }

  async createBenificiaryProfile(
    userId: string,
    dto: CreateBficiaryProfileDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.role !== Role.BENEFICIARY) {
      throw new ForbiddenException(
        'Lỗi: Tài khoản của bạn không phải là Người cần giúp đỡ!',
      );
    }
    return this.prisma.bficiaryProfile.upsert({
      where: { userId: userId },
      update: { ...dto },
      create: { userId, ...dto },
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
