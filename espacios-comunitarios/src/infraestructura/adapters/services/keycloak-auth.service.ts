import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
}

@Injectable()
export class KeycloakAuthService {
  private axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
  }

  /**
   * Autenticar usuario con Keycloak usando credenciales
   */
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<KeycloakTokenResponse> {
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
        'espacios-client',
      );
      const clientSecret = this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
        'espacios-client-secret-12345',
      );

      const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

      const response = await this.axiosInstance.post<KeycloakTokenResponse>(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('✓ Autenticación exitosa con Keycloak');
      return response.data;
    } catch (error) {
      console.error(
        '✗ Error autenticando con Keycloak:',
        error.response?.data || error.message,
      );
      throw new Error('Credenciales inválidas o error en Keycloak');
    }
  }

  /**
   * Crear usuario en Keycloak
   */
  async createKeycloakUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    try {
      const keycloakUrl = this.configService.get<string>(
        'KEYCLOAK_URL',
        'http://keycloak:8080',
      );
      const realm = this.configService.get<string>(
        'KEYCLOAK_REALM',
        'espacios-reservas-realm',
      );

      // Obtener token admin
      const adminToken = await this.getAdminToken();

      // Crear usuario
      const userUrl = `${keycloakUrl}/admin/realms/${realm}/users`;

      await this.axiosInstance.post(
        userUrl,
        {
          username: email,
          email: email,
          firstName: firstName,
          lastName: lastName,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('✓ Usuario creado en Keycloak');
    } catch (error) {
      console.error(
        '✗ Error creando usuario en Keycloak:',
        error.response?.data || error.message,
      );
      throw new Error('Error creando usuario en Keycloak');
    }
  }

  /**
   * Obtener token de administrador
   */
  private async getAdminToken(): Promise<string> {
    try {
      const keycloakUrl = this.configService.get<string>(
        'KEYCLOAK_URL',
        'http://keycloak:8080',
      );

      // Usar credenciales directas de admin de Keycloak
      const tokenUrl = `${keycloakUrl}/realms/master/protocol/openid-connect/token`;

      const response = await this.axiosInstance.post<KeycloakTokenResponse>(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: 'admin',
          password: 'admin123',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(
        '✗ Error obteniendo token admin de Keycloak:',
        error.response?.data || error.message,
      );
      throw new Error('Error obteniendo token de administrador');
    }
  }
}
