import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RequestModule } from './request/request.module';
import { FeedbackModule } from './feedback/feedback.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrganizationModule } from './admin-tcxh/organization/organization.module';
import { CampaignModule } from './admin-tcxh/campaign/campaign.module';
import { CommunicationModule } from './admin-tcxh/communication/communication.module';
import { StatisticsModule } from './admin-tcxh/statistics/statistics.module';
import { VolunteerRewardsModule } from './volunteer-rewards/volunteer-rewards.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ✅ Load .env file
    // ConfigModule.forRoot({
    //   isGlobal: true, // Make ConfigService available globally
    //   envFilePath: '.env',
    // }),
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute (global default)
      },
    ]),
    UsersModule,
    AuthModule,
    PrismaModule,
    RequestModule,
    FeedbackModule,
    CloudinaryModule,
    OrganizationModule,
    CampaignModule,
    CommunicationModule,
    StatisticsModule,
    VolunteerRewardsModule,
    AdminModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
