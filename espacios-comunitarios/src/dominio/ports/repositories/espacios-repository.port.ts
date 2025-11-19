import { Espacios } from 'src/dominio/entities/espacios.entity';
import { EspacioSearchCriterio } from 'src/dominio/value-objects/espacios-filter.vo';
import { PaginationOptions, PaginationResult } from 'src/shared/dto/interface';

export interface EspaciosListOptions extends PaginationOptions {
  searchCriterio?: EspacioSearchCriterio;
}

export interface EspaciosRepositoryPort {
  findAll(): Promise<Espacios[]>;
  findById(id: number): Promise<Espacios | null>;
  findAvailable(fechaInicial: Date, fechaFinal: Date): Promise<Espacios[]>;
  findByCapacidad(capacidadMinima: number): Promise<Espacios[]>;
  findByTarifaRange(tarifaMin: number, tarifaMax: number): Promise<Espacios[]>;
  findByTipo(tipoEspacioId: number): Promise<Espacios[]>;
  findByNombre(nombre: String): Promise<Espacios | null>;
  createEspacio(espacio: Espacios): Promise<Espacios>;
  updateEspacio(espacio: Espacios): Promise<Espacios>;
  deleteEspacio(id: number): Promise<Espacios>;
  listar(list: EspaciosListOptions): Promise<PaginationResult<Espacios>>;
  createTiposEspacio(espacio: any): Promise<any>;
}
