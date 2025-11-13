import { Injectable } from '@nestjs/common';
import { UserListOptions, UserRepositoryPort } from 'src/dominio/ports/repositories/user-repository.port';
import { User } from 'src/dominio/entities/user.entity';
import { PrismaService } from 'src/infraestructura/database/prima.service';
import { PaginationResult } from 'src/shared/dto/interface';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.usuarios.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.usuarios.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async create(userData:User): Promise<User> {
    if(userData.isNew()) {
      const user = await this.prisma.usuarios.create({
        data: {
          email: userData.email,
          password: userData.password, // Ya está hasheado
          nombres: userData.nombres,
          primerApellido: userData.primerApellido,
          segundoApellido: userData.segundoApellido,
          fechaNacimiento: userData.fechaNacimiento.toISOString(),
          nacionalidad: userData.nacionalidad,
          userName: userData.userName,
          celular: userData.celular,
          estado: userData.estado,
          creadoEn: userData.creadoEn,
        }
      });
      return this.toDomain(user);
    } else {
      throw new Error("El usuario Id no es nuevo.");
    }
  }

  async update(userData:User):Promise<User>{
    try {
      const user = await this.prisma.usuarios.update({
        where:{id:userData.id},
        data:{
          email: userData.email,
            password: userData.password,
            nombres: userData.nombres,
            primerApellido: userData.primerApellido,
            segundoApellido: userData.segundoApellido,
            fechaNacimiento: userData.fechaNacimiento.toISOString(),
            nacionalidad: userData.nacionalidad,
            userName: userData.userName,
            celular: userData.celular,
            estado: userData.estado,
            actualizadoEn: userData.creadoEn,
        }
      })
      return this.toDomain(user);
    } catch (error) {
      throw new Error(error.message);
      
    }
  }

  async delete(id:number):Promise<boolean> {
    try {
      const delteUser = await this.prisma.usuarios.delete({where:{id}});
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async listar(options: UserListOptions):Promise<PaginationResult<User>> {
    try {
       const { size, page = 1, orderDirection = 'desc', orderBy, searchCriteria } = options;

       const whereClause = searchCriteria ? searchCriteria.buildWhereClause() : {};

       const orderByClause:any = orderBy
      ? { [orderBy]: orderDirection }
      : { id: 'desc' };

      const users = await this.prisma.usuarios.findMany({
      where: whereClause,
      select: {
        id: true,
        celular: true,
        email: true,
        nombres: true,
        userName: true,
        primerApellido: true,
        segundoApellido: true,
        nacionalidad: true,
        fechaNacimiento: true,
        password: true,
        estado: true,
        creadoEn: true,
      },
      orderBy: orderByClause,
      skip: size ? (page > 0 ? (page - 1) * size : 0) : undefined,
      take: size,
    });

    const total = size ? await this.prisma.usuarios.count({ where: whereClause }) : users.length;

    // Convertir a entidades de dominio
    const domainUsers = users.map(user => this.toDomain(user));

    return {
      data: domainUsers,
      pagination: size ? {
        size,
        page,
        total,
      } : undefined,
    };

    } catch (error) {
       throw new Error(`Error al listar usuarios: ${error.message}`);
    }
  }

  async save(user: User): Promise<User> {
    console.log(user);
    const savedUser = await this.prisma.usuarios.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        password: user.password,
        nombres: user.nombres,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        fechaNacimiento: user.fechaNacimiento.toISOString(),
        nacionalidad: user.nacionalidad,
        userName: user.userName,
        celular: user.celular,
        estado: user.estado,
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        nombres: user.nombres,
        primerApellido: user.primerApellido,
        segundoApellido: user.segundoApellido,
        fechaNacimiento: user.fechaNacimiento.toISOString(),
        nacionalidad: user.nacionalidad,
        userName: user.userName,
        celular: user.celular,
        estado: user.estado,
        creadoEn: user.creadoEn,
      }
    });
    return this.toDomain(savedUser);
  }

  private toDomain(user: any): User {
    return User.fromPersistence(
      user.id,
      user.email,
      user.password,
      user.nombres,
      user.primerApellido,
      user.segundoApellido,
      user.fechaNacimiento,
      user.nacionalidad,
      user.userName,
      user.celular,
      user.estado,
      user.creadoEn
    );
  }
}