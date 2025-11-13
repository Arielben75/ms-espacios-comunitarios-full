import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/modules/database.module';
import { ReservacionService } from 'src/aplicacion/services/reservacion.service';
import { ReservacionController } from 'src/presentacion/controller/reservaciones.controller';
import { ReservacionesRespository } from 'src/infraestructura/adapters/repositories/reservaciones.repository';
import { MsEspaciosRepository } from 'src/infraestructura/adapters/repositories/espacios.repository';
import { KafkaConsumerService } from 'src/infraestructura/adapters/services/kafka-consumer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DataBaseModule, ConfigModule],
  controllers: [ReservacionController],
  providers: [
    ReservacionService,
    KafkaConsumerService,
    { provide: 'MsEspaciosRepositoryPort', useClass: MsEspaciosRepository },
    {
      provide: 'ReservacionRepositoryPort',
      useClass: ReservacionesRespository,
    },
  ],
  exports: [ReservacionService, 'MsEspaciosRepositoryPort'],
})
export class ReservacionesModule {}
