import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { ReservacionService } from '../../aplicacion/services/reservacion.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  BearerAuthToken,
  VersionDescription,
} from '../decorators/controller.decorator';
import {
  CreateReservacionDto,
  DisponibilidadQueryDto,
  UpdateReservacionDto,
} from '../dtos/reservaciones.dto';
import { OAuth2Guard } from 'src/presentacion/guards/oauth2.guard';
import { CreateTiposReservaDto } from '../dtos/espacios.dto';

@ApiTags('[reservaciones] reservaciones'.toUpperCase())
@Controller('reservaciones')
export class ReservacionController {
  constructor(private readonly reservationService: ReservacionService) {}

  @Post('/validar-horas')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Servico para validar horas de reserva')
  @ApiOperation({ summary: 'Validar y crear una nueva reservación' })
  @ApiResponse({ status: 201, description: 'Reservación creada exitosamente' })
  async validarReservacion(
    @Body() validarReservacionDto: CreateReservacionDto,
  ) {
    return await this.reservationService.validarReservacion({
      espacioId: validarReservacionDto.espacioId,
      fechaInical: validarReservacionDto.fechaInical,
      fechaFinal: validarReservacionDto.fechaFinal,
      horasReserva: validarReservacionDto.horasReserva,
      usuarioId: validarReservacionDto.usuarioId,
    });
  }

  @Get('/usuario/:usuarioId')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Obtener reservaciones por usuario')
  @ApiOperation({ summary: 'Obtener todas las reservaciones de un usuario' })
  async obtenerReservacionesPorUsuario(@Param('usuarioId') usuarioId: number) {
    return await this.reservationService.obtenerReservacionesPorUsuario(
      usuarioId,
    );
  }

  @Get('/espacio/:espacioId')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Obtener reservaciones por espacio')
  @ApiOperation({ summary: 'Obtener todas las reservaciones de un espacio' })
  async obtenerReservacionesPorEspacio(
    @Param('espacioId') espacioId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return await this.reservationService.obtenerReservacionesPorEspacio(
      espacioId,
      fromDate,
      toDate,
    );
  }

  @Get('/:id')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Obtener reservación por ID')
  @ApiOperation({ summary: 'Obtener una reservación específica' })
  async obtenerReservacionPorId(@Param('id') id: number) {
    return await this.reservationService.obtenerReservacionPorId(id);
  }

  @Patch('/:id')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Modificar reservación')
  @ApiOperation({ summary: 'Modificar una reservación existente' })
  @ApiResponse({
    status: 200,
    description: 'Reservación modificada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Reservación no encontrada' })
  async modificarReservacion(
    @Param('id') id: number,
    @Body() updateReservacionDto: UpdateReservacionDto,
  ) {
    return await this.reservationService.modificarReservacion(id, {
      fechaInicial: updateReservacionDto.fechaInicial,
      fechaFinal: updateReservacionDto.fechaFinal,
      horasReserva: updateReservacionDto.horasReserva,
    });
  }

  @Delete('/:id')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Cancelar reservación')
  @ApiOperation({ summary: 'Cancelar una reservación' })
  @ApiResponse({
    status: 200,
    description: 'Reservación cancelada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Reservación no encontrada' })
  async cancelarReservacion(@Param('id') id: number) {
    return await this.reservationService.cancelarReservacion(id);
  }

  @Get('/disponibilidad/verificar')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Verificar disponibilidad de espacio')
  @ApiOperation({
    summary: 'Verificar si un espacio está disponible en un horario',
  })
  async verificarDisponibilidad(@Query() query: DisponibilidadQueryDto) {
    return await this.reservationService.verificarDisponibilidad(
      query.espacioId,
      new Date(query.fechaInicial),
      new Date(query.fechaFinal),
    );
  }

  @Get('/reporte/rango-fecha')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Obtener reservaciones por rango de fechas')
  @ApiOperation({ summary: 'Obtener reservaciones en un rango de fechas' })
  async obtenerReservacionesPorRangoFecha(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('espacioId') espacioId?: number,
  ) {
    return await this.reservationService.obtenerReservacionesPorRangoFecha(
      new Date(from),
      new Date(to),
      espacioId,
    );
  }

  @Post('/tipos-reservacion')
  @ApiBearerAuth('bearer')
  @UseGuards(OAuth2Guard)
  @VersionDescription('1', 'Servico para crear tipos de reservación')
  @ApiOperation({ summary: 'Validar y crear una nueva reservación' })
  @ApiResponse({ status: 201, description: 'Reservación creada exitosamente' })
  async registroTiposReserva(
    @Body() validarReservacionDto: CreateTiposReservaDto,
  ) {
    return await this.reservationService.registroTiposReserva(
      validarReservacionDto,
    );
  }
}
