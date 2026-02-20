import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient({adapter: new PrismaPg({})});

function generateUniqueDatabaseUrl(schemaId: string) {
    if(!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    const url = new URL(process.env.DATABASE_URL);

    url.searchParams.set('schema', schemaId);
    
    return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseUrl(schemaId);

  process.env.DATABASE_URL = databaseUrl;

  execSync('yarn prisma migrate deploy');
});

afterAll(async () => {
  console.log('Cleaning up database connections...');

  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});