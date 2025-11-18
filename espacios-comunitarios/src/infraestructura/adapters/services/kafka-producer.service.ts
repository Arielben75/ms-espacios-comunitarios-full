import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

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
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:29092')
      .split(',');

    this.kafka = new Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'espacios-producer',
      ),
      brokers,
      retry: {
        initialRetryTime: 1000,
        retries: 8,
        maxRetryTime: 30000,
      },
    });

    this.producer = this.kafka.producer({
      transactionTimeout: 30000,
      maxInFlightRequests: 1,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✓ Kafka Producer conectado exitosamente');
    } catch (error) {
      console.error('✗ Error al conectar Kafka Producer:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('✓ Kafka Producer desconectado');
    }
  }

  async publishEspacioEvent(event: EspacioEvent): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer no está conectado');
    }

    try {
      await this.producer.send({
        topic: 'espacios-events',
        messages: [
          {
            key: `espacio-${event.data.id}-${event.type}`,
            value: JSON.stringify(event),
            headers: {
              'event-type': event.type,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });

      console.log(
        `✓ Evento de espacio publicado: ${event.type} (ID: ${event.data.id})`,
      );
    } catch (error) {
      console.error('✗ Error al publicar evento de espacio:', error.message);
      throw error;
    }
  }

  async publishBatch(events: EspacioEvent[]): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer no está conectado');
    }

    try {
      const messages = events.map((event) => ({
        key: `espacio-${event.data.id}-${event.type}`,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.type,
          timestamp: new Date().toISOString(),
        },
      }));

      await this.producer.send({
        topic: 'espacios-events',
        messages,
      });

      console.log(`✓ Lote de ${events.length} eventos publicados exitosamente`);
    } catch (error) {
      console.error('✗ Error al publicar lote de eventos:', error.message);
      throw error;
    }
  }

  isProducerConnected(): boolean {
    return this.isConnected;
  }
}
