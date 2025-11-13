import { Injectable, Inject } from '@nestjs/common';
import {
  dataResponseError,
  dataResponseSuccess,
  ResponseDTO,
} from 'src/shared/dto/response.dto';
import { Reservacion } from 'src/dominio/entities/reservacion.entity';
import { ReservacionRepositoryPort } from 'src/dominio/ports/repositories/reservacion-repository.port';
import { EspaciosRepositoryPort } from 'src/dominio/ports/repositories/espacios-repository.port';

@Injectable()
export class ReservacionService {
  constructor(
    @Inject('ReservacionRepositoryPort')
    private readonly reservacionesPort: ReservacionRepositoryPort,
    @Inject('MsEspaciosRepositoryPort')
    private readonly espaciosRepository: EspaciosRepositoryPort,
  ) {}

  async validarReservacion(params: {
    usuarioId: number;
    espacioId: number;
    fechaInical: Date;
    fechaFinal: Date;
    horasReserva: number;
  }): Promise<ResponseDTO<Reservacion>> {
    try {
      const reservas = await Reservacion.validateReservacion(
        params.usuarioId,
        params.espacioId,
        params.fechaInical,
        params.fechaFinal,
        params.horasReserva,
        new Date(),
        this.reservacionesPort,
        this.espaciosRepository,
      );

      // Si las validaciones pasan, registrar la reservación
      const reservacionCreada =
        await this.reservacionesPort.validarReservacion(reservas);

      if (!reservacionCreada) {
        return dataResponseError('No se pudo crear la reservación');
      }

      return dataResponseSuccess({ data: reservacionCreada });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async obtenerReservacionesPorUsuario(
    usuarioId: number,
  ): Promise<ResponseDTO<Reservacion[]>> {
    try {
      const reservaciones =
        await this.reservacionesPort.findByUserId(usuarioId);
      return dataResponseSuccess({ data: reservaciones });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async obtenerReservacionesPorEspacio(
    espacioId: number,
    from?: Date,
    to?: Date,
  ): Promise<ResponseDTO<Reservacion[]>> {
    try {
      const reservaciones = await this.reservacionesPort.findByEspacioId(
        espacioId,
        from,
        to,
      );
      return dataResponseSuccess({ data: reservaciones });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async obtenerReservacionPorId(id: number): Promise<ResponseDTO<Reservacion>> {
    try {
      const reservacion = await this.reservacionesPort.findById(id);

      if (!reservacion) {
        return dataResponseError('Reservación no encontrada');
      }

      return dataResponseSuccess({ data: reservacion });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async modificarReservacion(
    id: number,
    params: {
      fechaInicial?: Date;
      fechaFinal?: Date;
      horasReserva?: number;
    },
  ): Promise<ResponseDTO<Reservacion>> {
    try {
      // Obtener la reservación actual
      const reservacionActual = await this.reservacionesPort.findById(id);

      if (!reservacionActual) {
        return dataResponseError('Reservación no encontrada');
      }

      // Validar si puede ser modificada
      if (!reservacionActual.canBeModified()) {
        return dataResponseError(
          'La reservación no puede ser modificada (muy cerca de la fecha de inicio)',
        );
      }

      // Si se cambian las fechas, validar conflictos
      if (params.fechaInicial && params.fechaFinal) {
        const hasConflict = await this.reservacionesPort.checkTimeConflict(
          reservacionActual.espacioId,
          params.fechaInicial,
          params.fechaFinal,
          id, // Excluir la reservación actual del check
        );

        if (hasConflict) {
          return dataResponseError(
            'El espacio ya está reservado en ese horario',
          );
        }

        // Recalcular importe si cambian las horas
        if (params.horasReserva) {
          const espacio = await this.espaciosRepository.findById(
            reservacionActual.espacioId,
          );
          if (espacio) {
            // Aquí podrías recalcular el importe
            // params.importeTotal = params.horasReserva * espacio.tarifaHora;
          }
        }
      }

      const reservacionModificada =
        await this.reservacionesPort.updateReservation(id, params);

      if (!reservacionModificada) {
        return dataResponseError('No se pudo modificar la reservación');
      }

      return dataResponseSuccess({ data: reservacionModificada });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async cancelarReservacion(id: number): Promise<ResponseDTO<boolean>> {
    try {
      const reservacion = await this.reservacionesPort.findById(id);

      if (!reservacion) {
        return dataResponseError('Reservación no encontrada');
      }

      if (!reservacion.canBeCancelled()) {
        return dataResponseError(
          'La reservación no puede ser cancelada (muy cerca de la fecha de inicio)',
        );
      }

      const cancelled = await this.reservacionesPort.cancelReservation(id);

      if (!cancelled) {
        return dataResponseError('No se pudo cancelar la reservación');
      }

      return dataResponseSuccess({ data: true });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async verificarDisponibilidad(
    espacioId: number,
    fechaInicial: Date,
    fechaFinal: Date,
  ): Promise<ResponseDTO<boolean>> {
    try {
      const hasConflict = await this.reservacionesPort.checkTimeConflict(
        espacioId,
        fechaInicial,
        fechaFinal,
      );

      return dataResponseSuccess(
        {
          data: !hasConflict,
        },
        {
          message: hasConflict
            ? 'El espacio no está disponible'
            : 'El espacio está disponible',
        },
      );
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async obtenerReservacionesPorRangoFecha(
    from: Date,
    to: Date,
    espacioId?: number,
  ): Promise<ResponseDTO<Reservacion[]>> {
    try {
      const reservaciones =
        await this.reservacionesPort.getReservationsByDateRange(
          from,
          to,
          espacioId,
        );

      return dataResponseSuccess({ data: reservaciones });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }
}
