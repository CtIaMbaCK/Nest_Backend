import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCertificateTemplateDto {
  @ApiProperty({
    description: 'Tên mẫu chứng nhận',
    example: 'Chứng nhận Tình nguyện viên xuất sắc',
  })
  @IsNotEmpty({ message: 'Tên mẫu không được để trống' })
  @IsString({ message: 'Tên mẫu phải là chuỗi' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả mẫu chứng nhận',
    example: 'Dành cho TNV có từ 100 điểm trở lên',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiProperty({
    description: 'URL ảnh template (đã upload lên Cloudinary)',
    example: 'https://res.cloudinary.com/xxx/certificate-template.png',
  })
  @IsNotEmpty({ message: 'URL ảnh template không được để trống' })
  @IsString({ message: 'URL ảnh template phải là chuỗi' })
  templateImageUrl: string;

  @ApiProperty({
    description: 'Cấu hình vị trí các text box trên template',
    example: {
      volunteerName: { x: 250, y: 300, width: 400, height: 80, fontSize: 32, fontFamily: 'Arial', color: '#000000', align: 'center' },
      points: { x: 250, y: 400, width: 200, height: 40, fontSize: 24, fontFamily: 'Arial', color: '#000000', align: 'center' },
      issueDate: { x: 250, y: 500, width: 200, height: 40, fontSize: 20, fontFamily: 'Arial', color: '#000000', align: 'center' },
    },
  })
  @IsNotEmpty({ message: 'Config text box không được để trống' })
  @IsObject({ message: 'Config text box phải là object' })
  textBoxConfig: any;
}
