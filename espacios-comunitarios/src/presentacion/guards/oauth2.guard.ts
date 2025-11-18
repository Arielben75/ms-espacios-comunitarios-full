import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { OAuth2Service } from '../../infraestructura/adapters/services/oauth2.service';

@Injectable()
export class OAuth2Guard implements CanActivate {
  constructor(@Inject(OAuth2Service) private oauth2Service: OAuth2Service) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación no proporcionado',
      );
    }

    try {
      // Verificar que el token sea válido
      const isValid = await this.oauth2Service.verifyToken(token);

      if (!isValid) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      // Decodificar el token y almacenar la información en el request
      const decoded = this.oauth2Service.decodeToken(token);
      request.user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Error verificando token',
      );
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
