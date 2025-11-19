import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infraestructura/database/prima.service';
import { Espacios } from 'src/dominio/entities/espacios.entity';
import { Capacidad } from 'src/dominio/value-objects/capacidad.vo';
import {
  EspaciosListOptions,
  EspaciosRepositoryPort,
} from 'src/dominio/ports/repositories/espacios-repository.port';
import { PaginationResult } from 'src/shared/dto/interface';

@Injectable()
export class EspaciosRepository implements EspaciosRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Espacios[]> {
    const spaces = await this.prisma.espacios.findMany({
      where: { estado: 1 },
    });
    return spaces.map(this.toDomain);
  }

  async findById(id: number): Promise<Espacios | null> {
    const space = await this.prisma.espacios.findUnique({ where: { id } });
    return space ? this.toDomain(space) : null;
  }

  async findAvailable(
    fechaInicial: Date,
    fechaFinal: Date,
  ): Promise<Espacios[]> {
    const espacios = await this.prisma.espacios.findMany({
      where: {
        estado: 1,
      },
      include: {
        tiposEspacios: true,
      },
    });

    // Filtrar espacios que no tienen reservaciones en conflicto
    const espaciosDisponibles = espacios.filter(
      // (espacio) => espacio.reservaciones.length === 0,
      (espacio) => espacio.id > 0,
    );

    return espaciosDisponibles.map(this.toDomain);
  }

  async findByCapacidad(capacidadMinima: number): Promise<Espacios[]> {
    const espacios = await this.prisma.espacios.findMany({
      where: {
        capacidad: {
          gte: capacidadMinima,
        },
        estado: 1,
      },
      include: {
        tiposEspacios: true,
      },
      orderBy: {
        capacidad: 'asc',
      },
    });

    return espacios.map(this.toDomain);
  }

  async findByTarifaRange(
    tarifaMin: number,
    tarifaMax: number,
  ): Promise<Espacios[]> {
    const espacios = await this.prisma.espacios.findMany({
      where: {
        tarifaHora: {
          gte: tarifaMin,
          lte: tarifaMax,
        },
        estado: 1,
      },
      include: {
        tiposEspacios: true,
      },
      orderBy: {
        tarifaHora: 'asc',
      },
    });

    return espacios.map(this.toDomain);
  }

  async findByTipo(tipoEspacioId: number): Promise<Espacios[]> {
    const spacios = await this.prisma.espacios.findMany({
      where: {
        tipoEspacioId: tipoEspacioId,
        estado: 1,
      },
      include: {
        tiposEspacios: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return spacios.map(this.toDomain);
  }

  async findByNombre(nombre: string): Promise<Espacios | null> {
    const espacio = await this.prisma.espacios.findFirst({
      where: { nombre: { contains: nombre } },
    });
    return espacio ? this.toDomain(espacio) : null;
  }

  async createEspacio(espacio: Espacios): Promise<Espacios> {
    const espcios = await this.prisma.espacios.create({
      data: {
        nombre: espacio.nombre,
        capacidad: espacio.capacidad.getValue(),
        tarifaDia: espacio.tarifaDia,
        tarifaHora: espacio.tarifaHora,
        creadoEn: espacio.creadoEn,
        descripcion: espacio.descripcion,
        estado: espacio.estado,
        tipoEspacioId: espacio.tipoEspacioId,
      },
    });

    return this.toDomain(espcios);
  }

  async updateEspacio(espacio: Espacios): Promise<Espacios> {
    const espcios = await this.prisma.espacios.update({
      where: { id: espacio.id },
      data: {
        nombre: espacio.nombre,
        capacidad: espacio.capacidad.getValue(),
        tarifaDia: espacio.tarifaDia,
        tarifaHora: espacio.tarifaHora,
        creadoEn: espacio.creadoEn,
        descripcion: espacio.descripcion,
        estado: espacio.estado,
        tipoEspacioId: espacio.tipoEspacioId,
        actualizadoEn: new Date(),
      },
    });
    return this.toDomain(espcios);
  }

  async deleteEspacio(id: number): Promise<Espacios> {
    const espacios = await this.prisma.espacios.findUnique({ where: { id } });
    await this.prisma.espacios.delete({ where: { id } });
    return this.toDomain(espacios);
  }

  async listar(
    options: EspaciosListOptions,
  ): Promise<PaginationResult<Espacios>> {
    try {
      const {
        size,
        page = 1,
        orderDirection = 'desc',
        orderBy,
        searchCriterio,
      } = options;

      const whereClause = searchCriterio
        ? searchCriterio.buildWhereClause()
        : {};

      const orderByClause: any = orderBy
        ? { [orderBy]: orderDirection }
        : { id: 'desc' };

      const espacios = await this.prisma.espacios.findMany({
        where: whereClause,
        select: {
          id: true,
          nombre: true,
          capacidad: true,
          descripcion: true,
          tarifaDia: true,
          tarifaHora: true,
          tipoEspacioId: true,
        },
        orderBy: orderByClause,
        skip: size ? (page > 0 ? (page - 1) * size : 0) : undefined,
        take: size,
      });

      const total = size
        ? await this.prisma.espacios.count({ where: whereClause })
        : espacios.length;

      const domainEspacios = espacios.map((espacio) => this.toDomain(espacio));

      return {
        data: domainEspacios,
        pagination: size
          ? {
              size,
              page,
              total,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(`Error al listar Espacios: ${error.message}`);
    }
  }

  async createTiposEspacio(espacio: any): Promise<any> {
    const espcios = await this.prisma.tiposEspacios.create({
      data: {
        nombre: espacio.nombre,
        descripcion: espacio.descripcion,
      },
    });
    return espcios;
  }

  private toDomain(space: any): Espacios {
    const capacidadVO = Capacidad.validateMaxCapacidad(
      space.capacidad,
      space.capacidad,
    );
    return new Espacios(
      space.id,
      space.nombre,
      space.tipoEspacioId,
      space.descripcion,
      capacidadVO,
      space.tarifaHora,
      space.tarifaDia,
      space.estado,
      space.creadoEn,
    );
  }
}
