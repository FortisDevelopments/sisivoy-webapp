import { authService } from '../services/authService';

export class HttpInterceptor {
  private static instance: HttpInterceptor;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  private constructor() {}

  static getInstance(): HttpInterceptor {
    if (!HttpInterceptor.instance) {
      HttpInterceptor.instance = new HttpInterceptor();
    }
    return HttpInterceptor.instance;
  }

  async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // Verificar si el token necesita ser refrescado
    if (authService.shouldRefreshToken(accessToken)) {
      console.log('🔍 Token necesita refresh, intentando refrescar...');
      const newToken = await authService.refreshTokenIfNeeded();
      if (!newToken) {
        throw new Error('Failed to refresh token');
      }
    }

    // Agregar el token a los headers y credentials
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // CRÍTICO: Incluir cookies HttpOnly en TODAS las requests
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Si la respuesta es 401 (Unauthorized), intentar refrescar el token
      if (response.status === 401) {
        return await this.handleUnauthorized(url, options);
      }

      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  private async handleUnauthorized(url: string, options: RequestInit): Promise<Response> {
    if (this.isRefreshing) {
      // Si ya se está refrescando, agregar a la cola
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await authService.refreshTokenIfNeeded();
      
      if (newToken) {
        // Procesar la cola de peticiones fallidas
        this.processQueue(null);
        
        // Reintentar la petición original con el nuevo token
        const headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };

        const requestOptions: RequestInit = {
          ...options,
          headers,
          credentials: 'include', // CRÍTICO: Incluir cookies HttpOnly
        };

        return await fetch(url, requestOptions);
      } else {
        this.processQueue(new Error('Failed to refresh token'));
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      this.processQueue(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }
}

// Instancia singleton
export const httpInterceptor = HttpInterceptor.getInstance();
