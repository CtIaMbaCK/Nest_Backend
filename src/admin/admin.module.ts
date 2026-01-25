import { Module } from '@nestjs/common';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ContentModule } from './content/content.module';
import { HelpRequestsModule } from './help-requests/help-requests.module';

@Module({
  imports: [
    BeneficiariesModule,
    VolunteersModule,
    OrganizationsModule,
    ContentModule,
    HelpRequestsModule,
  ],
})
export class AdminModule {}
