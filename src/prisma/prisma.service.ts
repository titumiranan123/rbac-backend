import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    console.log(
      'Initializing PrismaService with DATABASE_URL:',
      process.env.DATABASE_URL,
    );
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://admin:admin123@localhost:5433/rbac_db?schema=public&connection_limit=10&pool_timeout=20';
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Supabase এর জন্য দরকার
      },
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
