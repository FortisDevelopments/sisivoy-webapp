import { API_BASE_URL, ENDPOINTS, type UsersResponse, type UsersFilters, type AdminUser, type UserPermissions } from '../API';
import { useUsersStore } from '../stores/usersStore';
import { httpInterceptor } from '../utils/httpInterceptor';

export class UsersService {
  private static instance: UsersService;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private validateUserData(user: unknown): AdminUser {
    // Validar datos básicos del usuario
    const userData = user as Record<string, unknown>;
    const validatedUser: AdminUser = {
      id: (userData?.id as number) || 0,
      name: (userData?.name as string) || 'Nombre no disponible',
      email: (userData?.email as string) || 'Email no disponible',
      role: (userData?.role as string) || 'Rol no disponible',
      profile_picture_url: (userData?.profile_picture_url as string) || null,
      phone: (userData?.phone as string) || 'Teléfono no disponible',
      is_active: userData?.is_active !== undefined ? (userData.is_active as number) : 0,
      created_at: (userData?.created_at as string) || '',
      updated_at: (userData?.updated_at as string) || '',
      permissions: this.validatePermissions(userData?.permissions || {}),
    };

    return validatedUser;
  }

  private validatePermissions(permissions: unknown): UserPermissions {
    const permData = permissions as Record<string, unknown>;
    return {
      scan: {
        redeem_coupons: Number((permData?.scan as Record<string, unknown>)?.redeem_coupons) || 0,
        register_visits: Number((permData?.scan as Record<string, unknown>)?.register_visits) || 0,
      },
      coupon: {
        edit_coupons: Number((permData?.coupon as Record<string, unknown>)?.edit_coupons) || 0,
        pause_coupons: Number((permData?.coupon as Record<string, unknown>)?.pause_coupons) || 0,
        create_coupons: Number((permData?.coupon as Record<string, unknown>)?.create_coupons) || 0,
        activate_coupons: Number((permData?.coupon as Record<string, unknown>)?.activate_coupons) || 0,
        finalize_coupons: Number((permData?.coupon as Record<string, unknown>)?.finalize_coupons) || 0,
      },
      loyalty: {
        edit_loyalty_card: Number((permData?.loyalty as Record<string, unknown>)?.edit_loyalty_card) || 0,
        pause_loyalty_card: Number((permData?.loyalty as Record<string, unknown>)?.pause_loyalty_card) || 0,
        finalize_loyalty_card: Number((permData?.loyalty as Record<string, unknown>)?.finalize_loyalty_card) || 0,
      },
      business: {
        edit_photo: Number((permData?.business as Record<string, unknown>)?.edit_photo) || 0,
        edit_services: Number((permData?.business as Record<string, unknown>)?.edit_services) || 0,
        edit_business_hours: Number((permData?.business as Record<string, unknown>)?.edit_business_hours) || 0,
      },
    };
  }

  private async makeRequest(filters: UsersFilters): Promise<UsersResponse> {
    if (!this.accessToken) {
      throw new Error('No hay token de acceso disponible');
    }

    const params = new URLSearchParams();
    
    // Solo enviar parámetros que requieren consulta al backend
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search && filters.search.trim() !== '') params.append('search', filters.search);
    
    // No enviar role y status al backend - se filtran localmente

    const response = await httpInterceptor.makeRequest(
      `${API_BASE_URL}${ENDPOINTS.ADMIN_USERS}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchUsers(filters: UsersFilters): Promise<void> {
    const store = useUsersStore.getState();
    
    try {
      store.setLoading(true);
      store.setError(null);

      const data = await this.makeRequest(filters);
      
      // Validar estructura de datos
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }
      
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('Estructura de datos de usuarios inválida');
      }

      if (!data.pagination || typeof data.pagination !== 'object') {
        throw new Error('Estructura de paginación inválida');
      }

      // Validar y limpiar datos de usuarios
      const validatedUsers = data.users.map((user: unknown) => this.validateUserData(user));
      
      // Validar datos de paginación
      const validatedPagination = {
        page: data.pagination.page || 1,
        limit: data.pagination.limit || 25,
        total: data.pagination.total || 0,
        totalPages: data.pagination.totalPages || 1,
        hasNext: Boolean(data.pagination.hasNext),
        hasPrev: Boolean(data.pagination.hasPrev),
      };

      store.updateUsersData(validatedUsers, validatedPagination);
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      store.setError(errorMessage);
      store.setLoading(false);
      throw error;
    }
  }

  async searchUsers(searchTerm: string): Promise<void> {
    const store = useUsersStore.getState();
    store.updateSearch(searchTerm);
    await this.fetchUsers(store.filters);
  }

  async filterByRole(role: string): Promise<void> {
    const store = useUsersStore.getState();
    store.updateRole(role);
    store.applyLocalFilters(); // Aplicar filtros localmente
  }

  async filterByStatus(status: string): Promise<void> {
    const store = useUsersStore.getState();
    store.updateStatus(status);
    store.applyLocalFilters(); // Aplicar filtros localmente
  }

  async changePage(page: number): Promise<void> {
    const store = useUsersStore.getState();
    store.updatePage(page);
    
    // Si hay búsqueda activa, siempre recargar desde el backend
    // Si hay filtros locales (role/status) sin búsqueda, aplicar paginación local
    // Si no hay filtros, recargar desde el backend
    if (store.filters.search && store.filters.search.trim() !== '') {
      await this.fetchUsers(store.filters);
    } else if (store.filters.role || store.filters.status) {
      store.applyLocalFilters();
    } else {
      await this.fetchUsers(store.filters);
    }
  }

  async changePageSize(pageSize: number): Promise<void> {
    const store = useUsersStore.getState();
    store.updateLimit(pageSize);
    
    // Si hay búsqueda activa, siempre recargar desde el backend
    // Si hay filtros locales (role/status) sin búsqueda, aplicar paginación local
    // Si no hay filtros, recargar desde el backend
    if (store.filters.search && store.filters.search.trim() !== '') {
      await this.fetchUsers(store.filters);
    } else if (store.filters.role || store.filters.status) {
      store.applyLocalFilters();
    } else {
      await this.fetchUsers(store.filters);
    }
  }

  async resetFilters(): Promise<void> {
    const store = useUsersStore.getState();
    store.setClearing(true);
    
    try {
      store.resetFilters();
      // Recargar desde backend con filtros limpios para obtener la lista original
      await this.fetchUsers(store.filters);
    } finally {
      store.setClearing(false);
    }
  }

  async refreshUsers(): Promise<void> {
    const store = useUsersStore.getState();
    await this.fetchUsers(store.filters);
    // Después de recargar, aplicar filtros locales si hay alguno activo
    if (store.filters.role || store.filters.status) {
      store.applyLocalFilters();
    }
  }
}

// Instancia singleton
export const usersService = UsersService.getInstance();
