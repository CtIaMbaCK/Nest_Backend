import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
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
  @Post('review')
  @ApiOperation({ summary: 'Gửi đánh giá cho một hoạt động đã hoàn thành' })
  async createReview(
    @GetUser('sub') userId: string,
    @Body(new ValidationPipe()) dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createReview(userId, dto);
  }

  // gửi lời cảm ơn
  @Post('appreciation')
  @ApiOperation({ summary: 'Gửi lời cảm ơn đến người khác' })
  async createAppreciation(
    @GetUser('sub') userId: string,
    @Body(new ValidationPipe()) dto: CreateAppreciationDto,
  ) {
    return this.feedbackService.createThankYou(userId, dto);
  }

  // xem các đánh giá về mình
  @Get('my-reviews')
  @ApiOperation({ summary: 'Xem danh sách các đánh giá mà tôi nhận được' })
  async getMyReviews(@GetUser('sub') userId: string) {
    return this.feedbackService.getMyReviews(userId);
  }

  // xem các lời cảm ơn đã nhận
  @Get('my-appreciations')
  @ApiOperation({ summary: 'Xem danh sách lời cảm ơn mà tôi nhận được' })
  async getMyAppreciations(@GetUser('sub') userId: string) {
    return this.feedbackService.getMyAppreciations(userId);
  }
}
