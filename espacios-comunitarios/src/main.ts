import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { IPackageJson } from './shared/dto/interface';
import { parseCors } from './shared/dto/cors.helper';
import { json, urlencoded } from 'express';
import { ResponseFormatInterceptor } from './presentacion/interceptors/response-format.interceptor';
import { configSwagger, printServerInitLog } from './shared/dto/swagger.helper';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableVersioning({ type: VersioningType.URI });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // compression
  app.use(compression());

  /* -------------- CARGA LA CONFIGURACION DEL :ENV, packageJson -------------- */
  const configService = app.get(ConfigService);
  const packageJson = configService.get('packageJson');

  app.enableCors({
    origin: parseCors(
      configService.get('nodeEnv') || 'production',
      configService.get('cors') || '*',
    ),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(json({ limit: configService.get('appMaxSize') }));
  app.use(
    urlencoded({ limit: configService.get('appMaxSize'), extended: true }),
  );

  // Interceptors globales
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  if (configService.get('showSwagger') === 'true')
    configSwagger(app, packageJson);

  const port = configService.get<number>('port') || 3000;

  await app.listen(port, '0.0.0.0').then(async () => {
    printServerInitLog(app, packageJson);
  });
}
bootstrap();
