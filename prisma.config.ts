import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// console.log('Database URL:', env('DATABASE_URL'));
console.log(`URL prisma config: ${env('NEST_URL')}`);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('NEST_URL'),
  },
});
