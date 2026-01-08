import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  GetBeneficiariesDto,
  GetVolunteersDto,
  JoinOrganizationDto,
} from './dto/join-organization.dto';
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
}
