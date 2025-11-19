import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BearerAuthToken,
  VersionDescription,
} from '../decorators/controller.decorator';
import {
  CreateEspaciosDto,
  CreateTiposEspaciosDto,
  FilterEspaciosDto,
} from '../dtos/espacios.dto';
import { EspaciosService } from 'src/aplicacion/services/espacios.service';
import { OAuth2Guard } from 'src/presentacion/guards/oauth2.guard';

@ApiTags('[Espacios] Espacios'.toUpperCase())
@Controller('espacios')
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Post('registrar')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
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
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
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
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
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
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Servico para listar los espacios comunitarios')
  listadoUsuarios(@Body() body: FilterEspaciosDto) {
    return this.espaciosService.listEspacios(body);
  }

  @Post('registrar/tipos-espacios')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Servico para crear de un espacio Comunitario')
  async registrarTipoEspacio(@Body() registerDto: CreateTiposEspaciosDto) {
    return await this.espaciosService.createTiposEspacios({
      descripcion: registerDto.descripcion ?? '',
      nombre: registerDto.nombre,
    });
  }
}
