import { User } from "src/dominio/entities/user.entity";
import { UserSearchCriteria } from "src/dominio/value-objects/user-filter.vo";
import { PaginationOptions, PaginationResult } from "src/shared/dto/interface";

export interface UserListOptions extends PaginationOptions {
  searchCriteria?: UserSearchCriteria;
}

export interface UserRepositoryPort {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: User): Promise<User>;
  update(userData: User): Promise<User>;
  delete(id:number):Promise<boolean>;
  listar(list:UserListOptions):Promise<PaginationResult<User>>
}