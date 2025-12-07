import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import { Pool } from 'pg';
import { env as ENV } from 'prisma/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({
      connectionString: ENV('NEST_POSTGRESQL_DATABASE_URL'),
    });

    console.log(
      `NEST_POSTGRESQL_DATA_URL_TEST: ${ENV('NEST_POSTGRESQL_DATABASE_URL')}`,
    );
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
