import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { OAuth2Service } from './oauth2.service';

@Injectable()
export class MicroserviceHttpClient {
  private axiosInstance: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private oauth2Service: OAuth2Service,
  ) {
    this.axiosInstance = axios.create({
      timeout: this.configService.get<number>('SERVICE_B_TIMEOUT', 10000),
    });
  }

  /**
   * Hacer una llamada HTTP con autenticación OAuth2 a otro microservicio
   */
  async call<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    headers?: any,
  ): Promise<T> {
    try {
      // Obtener token OAuth2
      const token = await this.oauth2Service.getAccessToken();

      // Preparar headers con el token
      const requestHeaders = {
        ...headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log(`🔄 [MicroserviceClient] ${method} ${url} con OAuth2 token`);

      const response = await this.axiosInstance.request<T>({
        method,
        url,
        data,
        headers: requestHeaders,
      });

      console.log(`✓ [MicroserviceClient] Respuesta exitosa: ${url}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `✗ [MicroserviceClient] Error en ${method} ${url}:`,
          error.response?.data || error.message,
        );
        throw new Error(
          `Error llamando a microservicio: ${error.response?.status} - ${error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * GET request con OAuth2
   */
  async get<T = any>(url: string, headers?: any): Promise<T> {
    return this.call<T>('GET', url, undefined, headers);
  }

  /**
   * POST request con OAuth2
   */
  async post<T = any>(url: string, data?: any, headers?: any): Promise<T> {
    return this.call<T>('POST', url, data, headers);
  }

  /**
   * PATCH request con OAuth2
   */
  async patch<T = any>(url: string, data?: any, headers?: any): Promise<T> {
    return this.call<T>('PATCH', url, data, headers);
  }

  /**
   * DELETE request con OAuth2
   */
  async delete<T = any>(url: string, headers?: any): Promise<T> {
    return this.call<T>('DELETE', url, undefined, headers);
  }
}
