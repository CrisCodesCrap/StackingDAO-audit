import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log(process.env.DATABASE_URL);

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
