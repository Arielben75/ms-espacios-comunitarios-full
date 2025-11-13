import { BadRequestException, CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { decode } from 'jsonwebtoken';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean>{
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ApiUnauthorizedError('Solitud realizada sin token')
    }

    const [bearer, token] = authHeader.split(' ');
    if (`${bearer}`.toLowerCase() !== 'bearer' || !token) {
      throw new ApiUnauthorizedError(
        'debe enviar el token con el header `Authorization: bearer {{token}}`.',
      );
    }
    const tokenDecoded: IToken = await this.decodeToken(token);
    if (!tokenDecoded) throw new ApiUnauthorizedError('Usuario no autenticado y/o token no válido');

    request.userHeader = tokenDecoded;
    return true;

  }

  async decodeToken(token:string): Promise<IToken> {
    const decoded = decode(token);
    if(!decoded) throw new ApiUnauthorizedError('TOKEN INVALIDO');

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        }
      );
      return {
        id: payload.id,
        celular: payload.celular,
        expireIn: payload.expireIn,
        nombres: payload.nombres,
        primerApellido: payload.primerApellido,
        segundoApellido: payload.segundoApellido,
        token,
        userName:payload.userName,
      }
    } catch {
      throw new ApiUnauthorizedError('TOKEN NO AUTORIZADO');
    }
  }
}


export class ApiUnauthorizedError extends UnauthorizedException {
  constructor(
    message = 'usuario no autenticado y/o token no válido',
    response = null,
    status = 401,
    error = true,
  ) {
    super({ error, message, status, response });
  }
}

export class ApiBadRequestError extends BadRequestException {
  constructor(message = 'Ocurrio un error', response = null, status = 400, error = true) {
    super({ error, message, status, response });
  }
}

export interface IToken {
  id: number;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  userName: string;
  celular: string;
  expireIn: number;
  token: string;
  client?: string;
}


export const AuthUser = createParamDecorator((data: unknown, context: ExecutionContext): IToken => {
  const request = context.switchToHttp().getRequest();
  return request.userHeader ?? undefined;
});
