import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
import { IssueAdminCertificateDto } from './dto/issue-admin-certificate.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@ApiTags('Admin - Quản lý chứng nhận TNV')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/certificates')
export class CertificatesController {
  constructor(
    private readonly service: CertificatesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ==================== ISSUE CERTIFICATES ====================

  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Admin] Cấp chứng nhận cho TNV (bất kỳ TNV nào)',
    description:
      'Admin có thể cấp chứng nhận cho bất kỳ TNV nào, kể cả TNV không nằm trong tổ chức xã hội. Sử dụng mẫu chứng nhận mặc định của hệ thống.',
  })
  @ApiResponse({ status: 201, description: 'Cấp chứng nhận thành công' })
  async issueCertificate(@Body() dto: IssueAdminCertificateDto) {
    return this.service.issueCertificate(dto, this.cloudinaryService);
  }

  @Get('issued')
  @ApiOperation({ summary: '[Admin] Lấy danh sách chứng nhận đã cấp' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getIssuedCertificates() {
    return this.service.getIssuedCertificates();
  }
}
