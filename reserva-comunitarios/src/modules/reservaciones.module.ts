import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/modules/database.module';
import { ReservacionService } from 'src/aplicacion/services/reservacion.service';
import { ReservacionController } from 'src/presentacion/controller/reservaciones.controller';
import { ReservacionesRespository } from 'src/infraestructura/adapters/repositories/reservaciones.repository';
import { MsEspaciosRepository } from 'src/infraestructura/adapters/repositories/espacios.repository';
import { KafkaConsumerService } from 'src/infraestructura/adapters/services/kafka-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { OAuth2Service } from 'src/infraestructura/adapters/services/oauth2.service';
import { MicroserviceHttpClient } from 'src/infraestructura/adapters/services/microservice-http-client.service';

@Module({
  imports: [DataBaseModule, ConfigModule],
  controllers: [ReservacionController],
  providers: [
    ReservacionService,
    KafkaConsumerService,
    OAuth2Service,
    MicroserviceHttpClient,
    { provide: 'MsEspaciosRepositoryPort', useClass: MsEspaciosRepository },
    {
      provide: 'ReservacionRepositoryPort',
      useClass: ReservacionesRespository,
    },
  ],
  exports: [
    ReservacionService,
    'MsEspaciosRepositoryPort',
    OAuth2Service,
    MicroserviceHttpClient,
  ],
})
export class ReservacionesModule {}
