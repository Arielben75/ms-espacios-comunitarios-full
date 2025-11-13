import { Module } from '@nestjs/common';
import { EspaciosService } from 'src/aplicacion/services/espacios.service';
import { EspaciosRepository } from 'src/infraestructura/adapters/repositories/espacios.repository';
import { DataBaseModule } from 'src/modules/database.module';
import { EspaciosController } from 'src/presentacion/controller/espacios.controller';
import { KafkaProducerService } from 'src/infraestructura/adapters/services/kafka-producer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DataBaseModule, ConfigModule],
  controllers: [EspaciosController],
  providers: [
    EspaciosService,
    KafkaProducerService,
    { provide: 'EspaciosRepositoryPort', useClass: EspaciosRepository },
  ],
  exports: [KafkaProducerService],
})
export class EspaciosModule {}
