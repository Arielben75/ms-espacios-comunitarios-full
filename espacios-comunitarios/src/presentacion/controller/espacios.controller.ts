import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BearerAuthToken,
  VersionDescription,
} from '../decorators/controller.decorator';
import { CreateEspaciosDto, FilterEspaciosDto } from '../dtos/espacios.dto';
import { EspaciosService } from 'src/aplicacion/services/espacios.service';

@ApiTags('[Espacios] Espacios'.toUpperCase())
@Controller('espaciops')
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Post('registrar')
  @BearerAuthToken()
  @VersionDescription('1', 'Servico para crear de un espacio Comunitario')
  async register(@Body() registerDto: CreateEspaciosDto) {
    return await this.espaciosService.createEspacios({
      capacidad: registerDto.capacidad,
      descripcion: registerDto.descripcion ?? '',
      nombre: registerDto.nombre,
      tarifaDia: registerDto.tarifaDia,
      tarifaHora: registerDto.tarifaHora,
      tipoEspacioId: registerDto.tipoEspacioId,
    });
  }

  @Patch('update/:id')
  @BearerAuthToken()
  @VersionDescription('1', 'Servico para actualizar un espacio comunitario')
  updateUsuarios(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    id: number,
    @Body() body: CreateEspaciosDto,
  ) {
    return this.espaciosService.updateEspacios({
      id,
      capacidad: body.capacidad,
      descripcion: body.descripcion ?? '',
      nombre: body.nombre,
      tarifaDia: body.tarifaDia,
      tarifaHora: body.tarifaHora,
      tipoEspacioId: body.tipoEspacioId,
    });
  }

  @Delete('delete/:id')
  @BearerAuthToken()
  @VersionDescription('1', 'Servico para eliminar un espacio comunitario')
  deleteUsuarios(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    id: number,
  ) {
    return this.espaciosService.deleteEspacios(id);
  }

  @Post('list')
  @BearerAuthToken()
  @VersionDescription('1', 'Servico para listar los espacios comunitarios')
  listadoUsuarios(@Body() body: FilterEspaciosDto) {
    return this.espaciosService.listEspacios(body);
  }
}
