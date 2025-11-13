import { join } from "path";

/* ------------------------ CONFIGURACION POR DEFAULT ----------------------- */
export const configuration = () => {
  const locatePackagejson = process.cwd();
  let pm2 = false;
  if (locatePackagejson.includes('dist')) {
    pm2 = true;
  }

  return {
    packageJson: require(join(process.cwd(), pm2 ? `../package.json`: `package.json`)),
    port:  parseInt( process.env.ENV_PORT || '8400', 10 ) || 8400,
    appMaxSize: process.env.ENV_FILE_MAX_SIZE || '100mb',
    debugServer: process.env.DEBUG_SERVER || 'false',
    showSwagger: process.env.ENV_SWAGGER_SHOW || 'false',
    appTagName: process.env.ENV_APP_NAME || 'daf',
    pgDatabaseUrl: process.env.DATABASE_URL ?? null,
    nodeEnv: process.env.NODE_ENV || 'dev',
    cors: process.env.ENV_CORS || 'http://localhost:3039',
  }
}