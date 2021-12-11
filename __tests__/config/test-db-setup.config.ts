import { Connection, createConnection } from 'typeorm';
import * as path from 'path';

require('dotenv').config();
jest.setTimeout(5 * 60 * 1000);

export let connection: Connection;

beforeAll(async () => {
  connection = await createConnection({
    type: 'postgres',
    host: process.env.HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: 'public',
    entities: [path.join(__dirname, '../', '**/*.entity{.ts,.js}')],
    migrationsRun: false,
    logging: true,
    logger: 'advanced-console',
    maxQueryExecutionTime: 1000,
    synchronize: false,
  });
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
});
