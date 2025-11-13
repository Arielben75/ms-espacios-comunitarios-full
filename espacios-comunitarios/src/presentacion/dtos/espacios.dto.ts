import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from "class-validator";

export class CreateEspaciosDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => value ? value.toString().trim() || null: value )
  @Type(() => String)
  @Length(2, 100, { message: 'El nombre debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El nombre debe estar en formato string' })
  @IsNotEmpty({ message: 'El nombre no debe estar vacio' })
  @ApiProperty({ description: 'nombre del espacio', required: true })
  nombre: string;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el tipo espacio debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'identificador unico del tipo espacio.',
    required: true,
  })
  tipoEspacioId: number;

  @Expose()
  @Transform(({ value }: TransformFnParams) => value ? value.toString().trim() || null: value )
  @Type(() => String)
  @Length(2, 100, { message: 'El descripcion debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El descripcion debe estar en formato string' })
  @IsOptional()
  @ApiProperty({ description: 'descripcion del espacio', required: false })
  descripcion?: string;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La capacidad debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'capacidad del tipo espacio.',
    required: true,
  })
  capacidad: number;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La tarifaHora debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'tarifaHora del tipo espacio.',
    required: true,
  })
  tarifaHora: number;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La tarifaDia debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'tarifaDia del tipo espacio.',
    required: true,
  })
  tarifaDia: number;
}

export class WhereEspaciosDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el nombre debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el nombre debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'nombre del usuario.', required: false })
  nombre?: string;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el tipo espacio debe ser tipo numero' },
  )
  @IsOptional()
  @ApiProperty({
    description: 'identificador unico del tipo espacio.',
    required: false,
  })
  tipoEspacioId?: number;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'La capacidad ser tipo numero' },
  )
  @IsOptional()
  @ApiProperty({
    description: 'capacidad tipo espacio.',
    required: false,
  })
  capacidad?: number;
}

export class FilterEspaciosDto {
  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'el size debe ser tipo numero' },
  )
  @ApiProperty({
    description: 'tamaño de la lista.',
    required: true,
  })
  size: number;

  @Expose()
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { message: 'la pagina debe ser numero' },
  )
  @IsOptional()
  @ApiProperty({
    description: 'pagina de la lista.',
    required: false,
  })
  page: number;

  @Expose()
  @IsOptional()
  @ApiProperty({
    description: 'variable para ordenar.',
    required: false,
  })
  orderBy: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    description: 'direccion de ordenamiento.',
    required: false,
  })
  orderDirection: "asc" | "desc";

  @Expose()
  @IsObject({ message: 'where debe ser un objeto' })
  @IsOptional()
  @ApiProperty({
    description: 'Filtros para el listado de ingresos',
    required: false,
    type: WhereEspaciosDto,
  })
  where: WhereEspaciosDto;
}