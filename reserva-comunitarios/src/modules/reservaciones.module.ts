import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/modules/database.module';
import { ReservacionService } from 'src/aplicacion/services/reservacion.service';
import { ReservacionController } from 'src/presentacion/controller/reservaciones.controller';
import { ReservacionesRespository } from 'src/infraestructura/adapters/repositories/reservaciones.repository';
import { MsEspaciosRepository } from 'src/infraestructura/adapters/repositories/espacios.repository';

@Module({
  imports: [DataBaseModule],
  controllers: [ReservacionController],
  providers: [
    ReservacionService,
    { provide: 'MsEspaciosRepositoryPort', useClass: MsEspaciosRepository },
    {
      provide: 'ReservacionRepositoryPort',
      useClass: ReservacionesRespository,
    },
  ],
  exports: [ReservacionService, 'MsEspaciosRepositoryPort'],
})
export class ReservacionesModule {}
