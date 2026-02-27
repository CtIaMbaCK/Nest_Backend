import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  CreateAppreciationDto,
  CreateFeedbackDto,
} from './dto/create-feedback.dto';

@ApiTags('Feedback (Đánh giá & Cảm ơn)')
@ApiBearerAuth('JWT-auth')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // tạo đánh giá
  @UseGuards(JwtAuthGuard)
  @Post('review')
  @ApiOperation({ summary: 'Gửi đánh giá cho một hoạt động đã hoàn thành' })
  async createReview(
    @GetUser('sub') userId: string,
    @Body(new ValidationPipe()) dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createReview(userId, dto);
  }

  // gửi lời cảm ơn
  @UseGuards(JwtAuthGuard)
  @Post('appreciation')
  @ApiOperation({ summary: 'Gửi lời cảm ơn đến người khác' })
  async createAppreciation(
    @GetUser('sub') userId: string,
    @Body(new ValidationPipe()) dto: CreateAppreciationDto,
  ) {
    return this.feedbackService.createThankYou(userId, dto);
  }

  // xem các đánh giá về mình
  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  @ApiOperation({ summary: 'Xem danh sách các đánh giá mà tôi nhận được' })
  async getMyReviews(@GetUser('sub') userId: string) {
    return this.feedbackService.getMyReviews(userId);
  }

  // xem các lời cảm ơn đã nhận
  @UseGuards(JwtAuthGuard)
  @Get('my-appreciations')
  @ApiOperation({ summary: 'Xem danh sách lời cảm ơn mà tôi nhận được' })
  async getMyAppreciations(@GetUser('sub') userId: string) {
    return this.feedbackService.getMyAppreciations(userId);
  }
}
