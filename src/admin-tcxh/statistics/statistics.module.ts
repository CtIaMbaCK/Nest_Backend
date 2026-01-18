import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { PublicStatisticsController } from './public-statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticsController, PublicStatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService]
})
export class StatisticsModule {}
