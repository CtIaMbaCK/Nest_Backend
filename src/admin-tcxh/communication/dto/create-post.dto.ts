import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Chương trình trao quà Tết 2024 thành công tốt đẹp',
    description: 'Tiêu đề bài viết',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Ngày 15/01/2024, tổ chức đã trao 500 phần quà Tết cho người nghèo.\n\nChương trình diễn ra tại các quận:\n- Quận 1\n- Quận 3\n- Quận 5\n\nCảm ơn các tình nguyện viên đã tham gia!',
    description: 'Nội dung bài viết (hỗ trợ xuống hàng với \\n)',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
