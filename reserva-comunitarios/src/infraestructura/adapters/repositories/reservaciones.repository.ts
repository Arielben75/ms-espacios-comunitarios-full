import { Reservacion } from 'src/dominio/entities/reservacion.entity';
import { ReservacionRepositoryPort } from 'src/dominio/ports/repositories/reservacion-repository.port';
import { PrismaService } from 'src/infraestructura/database/prima.service';

export class ReservacionesRespository implements ReservacionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async validarReservacion(reservation: Reservacion): Promise<Reservacion> {
    try {
      const createdReservation = await this.prisma.reservaciones.create({
        data: {
          usuarioId: reservation.usuarioId,
          espacioId: reservation.espacioId,
          fechaInicial: reservation.fechaInicial,
          fechaFinal: reservation.fechaFinal,
          horasReserva: reservation.horasReserva,
          importeTotal: reservation.importeTotal,
          estadoReservacionId: reservation.estadoReservacionId,
          transaccionId: reservation.transaccionId,
          eventoCalendarioId: reservation.eventoCalendarioId,
        },
        include: {
          //espacios: true,
          //usuarios: true,
          tiposReservacion: true,
        },
      });

      return this.toDomain(createdReservation);
    } catch (error) {
      throw new Error(`Error al crear la reservación: ${error.message}`);
    }
  }

  async checkTimeConflict(
    espacioId: number,
    fechaInicial: Date,
    fechaFinal: Date,
    excludeReservationId?: number,
  ): Promise<boolean> {
    const conflictingReservations = await this.prisma.reservaciones.findMany({
      where: {
        espacioId: espacioId,
        estado: 1, // Solo reservaciones activas
        estadoReservacionId: {
          in: [1, 2], // Estados que indican reserva activa (pendiente, confirmada)
        },
        AND: [
          {
            fechaInicial: {
              lt: fechaFinal, // La reserva existente inicia antes de que termine la nueva
            },
          },
          {
            fechaFinal: {
              gt: fechaInicial, // La reserva existente termina después de que inicie la nueva
            },
          },
        ],
        ...(excludeReservationId && {
          id: {
            not: excludeReservationId,
          },
        }),
      },
    });

    return conflictingReservations.length > 0;
  }

  async findById(id: number): Promise<Reservacion> {
    const reservation = await this.prisma.reservaciones.findUnique({
      where: { id },
      include: {
        // espacios: true,
        // usuarios: true,
        tiposReservacion: true,
      },
    });

    return this.toDomain(reservation);
  }

  async findByUserId(usuarioId: number): Promise<Reservacion[]> {
    const reservations = await this.prisma.reservaciones.findMany({
      where: {
        usuarioId,
        estado: 1,
      },
      include: {
        // espacios: true,
        // usuarios: true,
        tiposReservacion: true,
      },
      orderBy: {
        fechaInicial: 'desc',
      },
    });

    return reservations.map(this.toDomain);
  }

  async findByEspacioId(
    espacioId: number,
    from?: Date,
    to?: Date,
  ): Promise<Reservacion[]> {
    const whereClause: any = {
      espacioId,
      estado: 1,
    };

    if (from && to) {
      whereClause.AND = [
        {
          fechaInicial: {
            gte: from,
          },
        },
        {
          fechaFinal: {
            lte: to,
          },
        },
      ];
    }

    const reservations = await this.prisma.reservaciones.findMany({
      where: whereClause,
      include: {
        // espacios: true,
        // usuarios: true,
        tiposReservacion: true,
      },
      orderBy: {
        fechaInicial: 'asc',
      },
    });

    return reservations.map(this.toDomain);
  }

  async updateReservation(
    id: number,
    updateData: Partial<{
      fechaInicial: Date;
      fechaFinal: Date;
      horasReserva: number;
      estadoReservacionId: number;
      importeTotal: number;
    }>,
  ): Promise<Reservacion> {
    try {
      const updatedReservation = await this.prisma.reservaciones.update({
        where: { id },
        data: updateData,
        include: {
          // espacios: true,
          // uarios: true,
          tiposReservacion: true,
        },
      });

      return this.toDomain(updatedReservation);
    } catch (error) {
      throw new Error(`Error al actualizar la reservación: ${error.message}`);
    }
  }

  async cancelReservation(id: number): Promise<boolean> {
    try {
      await this.prisma.reservaciones.update({
        where: { id },
        data: {
          estadoReservacionId: 3, // Asumiendo que 3 es el estado "cancelada"
          estado: 0, // Marcar como inactiva
        },
      });

      return true;
    } catch (error) {
      throw new Error(`Error al cancelar la reservación: ${error.message}`);
    }
  }

  async getReservationsByDateRange(
    from: Date,
    to: Date,
    espacioId?: number,
  ): Promise<Reservacion[]> {
    const whereClause: any = {
      estado: 1,
      OR: [
        {
          fechaInicial: { gte: from, lte: to },
        },
        {
          fechaFinal: { gte: from, lte: to },
        },
        {
          AND: [
            {
              fechaInicial: { lte: from },
            },
            {
              fechaFinal: { gte: to },
            },
          ],
        },
      ],
    };

    if (espacioId) {
      whereClause.espacioId = espacioId;
    }

    const reservations = await this.prisma.reservaciones.findMany({
      where: whereClause,
      include: {
        // espacios: true,
        // usuarios: true,
        tiposReservacion: true,
      },
      orderBy: {
        fechaInicial: 'asc',
      },
    });

    return reservations.map(this.toDomain);
  }

  private toDomain(reservation: any): Reservacion {
    return new Reservacion(
      reservation.id,
      reservation.usuarioId,
      reservation.espacioId,
      new Date(reservation.fechaInicial),
      new Date(reservation.fechaFinal),
      reservation.horasReserva,
      reservation.estadoReservacionId,
      reservation.importeTotal,
      reservation.transaccionId || '',
      reservation.eventoCalendarioId || '',
      new Date(reservation.creadoEn),
    );
  }
}
