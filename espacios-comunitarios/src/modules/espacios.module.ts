import { Module } from '@nestjs/common';
import { EspaciosService } from 'src/aplicacion/services/espacios.service';
import { EspaciosRepository } from 'src/infraestructura/adapters/repositories/espacios.repository';
import { DataBaseModule } from 'src/modules/database.module';
import { EspaciosController } from 'src/presentacion/controller/espacios.controller';

@Module({
  imports: [DataBaseModule],
  controllers: [EspaciosController],
  providers: [
    EspaciosService,
    { provide: 'EspaciosRepositoryPort', useClass: EspaciosRepository },
  ],
  exports: [],
})
export class EspaciosModule {}
