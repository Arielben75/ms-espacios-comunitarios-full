import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateReservacionDto {
  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el usuario debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'identificador unico del usuario.',
    required: true,
  })
  usuarioId: number;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el espacio debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'identificador unico del espacio.',
    required: true,
  })
  espacioId: number;

  @Expose()
  @IsDateString()
  @ApiProperty({
    type: Date,
    description: 'FECHA inicial de la reserva.',
    default: '1986-10-16',
  })
  fechaInical: Date;

  @Expose()
  @IsDateString()
  @ApiProperty({
    type: Date,
    description: 'FECHA final de la reserva.',
    default: '1986-10-16',
  })
  fechaFinal: Date;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La horas Reserva debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'horas Reserva del espacio.',
    required: true,
  })
  horasReserva: number;
}

export class UpdateReservacionDto {
  @ApiProperty({
    description: 'Nueva fecha y hora de inicio de la reservación',
    example: '2024-01-15T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha inicial debe ser una fecha válida' })
  fechaInicial?: Date;

  @ApiProperty({
    description: 'Nueva fecha y hora de fin de la reservación',
    example: '2024-01-15T17:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha final debe ser una fecha válida' })
  fechaFinal?: Date;

  @ApiProperty({
    description: 'Nuevo número de horas de la reservación',
    example: 6,
    minimum: 1,
    maximum: 24,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Las horas de reserva deben ser un número' })
  @Min(1, { message: 'La reserva debe ser de al menos 1 hora' })
  @Max(24, { message: 'La reserva no puede exceder 24 horas' })
  horasReserva?: number;
}

export class DisponibilidadQueryDto {
  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el espacioId debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'El ID del espacio es requerido',
    required: true,
  })
  espacioId: number;

  @ApiProperty({
    description: 'Fecha y hora de inicio a verificar',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsNotEmpty({ message: 'La fecha inicial es requerida' })
  @IsString({ message: 'La fecha inicial debe ser una cadena de texto' })
  fechaInicial: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) =>
    value ? value.toString().trim() || null : value,
  )
  @Type(() => String)
  @Length(2, 100, {
    message:
      'El descripcion debe ser de mas de 2 caracteres asta un maximo de 100',
  })
  @IsString({ message: 'La fecha final debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fecha final es requerida' })
  @ApiProperty({
    description: 'Fecha y hora de fin a verificar',
    example: '2024-01-15T17:00:00.000Z',
  })
  fechaFinal: string;
}

export class ReservacionResponseDto {
  @ApiProperty({ description: 'ID de la reservación' })
  id: number;

  @ApiProperty({ description: 'ID del usuario' })
  usuarioId: number;

  @ApiProperty({ description: 'ID del espacio' })
  espacioId: number;

  @ApiProperty({ description: 'Fecha y hora de inicio' })
  fechaInicial: Date;

  @ApiProperty({ description: 'Fecha y hora de fin' })
  fechaFinal: Date;

  @ApiProperty({ description: 'Número de horas reservadas' })
  horasReserva: number;

  @ApiProperty({ description: 'ID del estado de la reservación' })
  estadoReservacionId: number;

  @ApiProperty({ description: 'Importe total de la reservación' })
  importeTotal: number;

  @ApiProperty({ description: 'ID de transacción', required: false })
  transaccionId?: string;

  @ApiProperty({ description: 'ID del evento en calendario', required: false })
  eventoCalendarioId?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  creadoEn: Date;

  @ApiProperty({ description: 'Estado actual de la reservación' })
  status: string;
}
