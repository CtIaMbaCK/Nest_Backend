import { Module } from '@nestjs/common';
import { VolunteerRewardsController } from './volunteer-rewards.controller';
import { VolunteerRewardsService } from './volunteer-rewards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [VolunteerRewardsController],
  providers: [VolunteerRewardsService],
  exports: [VolunteerRewardsService],
})
export class VolunteerRewardsModule {}
