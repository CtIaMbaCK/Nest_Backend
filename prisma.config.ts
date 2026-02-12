import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// console.log(`URL prisma config: ${env('NEST_URL')}`);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
  datasource: {
    url: env('NEST_URL'),
  },
});
