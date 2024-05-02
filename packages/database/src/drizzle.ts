import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// TODO: don't commit this
const db_url = "postgresql://local-points-db_owner:XKv7Hhae6GCr@ep-dawn-cherry-a2uo7s6x-pooler.eu-central-1.aws.neon.tech/stackingdao.live?sslmode=require"
const sql = neon(db_url); //process.env.DATABASE_URL!);
export const db = drizzle(sql);

// import { RDSDataClient } from '@aws-sdk/client-rds-data';
// import { fromIni } from '@aws-sdk/credential-providers';
// import { drizzle } from 'drizzle-orm/aws-data-api/pg';
// import { migrate } from 'drizzle-orm/aws-data-api/pg/migrator';

// const rdsClient = new RDSDataClient({
//   credentials: fromIni({ profile: process.env['AWS_PROFILE'] }),
//   region: 'eu-west-1',
// });

// export const db = drizzle(rdsClient, {
//   database: process.env['AWS_DATABASE']!,
//   secretArn: process.env['AWS_SECRET_ARN']!,
//   resourceArn: process.env['AWS_RESOURCE_ARN']!,
// });
