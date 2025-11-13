import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataBaseModule } from 'src/modules/database.module';
import { AuthController } from 'src/presentacion/controller/auth.controller';
import { AuthService } from 'src/aplicacion/services/auth.service';
import { UserRepository } from 'src/infraestructura/adapters/repositories/user.repository';

@Module({
  imports: [
    DataBaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3600s'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    {provide:'UserRepositoryPort',useClass: UserRepository},
  ],
  
  exports: [
    AuthService,
    'UserRepositoryPort',
  ],
})
export class AuthModule {}