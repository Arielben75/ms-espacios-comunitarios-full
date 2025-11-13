import { PaginationOptions } from 'src/shared/dto/interface';

export class EspaciosFilterDto {
  nombre?: string;
  tipoEspacioId?: number;
  capacidad?: number;
}

export class ListEspaciosDto implements PaginationOptions {
  page: number;
  size: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: EspaciosFilterDto;
}
