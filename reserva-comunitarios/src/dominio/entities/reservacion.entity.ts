export class Reservacion {
  constructor(
    public readonly id: number,
    public readonly usuarioId: number,
    public readonly espacioId: number,
    public readonly fechaInicial: Date,
    public readonly fechaFinal: Date,
    public readonly horasReserva: number,
    public readonly estadoReservacionId: number,
    public readonly importeTotal: number,
    public readonly transaccionId: string,
    public readonly eventoCalendarioId: string,
    public readonly creadoEn: Date,
  ) {}

  static async validateReservacion(
    usuarioId: number,
    espacioId: number,
    fechaInicial: Date,
    fechaFinal: Date,
    horasReserva: number,
    creadoEn: Date,
    reservacionRepository: any,
    espaciosRepository: any,
  ): Promise<Reservacion> {
    // Validación 1: Fechas válidas
    this.validateDates(fechaInicial, fechaFinal, creadoEn);

    // Validación 2: Horas de reserva coherentes
    this.validateHorasReserva(fechaInicial, fechaFinal, horasReserva);

    // Validación 3: El espacio existe y está activo
    const espacio = await espaciosRepository.findById(espacioId);
    if (!espacio || espacio.estado !== 1) {
      throw new Error('El espacio no existe o no está disponible');
    }

    // Validación 4: No hay conflictos de horario
    const hasConflict = await reservacionRepository.checkTimeConflict(
      espacioId,
      fechaInicial,
      fechaFinal,
    );

    if (hasConflict) {
      throw new Error('El espacio ya está reservado en ese horario');
    }

    // Validación 5: Capacidad del espacio (si se requiere)
    // Aquí podrías agregar validación de capacidad si es necesario

    // Calcular importe total
    const importeTotal = this.calculateImporteTotal(
      horasReserva,
      espacio.tarifaHora,
    );

    // Crear la reservación válida
    return new Reservacion(
      0, // El ID se asignará en la base de datos
      usuarioId,
      espacioId,
      fechaInicial,
      fechaFinal,
      horasReserva,
      1, // Estado inicial: pendiente o confirmada
      importeTotal,
      this.generateTransactionId(),
      this.generateEventCalendarId(),
      creadoEn,
    );
  }

  private static validateDates(
    fechaInicial: Date,
    fechaFinal: Date,
    creadoEn: Date,
  ): void {
    const now = new Date();

    // La fecha inicial no puede ser en el pasado
    if (fechaInicial < now) {
      throw new Error('La fecha inicial no puede ser en el pasado');
    }

    // La fecha final debe ser posterior a la inicial
    if (fechaFinal <= fechaInicial) {
      throw new Error('La fecha final debe ser posterior a la fecha inicial');
    }

    // No se pueden hacer reservas con más de X días de anticipación (opcional)
    const maxDaysAdvance = 90; // 3 meses
    const maxDate = new Date(
      now.getTime() + maxDaysAdvance * 24 * 60 * 60 * 1000,
    );
    if (fechaInicial > maxDate) {
      throw new Error(
        `No se pueden hacer reservas con más de ${maxDaysAdvance} días de anticipación`,
      );
    }
  }

  private static validateHorasReserva(
    fechaInicial: Date,
    fechaFinal: Date,
    horasReserva: number,
  ): void {
    // Calcular las horas reales entre fechas
    const diffMs = fechaFinal.getTime() - fechaInicial.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (horasReserva !== diffHours) {
      throw new Error(
        'Las horas de reserva no coinciden con el período seleccionado',
      );
    }

    // Validar mínimo y máximo de horas
    if (horasReserva < 1) {
      throw new Error('La reserva debe ser de al menos 1 hora');
    }

    if (horasReserva > 24) {
      throw new Error('La reserva no puede exceder 24 horas continuas');
    }
  }

  private static calculateImporteTotal(
    horasReserva: number,
    tarifaHora: number,
  ): number {
    let importe = horasReserva * tarifaHora;

    // Aplicar descuentos por volumen (opcional)
    if (horasReserva >= 8) {
      importe = importe * 0.9; // 10% descuento por 8+ horas
    } else if (horasReserva >= 4) {
      importe = importe * 0.95; // 5% descuento por 4+ horas
    }

    return Math.round(importe * 100) / 100; // Redondear a 2 decimales
  }

  private static generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${random}`.toUpperCase();
  }

  private static generateEventCalendarId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `EVT-${timestamp}-${random}`.toUpperCase();
  }

  canBeModified(): boolean {
    const now = new Date();
    const hoursUntilStart =
      (this.fechaInicial.getTime() - now.getTime()) / (1000 * 60 * 60);
    // Se puede modificar hasta 2 horas antes del inicio
    return hoursUntilStart > 2;
  }

  // Método para validar si la reserva puede ser cancelada
  canBeCancelled(): boolean {
    const now = new Date();
    const hoursUntilStart =
      (this.fechaInicial.getTime() - now.getTime()) / (1000 * 60 * 60);
    // Se puede cancelar hasta 4 horas antes del inicio
    return hoursUntilStart > 4;
  }

  // Método para obtener el estado de la reserva
  getStatus(): string {
    const now = new Date();

    if (now < this.fechaInicial) {
      return 'PENDIENTE';
    } else if (now >= this.fechaInicial && now <= this.fechaFinal) {
      return 'EN_CURSO';
    } else {
      return 'COMPLETADA';
    }
  }
}
