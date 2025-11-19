import { Reservacion } from 'src/dominio/entities/reservacion.entity';

export interface ReservacionRepositoryPort {
  validarReservacion(reservation: Reservacion): Promise<Reservacion>;
  checkTimeConflict(
    espacioId: number,
    fechaInicial: Date,
    fechaFinal: Date,
    excludeReservationId?: number,
  ): Promise<boolean>;
  findById(id: number): Promise<Reservacion>;
  findByUserId(usuarioId: number): Promise<Reservacion[]>;
  findByEspacioId(
    espacioId: number,
    from?: Date,
    to?: Date,
  ): Promise<Reservacion[]>;
  updateReservation(
    id: number,
    updateData: Partial<{
      fechaInicial: Date;
      fechaFinal: Date;
      horasReserva: number;
      estadoReservacionId: number;
      importeTotal: number;
    }>,
  ): Promise<Reservacion | null>;
  cancelReservation(id: number): Promise<boolean>;
  getReservationsByDateRange(
    from: Date,
    to: Date,
    espacioId?: number,
  ): Promise<Reservacion[]>;
  createTiposReserva(params: any): Promise<any>;
}
