import { WhereEspaciosDto } from 'src/presentacion/dtos/espacios.dto';

export interface EspacioFilterCriterio {
  nombre?: string;
  tipoEspacioId?: number;
  capacidad?: number;
}

export class EspacioSearchCriterio {
  constructor(private readonly filters: EspacioFilterCriterio) {}

  static fromDto(dto: WhereEspaciosDto): EspacioSearchCriterio {
    return new EspacioSearchCriterio({
      nombre: dto.nombre,
      capacidad: dto.capacidad,
      tipoEspacioId: dto.tipoEspacioId,
    });
  }

  buildWhereClause(): any {
    let whereClause: any = {};

    if (this.filters.nombre) {
      whereClause = {
        ...whereClause,
        nombre: { contains: this.filters.nombre },
      };
    }

    if (this.filters.tipoEspacioId) {
      whereClause = {
        ...whereClause,
        tipoEspacioId: this.filters.tipoEspacioId,
      };
    }

    if (this.filters.capacidad) {
      whereClause = {
        ...whereClause,
        capacidad: this.filters.capacidad,
      };
    }

    return whereClause;
  }

  isEmpty(): boolean {
    return Object.keys(this.filters).every((key) => !this.filters[key]);
  }

  getCriteria(): EspacioFilterCriterio {
    return { ...this.filters };
  }
}
