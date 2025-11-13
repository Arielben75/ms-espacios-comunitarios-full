import { Capacidad } from '../value-objects/capacidad.vo';

export class Espacios {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly tipoEspacioId: number,
    public readonly descripcion: string,
    public readonly capacidad: Capacidad,
    public readonly tarifaHora: number,
    public readonly tarifaDia: number,
    public readonly estado: number,
    public readonly creadoEn: Date,
  ) {}

  static create(
    nombre: string,
    tipoEspacioId: number,
    descripcion: string,
    capacidad: number,
    tarifaHora: number,
    tarifaDia: number,
    estado: number,
    maxCapacidad: number,
  ): Espacios {
    const capacidadVO = Capacidad.validateMaxCapacidad(capacidad, maxCapacidad);
    return new Espacios(
      1,
      nombre,
      tipoEspacioId,
      descripcion,
      capacidadVO,
      tarifaHora,
      tarifaDia,
      estado,
      new Date(),
    );
  }

  static update(
    id: number,
    nombre: string,
    tipoEspacioId: number,
    descripcion: string,
    capacidad: number,
    tarifaHora: number,
    tarifaDia: number,
    estado: number,
    maxCapacidad: number,
  ): Espacios {
    const capacidadVO = Capacidad.validateMaxCapacidad(capacidad, maxCapacidad);

    return new Espacios(
      id,
      nombre,
      tipoEspacioId,
      descripcion,
      capacidadVO,
      tarifaHora,
      tarifaDia,
      estado,
      new Date(),
    );
  }
}
