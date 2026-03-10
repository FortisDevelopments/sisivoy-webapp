import { API_BASE_URL, ENDPOINTS, type RefreshTokenResponse } from '../API';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    console.log('🔍 AuthService: Iniciando refresh token');
    console.log('🔍 URL:', `${API_BASE_URL}${ENDPOINTS.REFRESH}`);
    console.log('🔍 Enviando petición con cookie HttpOnly "refresh_token"');
    console.log('🔍 Cookie path: /api/auth/refresh, HttpOnly, Secure, SameSite=Strict');
    
    // Verificar cookies disponibles
    console.log('🔍 Cookies disponibles:', document.cookie);
    
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'accept': '*/*',
      },
      credentials: 'include',
    };
    
    console.log('🔍 Request options:', requestOptions);
    console.log('🔍 Body: vacío (sin JSON.stringify)');
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`, requestOptions);

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Error response body:', errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 Refresh successful, new tokens received');
    console.log('🔍 Response data:', result);
    return result;
  }

  async refreshTokenIfNeeded(): Promise<string | null> {
    try {
      console.log('🔍 refreshTokenIfNeeded: Iniciando refresh usando cookies HttpOnly');
      
      // El refresh token está en la cookie HttpOnly establecida por el servidor
      // Solo necesitamos hacer la petición con credentials: 'include'
      const result = await this.refreshToken();
      
      console.log('🔍 Refresh exitoso, actualizando accessToken en localStorage');
      
      // Actualizar SOLO accessToken en localStorage
      // El refresh token NO se guarda, está en la cookie HttpOnly del servidor
      localStorage.setItem('accessToken', result.accessToken);
      
      console.log('✅ Access token actualizado');
      console.log('✅ Refresh token manejado por servidor en cookie HttpOnly');
      
      return result.accessToken;
    } catch (error) {
      console.error('🔍 Error en refreshTokenIfNeeded:', error);
      // Si el refresh falla, limpiar la sesión
      console.log('🔍 Limpiando localStorage debido a error');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      // Redirigir al login
      window.location.href = '/login';
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  shouldRefreshToken(accessToken: string): boolean {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Refrescar si el token expira en menos de 5 minutos
      const timeUntilExpiry = payload.exp - currentTime;
      return timeUntilExpiry < 300; // 5 minutos
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }
}

// Instancia singleton
export const authService = AuthService.getInstance();
