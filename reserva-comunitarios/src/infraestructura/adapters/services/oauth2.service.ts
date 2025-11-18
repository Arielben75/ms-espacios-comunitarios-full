import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class OAuth2Service {
  private axiosInstance: AxiosInstance;
  private tokenCache: {
    token: string;
    expiresAt: number;
  } | null = null;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 5000,
    });
  }

  /**
   * Obtener token de acceso desde Keycloak usando Client Credentials
   */
  async getAccessToken(): Promise<string> {
    // Si el token está en cache y aún no expira, devolverlo
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    try {
      const keycloakUrl = this.configService.get<string>(
        'KEYCLOAK_URL',
        'http://keycloak:8080',
      );
      const realm = this.configService.get<string>(
        'KEYCLOAK_REALM',
        'espacios-reservas-realm',
      );
      const clientId = this.configService.get<string>(
        'KEYCLOAK_CLIENT_ID',
        'reservaciones-client',
      );
      const clientSecret = this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'reservaciones-client-secret-12345',
      );

      const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

      const response = await this.axiosInstance.post<TokenResponse>(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, expires_in } = response.data;

      // Cachear el token con un margen de seguridad de 10 segundos
      this.tokenCache = {
        token: access_token,
        expiresAt: Date.now() + (expires_in - 10) * 1000,
      };

      console.log('✓ OAuth2 token obtenido de Keycloak');
      return access_token;
    } catch (error) {
      console.error('✗ Error obteniendo token OAuth2:', error.message);
      throw new Error('No se pudo obtener el token de acceso');
    }
  }

  /**
   * Verificar que un token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const keycloakUrl = this.configService.get<string>(
        'KEYCLOAK_URL',
        'http://keycloak:8080',
      );
      const realm = this.configService.get<string>(
        'KEYCLOAK_REALM',
        'espacios-reservas-realm',
      );

      const introspectUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token/introspect`;

      const clientId = this.configService.get<string>(
        'KEYCLOAK_CLIENT_ID',
        'reservaciones-client',
      );
      const clientSecret = this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'reservaciones-client-secret-12345',
      );

      const response = await this.axiosInstance.post(
        introspectUrl,
        new URLSearchParams({
          token,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.active === true;
    } catch (error) {
      console.error('✗ Error verificando token:', error.message);
      return false;
    }
  }

  /**
   * Extraer claims del token JWT
   */
  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token inválido');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8'),
      );
      return payload;
    } catch (error) {
      console.error('✗ Error decodificando token:', error.message);
      return null;
    }
  }
}
