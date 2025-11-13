import { ApiProperty, PickType } from "@nestjs/swagger";
import { Expose, Transform, TransformFnParams, Type } from "class-transformer";
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length } from "class-validator";

export class CreateUsuariosDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => value ? value.toString().trim() || null: value )
  @Type(() => String)
  @Length(2, 100, { message: 'Los nombres debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'los nombres debe estar en formato string' })
  @IsNotEmpty({ message: 'Los nombres no debe estar vacio' })
  @ApiProperty({ description: 'nombres del Usuario', required: true })
  nombres: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'el primer Apellido debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El primer Apellido debe estar en formato string' })
  @IsNotEmpty({ message: 'El primer Apellido no debe estar vacio' })
  @ApiProperty({ description: 'primer Apellido del Usuario', required: true })
  primerApellido: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'el segundo Apellido debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El segundo Apellido debe estar en formato string' })
  @IsNotEmpty({ message: 'El segundo Apellido no debe estar vacio' })
  @ApiProperty({ description: 'segundo Apellido del Usuario', required: true })
  segundoApellido: string;

  @Expose()
  @IsDateString()
  @ApiProperty({
    type: Date,
    description: 'FECHA Nacimiento del usuario.',
    default: '1986-10-16',
  })
  fechaNacimiento: Date;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'la nacionalidad debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'la nacionalidad debe estar en formato string' })
  @IsNotEmpty({ message: 'la nacionalidad no debe estar vacio' })
  @ApiProperty({ description: 'nacionalidad del Usuario', required: true })
  nacionalidad: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(8, 100, { message: 'el email debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El email debe estar en formato string' })
  @IsNotEmpty({ message: 'El email no debe estar vacio' })
  @IsEmail({}, { message: '$value no es un correo electrónico válido' })
  @ApiProperty({ description: 'email del Usuario', required: true })
  email: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'El userName debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El userName debe estar en formato string' })
  @IsNotEmpty({ message: 'El userName no debe estar vacio' })
  @ApiProperty({ description: 'userName del Usuario', required: true })
  userName: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'El password debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El password debe estar en formato string' })
  @IsNotEmpty({ message: 'El password no debe estar vacio' })
  @ApiProperty({ description: 'password del Usuario', required: true })
  password: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 100, { message: 'El celular debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El celular debe estar en formato string' })
  @IsNotEmpty({ message: 'El celular no debe estar vacio' })
  @ApiProperty({ description: 'celular del Usuario', required: true })
  celular: string;

}

export class UpdateUsuariosDto extends PickType(CreateUsuariosDto, [
  'nombres','primerApellido','segundoApellido','fechaNacimiento','email','celular'
]) {}

export class WhereUsuariosDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el nombre debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el nombre debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'nombre del usuario.', required: false })
  nombres: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el primerApellido debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el primerApellido debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'primerApellido del usuario.', required: false })
  primerApellido: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el segundoApellido debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el segundoApellido debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'segundoApellido del usuario.', required: false })
  segundoApellido: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el userName debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el userName debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'userName del usuario.', required: false })
  userName: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value ? value.toString().trim() : value))
  @Type(() => String)
  @Length(2, 500, { message: 'el celular debe ser de mas de 2 caracteres' })
  @IsString({ message: 'el celular debe ser tipo string' })
  @IsOptional()
  @ApiProperty({ description: 'celular del usuario.', required: false })
  celular: string;
}

export class FilterDto {
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
    type: WhereUsuariosDto,
  })
  where: WhereUsuariosDto;
}