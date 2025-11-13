import { Inject, Injectable } from '@nestjs/common';
import { Espacios } from 'src/dominio/entities/espacios.entity';
import {
  EspaciosListOptions,
  EspaciosRepositoryPort,
} from 'src/dominio/ports/repositories/espacios-repository.port';
import { EspacioSearchCriterio } from 'src/dominio/value-objects/espacios-filter.vo';
import { FilterEspaciosDto } from 'src/presentacion/dtos/espacios.dto';
import { PaginationResult } from 'src/shared/dto/interface';
import {
  dataResponseError,
  dataResponseFormat,
  dataResponseSuccess,
  ResponseDTO,
} from 'src/shared/dto/response.dto';

@Injectable()
export class EspaciosService {
  constructor(
    @Inject('EspaciosRepositoryPort')
    private readonly espaciosRepository: EspaciosRepositoryPort,
  ) {}

  async createEspacios(params: {
    nombre: string;
    tipoEspacioId: number;
    descripcion: string;
    capacidad: number;
    tarifaHora: number;
    tarifaDia: number;
  }): Promise<ResponseDTO<Espacios>> {
    try {
      const existeNombre = await this.espaciosRepository.findByNombre(
        params.nombre,
      );

      if (existeNombre) {
        return dataResponseError('Ya existe este nombre para el espacio.');
      }

      const espacios = Espacios.create(
        params.nombre,
        params.tipoEspacioId,
        params.descripcion,
        params.capacidad,
        params.tarifaHora,
        params.tarifaDia,
        1,
        params.capacidad,
      );

      const espacio = await this.espaciosRepository.createEspacio(espacios);

      return dataResponseSuccess({ data: espacio });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async updateEspacios(params: {
    id: number;
    nombre: string;
    tipoEspacioId: number;
    descripcion: string;
    capacidad: number;
    tarifaHora: number;
    tarifaDia: number;
  }): Promise<ResponseDTO<Espacios>> {
    try {
      const espacios = Espacios.update(
        params.id,
        params.nombre,
        params.tipoEspacioId,
        params.descripcion,
        params.capacidad,
        params.tarifaHora,
        params.tarifaDia,
        1,
        params.capacidad,
      );

      const espacioUdpate =
        await this.espaciosRepository.updateEspacio(espacios);

      return dataResponseSuccess({ data: espacioUdpate });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async deleteEspacios(id: number): Promise<ResponseDTO<any>> {
    try {
      const esDelete = await this.espaciosRepository.deleteEspacio(id);
      return dataResponseSuccess({ data: esDelete });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async listEspacios(
    dto: FilterEspaciosDto,
  ): Promise<ResponseDTO<PaginationResult<Espacios>>> {
    try {
      const searchCriterio = dto.where
        ? EspacioSearchCriterio.fromDto(dto.where)
        : undefined;

      const options: EspaciosListOptions = {
        page: dto.page,
        size: dto.size,
        orderBy: dto.orderBy,
        orderDirection: dto.orderDirection,
        searchCriterio,
      };

      const result = await this.espaciosRepository.listar(options);

      return dataResponseFormat(result);
    } catch (error) {
      return dataResponseError(error.message);
    }
  }
}
