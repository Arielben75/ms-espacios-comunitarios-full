import { ApiProperty, PickType } from '@nestjs/swagger';
import { isNumber } from 'class-validator';

export class PaginationStructDTO {
  // @ApiProperty({ description: 'Total de registros' })
  // from?: number;

  @ApiProperty({ description: 'Total de registros' })
  total?: number;

  @ApiProperty({ description: 'Pagina actual' })
  page?: number; // skip

  @ApiProperty({ description: 'Limite de registros' })
  size?: number; // take
}

export class ResponseStructDTO {
  // data: any;

  @ApiProperty({ type: PaginationStructDTO, required: false, nullable: true })
  pagination: PaginationStructDTO;

  @ApiProperty({
    type: Object,
    required: false,
    nullable: true,
    example: { field: ['error validation 1', 'error validation 2'] },
  })
  validationErrors?: ValidationErrorsType<any>;
}

export class ApiOkResponseDto {
  @ApiProperty({ description: 'Si la respuesta es de error' })
  error: boolean;

  @ApiProperty({ description: 'Menasje de la respuesta' })
  message: string;

  @ApiProperty({
    type: ResponseStructDTO,
    description: 'Estructura de respuesta',
  })
  response: any;

  @ApiProperty({ description: 'Codigo de estado de la respuesta' })
  status: number;

  @ApiProperty({ description: 'Si la respuesta es de cache', nullable: true })
  cache?: boolean;
}

export class ApiResponseError {
  @ApiProperty({ description: 'Si la respuesta es de error' })
  error: boolean;

  @ApiProperty({ description: 'Menasje de la respuesta' })
  message: string;

  @ApiProperty({
    type: PickType(ResponseStructDTO, ['validationErrors']),
    description: 'Estructura de respuesta',
  })
  response: any;

  @ApiProperty({ description: 'Codigo de estado de la respuesta' })
  status: number;

  @ApiProperty({ description: 'Si la respuesta es de cache', nullable: true })
  cache?: boolean;
}

export interface IResponse {
  error: boolean;
  message: string;
  response: any;
  status: number;
}

export interface IResponseDTOBody<T> {
  data?: T;
  pagination?: {
    total: number;
    page: number;
    size: number;
  };
  validationErrors?: ValidationErrorsType<T>;
  suggestions?: SuggestionsType<T>;
}

/**
 * Tipo de respuesta para todas las peticiones
 * @response response: T
 */
export type IResponseDTO<T> = {
  error: boolean;
  message: string;
  response: T;
  status: number;
};

/**
 * Dto para tipo de respuesta con tipo
 */
export type ResponseDTO<T> = {
  error: boolean;
  message: string;
  response: IResponseDTOBody<T> | null;
  status: number;
  cache?: boolean;
};

/* ---------------------------------------------------------------------------------------------- */
export type ValidationErrorsType<T> = {
  [key in keyof T]: Array<string>;
};

export type SuggestionsType<T> = {
  [key in keyof T]: Array<string>;
};

/**
 * @param response,
 * @param param1, optional data, this methos have values default
 * @returns Data default of Type IResponse
 */
export const dataResponseFormat = (
  response,
  { error = false, message = 'operacion Exitosa', status = 201 } = {},
): IResponse => {
  return { error, message, response, status };
};

/**
 * @param response,
 * @param param1, optional data, this methos have values default
 * @returns Data default of Type IResponse
 */
export const dataResponseSuccess = <T>(
  response: IResponseDTOBody<T>,
  { error = false, message = 'operacion Exitosa', status = 200 }: Partial<ResponseDTO<T>> = {},
): ResponseDTO<T> => {
  return { error, message, response, status };
};

/* ---------------------------------------------------------------------------------------------- */
/**
 * @param response,
 * @param param1, optional data, this methos have values default
 * @returns Data default of Type IResponse
 */
export const dataResponseError = <T>(
  message = 'ocurrio un error',
  { error = true, status = 422, response = null } = {},
): ResponseDTO<T> => {
  return { error, message, response, status };
};