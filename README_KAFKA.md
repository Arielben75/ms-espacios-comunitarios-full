# Microservicios de Espacios Comunitarios con Event-Driven Architecture

## Descripción General

Este proyecto implementa una arquitectura de microservicios basada en eventos usando NestJS, PostgreSQL y Kafka. La solución consta de dos microservicios principales:

1. **espacios-comunitarios**: Servicio que gestiona espacios comunitarios
2. **reserva-comunitarios**: Servicio que gestiona reservaciones de espacios

### Comunicación Event-Driven

En lugar de comunicación HTTP síncrona, los microservicios se comunican mediante eventos publicados en Kafka:

- **espacios-comunitarios** → Publica eventos cuando se crean, actualizan o eliminan espacios
- **reserva-comunitarios** → Consume estos eventos y sincroniza su base de datos local

## Infraestructura con Docker Compose

La infraestructura completa está definida en `docker-compose.yml` e incluye:

### Servicios de Kafka

- **zookeeper**: Coordinador del cluster de Kafka
- **kafka**: Broker de Kafka (puerto 9092)
- **kafka-init**: Servicio que crea los topics necesarios automáticamente

### Bases de Datos

- **dba**: PostgreSQL para microservicio de espacios (puerto 5432)
- **dbb**: PostgreSQL para microservicio de reservaciones (puerto 5433)

### Microservicios

- **service-a1**: Réplica 1 del servicio de espacios (puerto 3000)
- **service-a2**: Réplica 2 del servicio de espacios (puerto 3001)
- **service-b**: Servicio de reservaciones (puerto 3002)
- **proxy**: Nginx como balanceador de carga (puerto 8080)
- **frontend**: Aplicación frontend (puerto 8081)

## Topics de Kafka

El sistema utiliza los siguientes topics:

- **espacios-events**: Eventos de creación, actualización y eliminación de espacios
- **reservaciones-events**: (Configurado para uso futuro)

## Instalación y Ejecución

### Requisitos Previos

- Docker y Docker Compose instalados
- Git para clonar el repositorio

### Pasos para Ejecutar

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd reservas-espacios-comunitarios
   ```

2. **Configurar variables de entorno**

   ```bash
   # El archivo .env ya contiene todas las configuraciones necesarias
   cat .env
   ```

3. **Iniciar la infraestructura**

   ```bash
   docker compose up -d
   ```

   Esto iniciará:

   - Zookeeper y Kafka
   - PostgreSQL (dos instancias)
   - Los tres microservicios
   - Nginx y Frontend

4. **Verificar que todo está funcionando**

   ```bash
   # Verificar contenedores
   docker compose ps

   # Ver logs de un servicio específico
   docker compose logs -f espacios-comunitarios-app
   docker compose logs -f reserva-comunitarios-app
   docker compose logs -f kafka
   ```

### URLs de Acceso

- **Microservicio de Espacios (Load Balancer)**: http://localhost:8080
- **Microservicio de Espacios - Instancia 1**: http://localhost:3000
- **Microservicio de Espacios - Instancia 2**: http://localhost:3001
- **Microservicio de Reservaciones**: http://localhost:3002
- **Frontend**: http://localhost:8081
- **Swagger UI (Espacios)**: http://localhost:3000/api/docs
- **Swagger UI (Reservaciones)**: http://localhost:3002/api/docs

## Flujo de Eventos

### 1. Crear un Espacio

```bash
curl -X POST http://localhost:8080/espacios/registrar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Salón A",
    "tipoEspacioId": 1,
    "descripcion": "Salón para eventos",
    "capacidad": 50,
    "tarifaHora": 25.50,
    "tarifaDia": 150.00
  }'
```

**Resultado**:

1. El espacio se crea en la BD de `espacios-comunitarios`
2. Se publica un evento `CREATED` en el topic `espacios-events`
3. El consumidor de Kafka en `reserva-comunitarios` recibe el evento
4. El espacio se sincroniza automáticamente en la BD de `reserva-comunitarios`

### 2. Actualizar un Espacio

```bash
curl -X PATCH http://localhost:8080/espacios/update/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Salón A Actualizado",
    "tipoEspacioId": 1,
    "descripcion": "Descripción actualizada",
    "capacidad": 60,
    "tarifaHora": 30.00,
    "tarifaDia": 180.00
  }'
```

**Resultado**:

1. El espacio se actualiza en `espacios-comunitarios`
2. Se publica un evento `UPDATED`
3. El evento se sincroniza en `reserva-comunitarios`

### 3. Eliminar un Espacio

```bash
curl -X DELETE http://localhost:8080/espacios/delete/1 \
  -H "Authorization: Bearer <token>"
```

**Resultado**:

1. El espacio se marca como inactivo en `espacios-comunitarios`
2. Se publica un evento `DELETED`
3. El espacio se marca como inactivo en `reserva-comunitarios`

## Monitoreo de Eventos

Para ver los eventos en tiempo real, puede usar las siguientes opciones:

### 1. Ver logs del consumer en reserva-comunitarios

```bash
docker compose logs -f reserva-comunitarios-app | grep -E "📨|✓|✗"
```

### 2. Usar kafka console consumer (desde dentro del contenedor)

```bash
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic espacios-events \
  --from-beginning
```

## Estructura del Proyecto

```
reservas-espacios-comunitarios/
├── docker-compose.yml              # Configuración de toda la infraestructura
├── nginx.conf                        # Configuración de Nginx
├── .env                              # Variables de entorno
├── espacios-comunitarios/
│   ├── src/
│   │   ├── infraestructura/
│   │   │   └── adapters/
│   │   │       └── services/
│   │   │           └── kafka-producer.service.ts    # Publicador de eventos
│   │   ├── aplicacion/
│   │   │   └── services/
│   │   │       └── espacios.service.ts              # Lógica de negocio
│   │   └── modules/
│   │       └── espacios.module.ts                   # Registro de servicios
│   └── package.json
├── reserva-comunitarios/
│   ├── src/
│   │   ├── infraestructura/
│   │   │   └── adapters/
│   │   │       └── services/
│   │   │           └── kafka-consumer.service.ts    # Consumidor de eventos
│   │   └── modules/
│   │       └── reservaciones.module.ts              # Registro de servicios
│   ├── prisma/
│   │   ├── schema.prisma                            # Schema con tabla Espacios
│   │   └── migrations/
│   │       └── 20251113021846_add_espacios_table/   # Migración de Espacios
│   └── package.json
└── README.md
```

## Dependencias Agregadas

### Para ambos microservicios

```json
{
  "@nestjs/microservices": "^11.0.1",
  "kafkajs": "^2.2.4"
}
```

## Variables de Entorno Clave

```env
# Kafka
KAFKA_BROKERS=kafka:29092                # Host y puerto del broker Kafka
KAFKA_CLIENT_ID=espacios-producer        # ID del cliente (diferente por servicio)

# PostgreSQL
DATABASE_URL=postgresql://...            # Conexión a BD de espacios
DATABASE_URL_B=postgresql://...          # Conexión a BD de reservaciones
```

## Mantenimiento

### Detener todos los servicios

```bash
docker compose down
```

### Limpiar todo (incluyendo volúmenes)

```bash
docker compose down -v
```

### Reiniciar un servicio específico

```bash
docker compose restart reserva-comunitarios-app
```

### Verificar el estado de Kafka

```bash
# Listar topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describir un topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --describe \
  --topic espacios-events
```

## Troubleshooting

### Problema: Kafka no se conecta

**Solución**: Verificar que zookeeper esté listo antes de kafka

```bash
docker compose logs zookeeper
docker compose logs kafka
```

### Problema: Los eventos no se sincronizan

**Solución**: Verificar los logs del consumer

```bash
docker compose logs reserva-comunitarios-app
```

### Problema: Tablas no existen en la BD de reservaciones

**Solución**: Ejecutar las migraciones manualmente

```bash
docker exec reserva-comunitarios-app npx prisma migrate deploy
```

## Arquitectura de Eventos

```
┌─────────────────────────────────────────────────────────────┐
│                    ESPACIOS-COMUNITARIOS                    │
│                                                              │
│  ┌──────────────────┐                                       │
│  │ Controller       │                                       │
│  └────────┬─────────┘                                       │
│           │ (POST/PATCH/DELETE)                            │
│  ┌────────▼─────────┐                                       │
│  │ EspaciosService  │                                       │
│  └────────┬─────────┘                                       │
│           │ Crear/Actualizar/Eliminar                      │
│  ┌────────▼──────────────┐                                  │
│  │ Repository (Prisma)  │                                  │
│  └────────┬──────────────┘                                  │
│           │                                                 │
│           ├──→ BD PostgreSQL (dba)                         │
│           │                                                 │
│           └──→ PublishEvent()                              │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
                    KAFKA Topic: espacios-events
                       │
┌──────────────────────┼──────────────────────────────────────┐
│                      │                                      │
│           KafkaConsumerService                             │
│           (onModuleInit)                                   │
│                      │                                      │
│           ┌──────────▼────────────┐                        │
│           │ handleMessage()       │                        │
│           └──────────┬────────────┘                        │
│                      │                                      │
│           ┌──────────▼──────────────┐                      │
│           │ Parsear evento         │                      │
│           └──────────┬──────────────┘                      │
│                      │                                      │
│           ┌──────────▼────────────────────┐                │
│           │ Ejecutar acción según tipo:  │                │
│           │ - handleEspacioCreated       │                │
│           │ - handleEspacioUpdated       │                │
│           │ - handleEspacioDeleted       │                │
│           └──────────┬────────────────────┘                │
│                      │                                      │
│           ┌──────────▼──────────────┐                      │
│           │ Repository (Prisma)    │                      │
│           └──────────┬──────────────┘                      │
│                      │                                      │
│                      └──→ BD PostgreSQL (dbb)              │
│                                                              │
│                RESERVA-COMUNITARIOS                         │
└──────────────────────────────────────────────────────────────┘
```

## Notas Importantes

1. **Sincronización Lazy**: Los espacios se sincronizan cuando se crean eventos. Si un espacio no existe en `reserva-comunitarios`, se crea automáticamente.

2. **Tolerancia a Fallos**: Si Kafka no está disponible, los microservicios intentarán reconectarse automáticamente (máx. 8 reintentos).

3. **Escalabilidad**: La arquitectura permite fácilmente:

   - Agregar más replicas del servicio de espacios
   - Agregar más particiones en Kafka
   - Agregar nuevos servicios consumidores

4. **Persistencia**: Todos los eventos se almacenan en Kafka con política de retención de 168 horas (7 días).

## Próximos Pasos

1. Implementar eventos de reservaciones
2. Agregar Dead Letter Queue para eventos fallidos
3. Implementar transacciones distribuidas
4. Agregar métricas y monitoreo con Prometheus
5. Implementar circuit breakers

---

**Autor**: Ariel Torricos Padilla  
**Fecha de Creación**: 2025-11-12  
**Última Actualización**: 2025-11-13
