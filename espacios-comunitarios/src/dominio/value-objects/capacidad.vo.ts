export class Capacidad {
  private value: number;

  constructor(capacidad: number) {
    this.value = capacidad;
  }

  static validateMaxCapacidad(
    capacidad: number,
    maxCapacidad: number,
  ): Capacidad {
    if (capacidad <= 0) {
      throw new Error('la capacidad del espacion no debe ser 0.');
    }

    if (capacidad > maxCapacidad) {
      throw new Error('La capacidad Maxima se supero');
    }
    return new Capacidad(capacidad);
  }

  getValue(): number {
    return this.value;
  }

  setValue(value: number) {
    this.value = value;
  }
}
