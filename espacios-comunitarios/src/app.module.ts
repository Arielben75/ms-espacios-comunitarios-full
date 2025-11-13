import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from './presentacion/configurations/configurations';
import { APP_PIPE } from '@nestjs/core';
import { DtoValidatorPipe } from './presentacion/pipes/dto-validator.pipe';
import { ParamValidatorPipe } from './presentacion/pipes/param-validator.pipe';
import { DataBaseModule } from './modules/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth.module';
import { EspaciosModule } from './modules/espacios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      expandVariables: true,
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return { secret: configService.get<string>('JWT_SECRET') };
      },
      inject: [ConfigService],
    }),
    DataBaseModule,
    AuthModule,
    EspaciosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    { provide: APP_PIPE, useClass: DtoValidatorPipe },
    { provide: APP_PIPE, useClass: ParamValidatorPipe },
  ],
})
export class AppModule {}
