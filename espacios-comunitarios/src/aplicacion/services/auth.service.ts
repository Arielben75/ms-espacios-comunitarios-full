import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../dominio/entities/user.entity';
import {
  UserListOptions,
  UserRepositoryPort,
} from '../../dominio/ports/repositories/user-repository.port';
import { compare } from 'bcrypt';
import {
  dataResponseError,
  dataResponseFormat,
  dataResponseSuccess,
  IResponse,
  IResponseDTO,
  ResponseDTO,
} from 'src/shared/dto/response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Password } from 'src/dominio/value-objects/password.vo';
import { ListUsuariosDto } from 'src/presentacion/interfaces/user-filter';
import { PaginationResult } from 'src/shared/dto/interface';
import { UserSearchCriteria } from 'src/dominio/value-objects/user-filter.vo';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    nombres: string,
    primerApellido: string,
    segundoApellido: string,
    fechaNacimiento: Date,
    nacionalidad: string,
    userName: string,
    celular: string,
  ): Promise<ResponseDTO<User>> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) return dataResponseError('El usuario ya existe');

      const user = User.create(
        email,
        password,
        nombres,
        primerApellido,
        segundoApellido,
        fechaNacimiento,
        nacionalidad,
        userName,
        celular,
        1,
      );
      const hashedPassword = await this.hashPassword(user._password);
      user._password.setValue(hashedPassword);
      const usuario = await this.userRepository.update(user);
      return dataResponseSuccess({ data: usuario });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async login(email: string, password: string): Promise<IResponse> {
    try {
      const usuario = await this.userRepository.findByEmail(email);
      if (
        !usuario /*  || !await this.verifyPassword(password, user.password) */
      )
        return dataResponseError('El usuario no existe');

      const comparePasword = await this.verifyPassword(
        password,
        usuario.password,
      );
      if (!comparePasword)
        return dataResponseError('La contraseña es incorrecta.', {
          status: 401,
        });

      const token = await this.generateJWT(usuario);
      return dataResponseSuccess({
        data: {
          userName: usuario.userName,
          email: usuario.email,
          token: token.response.data.token,
          tokenRefresh: token.response.data.tokenRefresh,
        },
      });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async updateUsuarios(
    id: number,
    email: string,
    password: string,
    nombres: string,
    primerApellido: string,
    segundoApellido: string,
    fechaNacimiento: Date,
    nacionalidad: string,
    userName: string,
    celular: string,
  ): Promise<ResponseDTO<User>> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) return dataResponseError('El usuario ya existe');

      const user = User.update(
        id,
        email,
        password,
        nombres,
        primerApellido,
        segundoApellido,
        fechaNacimiento,
        nacionalidad,
        userName,
        celular,
        1,
      );

      const hashedPassword = await this.hashPassword(user._password);
      user._password.setValue(hashedPassword);
      const usuario = await this.userRepository.update(user);
      return dataResponseSuccess({ data: usuario });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async deleteUser(id: number): Promise<ResponseDTO<any>> {
    try {
      const esDelete = await this.userRepository.delete(id);
      return dataResponseSuccess({ data: { delete: esDelete } });
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  async listUsuarios(
    dto: ListUsuariosDto,
  ): Promise<ResponseDTO<PaginationResult<User>>> {
    try {
      // Convertir DTO de presentación a criterios de dominio
      const searchCriteria = dto.where
        ? UserSearchCriteria.fromDto(dto.where)
        : undefined;

      const options: UserListOptions = {
        page: dto.page,
        size: dto.size,
        orderBy: dto.orderBy,
        orderDirection: dto.orderDirection,
        searchCriteria,
      };

      const result = await this.userRepository.listar(options);
      return dataResponseFormat(result);
    } catch (error) {
      return dataResponseError(error.message);
    }
  }

  private async hashPassword(password: Password): Promise<string> {
    return await bcrypt.hash(password.getValue(), 12);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await compare(password, String(hashedPassword));
  }

  private async generateJWT(user: User): Promise<IResponse> {
    try {
      const [token, tokenRefresh] = await Promise.all([
        this.jwtService.sign(
          {
            nombre: user.nombres,
            primerApellido: user.primerApellido,
            segundoApellido: user.segundoApellido,
            fechaNacimiento: user.fechaNacimiento,
            nacionalidad: user.nacionalidad,
            userName: user.userName,
            celular: user.celular,
          },
          {
            expiresIn: `3600S`,
            secret: process.env.JWT_SECRET,
          },
        ),
        this.jwtService.sign(
          {
            nombre: user.nombres,
            primerApellido: user.primerApellido,
            segundoApellido: user.segundoApellido,
            fechaNacimiento: user.fechaNacimiento,
            nacionalidad: user.nacionalidad,
            userName: user.userName,
            celular: user.celular,
          },
          { expiresIn: `3600S` },
        ),
      ]);
      return dataResponseSuccess({ data: { token, tokenRefresh } });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
