import { UserFilterDto } from 'src/presentacion/interfaces/user-filter';

export interface UserFilterCriterio {
  celular?: string;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  userName?: string;
}

export class UserSearchCriteria {
  constructor(private readonly filters: UserFilterCriterio) {}

  static fromDto(dto: UserFilterDto): UserSearchCriteria {
    return new UserSearchCriteria({
      celular: dto.celular,
      nombres: dto.nombres,
      primerApellido: dto.primerApellido,
      segundoApellido: dto.segundoApellido,
      userName: dto.userName,
    });
  }

  // Método que construye los criterios de filtro
  buildWhereClause(): any {
    let whereClause: any = {};

    if (this.filters.celular) {
      whereClause = {
        ...whereClause,
        celular: { contains: this.filters.celular },
      };
    }
    if (this.filters.nombres) {
      whereClause = {
        ...whereClause,
        nombres: { contains: this.filters.nombres },
      };
    }
    if (this.filters.primerApellido) {
      whereClause = {
        ...whereClause,
        primerApellido: { contains: this.filters.primerApellido },
      };
    }
    if (this.filters.segundoApellido) {
      whereClause = {
        ...whereClause,
        segundoApellido: { contains: this.filters.segundoApellido },
      };
    }
    if (this.filters.userName) {
      whereClause = {
        ...whereClause,
        userName: { contains: this.filters.userName },
      };
    }

    return whereClause;
  }

  isEmpty(): boolean {
    return Object.keys(this.filters).every((key) => !this.filters[key]);
  }

  getCriteria(): UserFilterCriterio {
    return { ...this.filters };
  }
}
