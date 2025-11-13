import { PaginationOptions } from "src/shared/dto/interface";

export class UserFilterDto {
  celular?: string;
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  userName?: string;
}

export class ListUsuariosDto  implements PaginationOptions {
  page: number;
  size: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: UserFilterDto;
}

export interface tokenPayload {
  id: number;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  userName: string;
  celular: string;
  email:string;
}