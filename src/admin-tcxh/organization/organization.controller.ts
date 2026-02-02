import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
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
import { Role } from 'src/generated/prisma/enums';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@ApiBearerAuth('JWT-auth')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('join')
  @ApiOperation({ summary: 'Gửi yêu cầu gia nhập Tổ chức xã hội' })
  async requestToJoin(
    @GetUser('sub') userId: string,
    @GetUser('role') role: Role,
    @Body() dto: JoinOrganizationDto,
  ) {
    return this.organizationService.joinOrganization(userId, role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('leave')
  @ApiOperation({ summary: 'Rời khỏi TCXH' })
  async leaveOrg(@GetUser('sub') userId: string, @GetUser('role') role: Role) {
    return this.organizationService.leaveOrganization(userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('beneficiaries')
  @ApiOperation({ summary: 'Xem danh sách NCGD của tổ chức' })
  async listBeneficiaries(
    @GetUser('sub') orgId: string,
    @Query() dto: GetBeneficiariesDto,
  ) {
    return this.organizationService.getBeneficiaries(orgId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('volunteers')
  @ApiOperation({ summary: 'Xem danh sách TNV của tổ chức' })
  async listVolunteers(
    @GetUser('sub') orgId: string,
    @Query() dto: GetVolunteersDto,
  ) {
    return this.organizationService.getVolunteers(orgId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('member/:id')
  @ApiOperation({ summary: 'Xem chi tiết thông tin một thành viên' })
  async getDetail(
    @GetUser('sub') organizationId: string,
    @Param('id') userId: string,
  ) {
    return this.organizationService.getMemberDetail(organizationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('member/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái thành viên' })
  async updateStatus(
    @GetUser('sub') organizationId: string,
    @Param('id') userId: string,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) {
    return this.organizationService.updateMemberStatus(
      organizationId,
      userId,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('volunteer/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin tình nguyện viên' })
  async updateVolunteer(
    @GetUser('sub') organizationId: string,
    @Param('id') userId: string,
    @Body() dto: UpdateVolunteerProfileDto,
  ) {
    return this.organizationService.updateVolunteerProfile(
      organizationId,
      userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('beneficiary/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin người cần giúp đỡ' })
  async updateBeneficiary(
    @GetUser('sub') organizationId: string,
    @Param('id') userId: string,
    @Body() dto: UpdateBeneficiaryProfileDto,
  ) {
    return this.organizationService.updateBeneficiaryProfile(
      organizationId,
      userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-volunteer')
  @ApiOperation({ summary: 'Tạo tài khoản Tình nguyện viên bởi TCXH' })
  async createVolunteer(
    @GetUser('sub') organizationId: string,
    @Body() dto: CreateAccountVolunteerDto,
  ) {
    return this.organizationService.createVolunteerAccount(organizationId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-beneficiary')
  @ApiOperation({ summary: 'Tạo tài khoản Người cần giúp đỡ bởi TCXH' })
  async createBeneficiary(
    @GetUser('sub') organizationId: string,
    @Body() dto: CreateAccountBeneficiaryDto,
  ) {
    return this.organizationService.createBeneficiaryAccount(
      organizationId,
      dto,
    );
  }
}
