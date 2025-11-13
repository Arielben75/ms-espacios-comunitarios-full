import { ExecutionContext, UnauthorizedException, UseGuards, Version, applyDecorators, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TokenAuthGuard } from 'src/presentacion/guards/token-auth.guard';

export const BearerAuthToken = () => {
  return applyDecorators(UseGuards(TokenAuthGuard), ApiBearerAuth());
};

export const VersionDescription = (version: string, summary: string) => {
  return applyDecorators(Version(version), ApiOperation({ summary }));
};

export const User = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
    });

    try {
      const decoded = jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  },
);
