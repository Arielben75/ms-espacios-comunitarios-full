import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, TransformFnParams, Type } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class loginDto {
  @Expose()
  @Transform(({ value }: TransformFnParams) => value ? value.toString().trim() || null: value )
  @Type(() => String)
  @Length(2, 100, { message: 'El email de usuario debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El email de usuario debe estar en formato string' })
  @IsNotEmpty({ message: 'El email de usuario no debe estar vacio' })
  @ApiProperty({ description: 'email del Usuario', required: true })
  email: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => value ? value.toString().trim() || null: value )
  @Type(() => String)
  @Length(2, 100, { message: 'El password debe ser de mas de 2 caracteres asta un maximo de 100' })
  @IsString({ message: 'El password debe estar en formato string' })
  @IsNotEmpty({ message: 'El password no debe estar vacio' })
  @ApiProperty({ description: 'password del Usuario', required: true })
  password: string;
}