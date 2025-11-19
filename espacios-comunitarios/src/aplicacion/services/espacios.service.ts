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
import { KafkaProducerService } from 'src/infraestructura/adapters/services/kafka-producer.service';

@Injectable()
export class EspaciosService {
  constructor(
    @Inject('EspaciosRepositoryPort')
    private readonly espaciosRepository: EspaciosRepositoryPort,
    private readonly kafkaProducer: KafkaProducerService,
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

      // Publicar evento de creación
      try {
        await this.kafkaProducer.publishEspacioEvent({
          type: 'CREATED',
          data: {
            id: espacio.id,
            nombre: espacio.nombre,
            tipoEspacioId: espacio.tipoEspacioId,
            descripcion: espacio.descripcion,
            capacidad: espacio.capacidad.getValue(),
            tarifaHora: espacio.tarifaHora,
            tarifaDia: espacio.tarifaDia,
            estado: espacio.estado,
            creadoEn: espacio.creadoEn,
            timestamp: new Date(),
          },
        });
      } catch (kafkaError) {
        console.error('Error publicando evento Kafka:', kafkaError.message);
        // No fallar la operación si Kafka falla
      }

      return dataResponseSuccess({ data: espacio });
    } catch (error) {
      console.log(error);
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

      // Publicar evento de actualización
      try {
        await this.kafkaProducer.publishEspacioEvent({
          type: 'UPDATED',
          data: {
            id: espacioUdpate.id,
            nombre: espacioUdpate.nombre,
            tipoEspacioId: espacioUdpate.tipoEspacioId,
            descripcion: espacioUdpate.descripcion,
            capacidad: espacioUdpate.capacidad.getValue(),
            tarifaHora: espacioUdpate.tarifaHora,
            tarifaDia: espacioUdpate.tarifaDia,
            estado: espacioUdpate.estado,
            creadoEn: espacioUdpate.creadoEn,
            timestamp: new Date(),
          },
        });
      } catch (kafkaError) {
        console.error('Error publicando evento Kafka:', kafkaError.message);
        // No fallar la operación si Kafka falla
      }

      return dataResponseSuccess({ data: espacioUdpate });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async deleteEspacios(id: number): Promise<ResponseDTO<any>> {
    try {
      const esDelete = await this.espaciosRepository.deleteEspacio(id);

      // Publicar evento de eliminación
      try {
        await this.kafkaProducer.publishEspacioEvent({
          type: 'DELETED',
          data: {
            id: esDelete.id,
            nombre: esDelete.nombre,
            tipoEspacioId: esDelete.tipoEspacioId,
            descripcion: esDelete.descripcion,
            capacidad: esDelete.capacidad.getValue(),
            tarifaHora: esDelete.tarifaHora,
            tarifaDia: esDelete.tarifaDia,
            estado: esDelete.estado,
            creadoEn: esDelete.creadoEn,
            timestamp: new Date(),
          },
        });
      } catch (kafkaError) {
        console.error('Error publicando evento Kafka:', kafkaError.message);
        // No fallar la operación si Kafka falla
      }

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

  async createTiposEspacios(params: {
    nombre: string;
    descripcion: string;
  }): Promise<ResponseDTO<Espacios>> {
    try {
      const espacio = await this.espaciosRepository.createTiposEspacio(params);
      return dataResponseSuccess({ data: espacio });
    } catch (error) {
      console.log(error);
      return dataResponseError(error.message);
    }
  }
}
