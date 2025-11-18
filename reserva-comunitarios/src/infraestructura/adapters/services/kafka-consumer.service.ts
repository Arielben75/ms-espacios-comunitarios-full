import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infraestructura/database/prima.service';

export interface EspacioEvent {
  type: 'CREATED' | 'UPDATED' | 'DELETED';
  data: {
    id: number;
    nombre: string;
    tipoEspacioId: number;
    descripcion: string;
    capacidad: number;
    tarifaHora: number;
    tarifaDia: number;
    estado: number;
    creadoEn: Date;
    timestamp: Date;
  };
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:29092')
      .split(',');

    this.kafka = new Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'reservaciones-consumer',
      ),
      brokers,
      retry: {
        initialRetryTime: 1000,
        retries: 8,
        maxRetryTime: 30000,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: 'reservaciones-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'espacios-events' });
      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
      });
      this.isConnected = true;
      console.log(
        '✓ Kafka Consumer conectado y escuchando eventos de espacios',
      );
    } catch (error) {
      console.error('✗ Error al conectar Kafka Consumer:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('✓ Kafka Consumer desconectado');
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { topic, partition, message } = payload;

      if (!message || !message.value) {
        console.warn('⚠ Mensaje sin valor recibido, ignorando');
        return;
      }

      const event: EspacioEvent = JSON.parse(message.value.toString());

      console.log(
        `📨 Evento recibido - Tipo: ${event.type}, Espacio ID: ${event.data.id}`,
      );

      switch (event.type) {
        case 'CREATED':
          await this.handleEspacioCreated(event.data);
          break;
        case 'UPDATED':
          await this.handleEspacioUpdated(event.data);
          break;
        case 'DELETED':
          await this.handleEspacioDeleted(event.data);
          break;
        default:
          console.warn(`⚠ Tipo de evento desconocido: ${event.type}`);
      }

      console.log(`✓ Evento procesado exitosamente - Tipo: ${event.type}`);
    } catch (error) {
      console.error('✗ Error procesando mensaje de Kafka:', error.message);
      throw error;
    }
  }

  private async handleEspacioCreated(
    data: EspacioEvent['data'],
  ): Promise<void> {
    try {
      // Verificar si el espacio ya existe en la BD local
      const existing = await this.prisma.espacios.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        await this.prisma.espacios.create({
          data: {
            id: data.id,
            nombre: data.nombre,
            tipoEspacioId: data.tipoEspacioId,
            descripcion: data.descripcion,
            capacidad: data.capacidad,
            tarifaHora: data.tarifaHora,
            tarifaDia: data.tarifaDia,
            estado: data.estado,
            creadoEn: new Date(data.creadoEn),
          },
        });
        console.log(`✓ Espacio sincronizado: ${data.nombre} (ID: ${data.id})`);
      } else {
        console.log(
          `ℹ Espacio ya existe en BD: ${data.nombre} (ID: ${data.id})`,
        );
      }
    } catch (error) {
      console.error('✗ Error al sincronizar espacio creado:', error.message);
      throw error;
    }
  }

  private async handleEspacioUpdated(
    data: EspacioEvent['data'],
  ): Promise<void> {
    try {
      await this.prisma.espacios.update({
        where: { id: data.id },
        data: {
          nombre: data.nombre,
          tipoEspacioId: data.tipoEspacioId,
          descripcion: data.descripcion,
          capacidad: data.capacidad,
          tarifaHora: data.tarifaHora,
          tarifaDia: data.tarifaDia,
          estado: data.estado,
          actualizadoEn: new Date(),
        },
      });
      console.log(`✓ Espacio actualizado: ${data.nombre} (ID: ${data.id})`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Registro no encontrado, crear uno nuevo
          await this.handleEspacioCreated(data);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  private async handleEspacioDeleted(
    data: EspacioEvent['data'],
  ): Promise<void> {
    try {
      await this.prisma.espacios.update({
        where: { id: data.id },
        data: {
          estado: 0, // Marcar como inactivo en lugar de eliminar
          actualizadoEn: new Date(),
        },
      });
      console.log(
        `✓ Espacio marcado como inactivo: ${data.nombre} (ID: ${data.id})`,
      );
    } catch (error) {
      console.error('✗ Error al desactivar espacio:', error.message);
      throw error;
    }
  }

  isConsumerConnected(): boolean {
    return this.isConnected;
  }
}
