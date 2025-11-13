
import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../infraestructura/database/prima.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [ PrismaService],
})
export class DataBaseModule {}