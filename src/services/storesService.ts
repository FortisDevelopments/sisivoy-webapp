import { API_BASE_URL, ENDPOINTS, type StoresResponse, type StoresFilters, type Store, type StoreDetailsResponse } from '../API';
import { useStoresStore } from '../stores/storesStore';
import { httpInterceptor } from '../utils/httpInterceptor';

export class StoresService {
  private static instance: StoresService;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): StoresService {
    if (!StoresService.instance) {
      StoresService.instance = new StoresService();
    }
    return StoresService.instance;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private validateStoreData(store: unknown): Store {
    // Validar datos básicos de la tienda
    const storeData = store as Record<string, unknown>;
    const validatedStore = {
      id: storeData?.id || 0,
      name: storeData?.name || 'Nombre no disponible',
      address: storeData?.address || 'Dirección no disponible',
      latitude: storeData?.latitude || 0,
      longitude: storeData?.longitude || 0,
      store_type: storeData?.store_type || 'Tipo no disponible',
      website: storeData?.website || 'Sitio web no disponible',
      phone_number: storeData?.phone_number || 'Teléfono no disponible',
      additional_data: storeData?.additional_data || {},
      average_consumption: storeData?.average_consumption || 0,
      description: storeData?.description || 'Descripción no disponible',
      size: storeData?.size || 'Tamaño no disponible',
      available_services: storeData?.available_services || {},
      social_media: storeData?.social_media || {},
      business_hours: storeData?.business_hours || {},
      created_at: storeData?.created_at || null,
      updated_at: storeData?.updated_at || null,
      is_active: storeData?.is_active !== undefined ? storeData.is_active : 0,
      owner_id: storeData?.owner_id || 0,
      owner_name: storeData?.owner_name || 'Propietario no disponible',
      owner_email: storeData?.owner_email || 'Email del propietario no disponible',
      owner_is_active: storeData?.owner_is_active !== undefined ? storeData.owner_is_active : false,
    };

    return validatedStore as Store;
  }

  private async makeRequest(filters: StoresFilters): Promise<StoresResponse> {
    if (!this.accessToken) {
      throw new Error('No hay token de acceso disponible');
    }

    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.storeType) params.append('storeType', filters.storeType);

    const response = await httpInterceptor.makeRequest(
      `${API_BASE_URL}${ENDPOINTS.ADMIN_STORES}?${params.toString()}`,
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

  async fetchStores(filters: StoresFilters): Promise<void> {
    const store = useStoresStore.getState();
    
    try {
      store.setLoading(true);
      store.setError(null);

      const data = await this.makeRequest(filters);
      
      // Validar estructura de datos
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta del servidor inválida');
      }
      
      if (!data.stores || !Array.isArray(data.stores)) {
        throw new Error('Estructura de datos de tiendas inválida');
      }

      if (!data.pagination || typeof data.pagination !== 'object') {
        throw new Error('Estructura de paginación inválida');
      }

      // Validar y limpiar datos de tiendas
      const validatedStores = data.stores.map((storeData: unknown) => this.validateStoreData(storeData));
      
      // Validar datos de paginación
      const validatedPagination = {
        page: data.pagination.page || 1,
        limit: data.pagination.limit || 25,
        total: data.pagination.total || 0,
        totalPages: data.pagination.totalPages || 1,
        hasNext: Boolean(data.pagination.hasNext),
        hasPrev: Boolean(data.pagination.hasPrev),
      };

      store.updateStoresData(validatedStores, validatedPagination);
      
    } catch (error) {
      console.error('Error al cargar tiendas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      store.setError(errorMessage);
      store.setLoading(false);
      throw error;
    }
  }

  async searchStores(searchTerm: string): Promise<void> {
    const store = useStoresStore.getState();
    // Solo actualizar el filtro sin hacer fetch inmediatamente
    store.updateSearch(searchTerm);
    // Hacer fetch con el filtro actualizado
    await this.fetchStores(store.filters);
  }

  async filterByStoreType(storeType: string): Promise<void> {
    const store = useStoresStore.getState();
    store.updateStoreType(storeType);
    // No hacer fetch - el filtrado será local en el componente
  }

  async filterByStatus(status: string): Promise<void> {
    const store = useStoresStore.getState();
    store.updateStatus(status);
    // No hacer fetch - el filtrado será local en el componente
  }

  async changePage(page: number): Promise<void> {
    const store = useStoresStore.getState();
    store.updatePage(page);
    await this.fetchStores(store.filters);
  }

  async changePageSize(pageSize: number): Promise<void> {
    const store = useStoresStore.getState();
    store.updateLimit(pageSize);
    await this.fetchStores(store.filters);
  }

  async resetFilters(): Promise<void> {
    const store = useStoresStore.getState();
    store.setClearing(true);
    
    try {
      store.resetFilters();
      // Recargar desde backend con filtros limpios
      await this.fetchStores(store.filters);
    } finally {
      store.setClearing(false);
    }
  }

  async refreshStores(): Promise<void> {
    const store = useStoresStore.getState();
    await this.fetchStores(store.filters);
  }

  async getStoreDetails(storeId: number): Promise<StoreDetailsResponse> {
    const response = await httpInterceptor.makeRequest(
      `${API_BASE_URL}${ENDPOINTS.STORE_DETAILS}/${storeId}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Instancia singleton
export const storesService = StoresService.getInstance();
