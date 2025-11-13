import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";
import * as os from 'os';
import { bold } from 'chalk';

export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
  license: string;
}

/**
 * Convierte un nombre a mayusculas y reemplaza los guiones(-) por espacios
 * @param name
 * @returns
 */
export const nameParsePresentation = (name: string): string => {
  return name.toUpperCase().replace(/-/g, ' ');
};

export const configSwagger = (
  app: INestApplication,
  packageJson: IPackageJson,
  options: SwaggerCustomOptions & { nodeEnv?: string } = {},
) => {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const envSufix: string = nodeEnv ? `- (${nodeEnv})` : '';

  const documentBuilder = new DocumentBuilder()
    .setTitle(`${nameParsePresentation(packageJson.name)} ${envSufix}`)
    .setVersion(packageJson.version)
    .setDescription(packageJson.description)
    .setContact(packageJson.contact.name, '', packageJson.contact.email)
    .setLicense(packageJson.license, packageJson.contact.email)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: nameParsePresentation(packageJson.name),
    customfavIcon: '../assets/favicon.ico',
    customCss: `
         .swagger-ui .topbar { display: none; }
         .swagger-ui .info { margin: 20px 0;}
         .swagger-ui .info hgroup.main { margin: 0 0 0;}
         .title span { display: block; }
    `,
    ...options,
  });
};

const getLocalIP = (port = 3000): string | null => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    if (addresses) {
      for (const iface of addresses ) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return `http://${iface.address}:${port}`;
        }
      }
    }
  }
  return null;
};

export const printServerInitLog = async (
  app: INestApplication,
  packageJson: IPackageJson,
  options: { route?: string; appName?: string; port?: number } = { route: 'api' },
) => {
  const port = options?.port ?? app.getHttpServer().address().port;
  const server = getLocalIP(port) ?? (await app.getUrl());
  const appName = options?.appName ?? packageJson.name;

  console.info(
    bold.blue(
      `🚀 "${appName}", version:"${packageJson.version}" is listening ON PORT`,
      `${server}/${bold.bgBlueBright(options?.route ?? 'api')}`,
    ),
  );
};