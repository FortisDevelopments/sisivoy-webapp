import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Store, StoresFilters, StoresPagination } from '../API';

interface StoresState {
  // Estado de los datos
  stores: Store[];
  pagination: StoresPagination | null;
  filters: StoresFilters;
  
  // Estado de carga y errores
  loading: boolean;
  clearing: boolean; // Estado específico para limpiar filtros
  error: string | null;
  
  // Acciones
  setStores: (stores: Store[]) => void;
  setPagination: (pagination: StoresPagination) => void;
  setFilters: (filters: StoresFilters) => void;
  setLoading: (loading: boolean) => void;
  setClearing: (clearing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones combinadas
  updateStoresData: (stores: Store[], pagination: StoresPagination) => void;
  resetStoresState: () => void;
  
  // Acciones de filtros
  updateSearch: (search: string) => void;
  updateStoreType: (storeType: string) => void;
  updateStatus: (status: string) => void;
  updatePage: (page: number) => void;
  updateLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialFilters: StoresFilters = {
  page: 1,
  limit: 25,
  search: '',
  storeType: '',
  status: '',
};

const initialState = {
  stores: [],
  pagination: null,
  filters: initialFilters,
  loading: false,
  clearing: false,
  error: null,
};

export const useStoresStore = create<StoresState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // Acciones básicas
      setStores: (stores) => set({ stores }),
      setPagination: (pagination) => set({ pagination }),
      setFilters: (filters) => set({ filters }),
      setLoading: (loading) => set({ loading }),
      setClearing: (clearing) => set({ clearing }),
      setError: (error) => set({ error }),
      
      // Acciones combinadas
      updateStoresData: (stores, pagination) => 
        set({ 
          stores, 
          pagination, 
          loading: false, 
          error: null 
        }),
      
      resetStoresState: () => 
        set({ 
          ...initialState 
        }),
      
      // Acciones de filtros
      updateSearch: (search) => 
        set((state) => ({ 
          filters: { ...state.filters, search, page: 1 } 
        })),
      
      updateStoreType: (storeType) => 
        set((state) => ({ 
          filters: { ...state.filters, storeType, page: 1 } 
        })),
      
      updateStatus: (status) => 
        set((state) => ({ 
          filters: { ...state.filters, status, page: 1 } 
        })),
      
      updatePage: (page) => 
        set((state) => ({ 
          filters: { ...state.filters, page } 
        })),
      
      updateLimit: (limit) => 
        set((state) => ({ 
          filters: { ...state.filters, limit, page: 1 } 
        })),
      
      resetFilters: () => 
        set({ 
          filters: initialFilters 
        }),
    }),
    {
      name: 'stores-store',
    }
  )
);
