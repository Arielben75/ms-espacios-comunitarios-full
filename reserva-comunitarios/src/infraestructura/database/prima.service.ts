import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';



@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  prismaConect = new PrismaClient();

  async onModuleInit() {
    try {
      await this.prismaConect.$connect();
    } catch (error) {
      console.info('Database ERROR: ', error.message);
      await this.prismaConect.$disconnect();
    }
  }

  async onModuleDestroy() {
    await await Promise.all([
      this.prismaConect.$disconnect(),
    ]);
  }
}
