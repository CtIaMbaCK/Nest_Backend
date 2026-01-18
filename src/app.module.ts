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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
