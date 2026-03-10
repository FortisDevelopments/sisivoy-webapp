import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AdminUser, UsersFilters, UsersPagination } from '../API';

interface UsersState {
  // Estado de los datos
  users: AdminUser[];
  allUsers: AdminUser[]; // Datos completos sin filtrar
  pagination: UsersPagination | null;
  filters: UsersFilters;
  
  // Estado de carga y errores
  loading: boolean;
  clearing: boolean; // Estado específico para limpiar filtros
  error: string | null;
  
  // Acciones
  setUsers: (users: AdminUser[]) => void;
  setAllUsers: (users: AdminUser[]) => void;
  setPagination: (pagination: UsersPagination) => void;
  setFilters: (filters: UsersFilters) => void;
  setLoading: (loading: boolean) => void;
  setClearing: (clearing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones combinadas
  updateUsersData: (users: AdminUser[], pagination: UsersPagination) => void;
  resetUsersState: () => void;
  
  // Acciones de filtros
  updateSearch: (search: string) => void;
  updateRole: (role: string) => void;
  updateStatus: (status: string) => void;
  updatePage: (page: number) => void;
  updateLimit: (limit: number) => void;
  resetFilters: () => void;
  
  // Filtrado local
  applyLocalFilters: () => void;
}

const initialFilters: UsersFilters = {
  page: 1,
  limit: 25,
  search: '',
  role: '',
  status: '',
};

const initialState = {
  users: [],
  allUsers: [],
  pagination: null,
  filters: initialFilters,
  loading: false,
  clearing: false,
  error: null,
};

export const useUsersStore = create<UsersState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Acciones básicas
      setUsers: (users) => set({ users }),
      setAllUsers: (allUsers) => set({ allUsers }),
      setPagination: (pagination) => set({ pagination }),
      setFilters: (filters) => set({ filters }),
      setLoading: (loading) => set({ loading }),
      setClearing: (clearing) => set({ clearing }),
      setError: (error) => set({ error }),
      
      // Acciones combinadas
      updateUsersData: (users, pagination) => 
        set({ 
          users, 
          allUsers: users, // Guardar todos los usuarios sin filtrar
          pagination, 
          loading: false, 
          error: null 
        }),
      
      resetUsersState: () => 
        set({ 
          ...initialState 
        }),
      
      // Acciones de filtros
      updateSearch: (search) => 
        set((state) => ({ 
          filters: { ...state.filters, search, page: 1 } 
        })),
      
      updateRole: (role) => 
        set((state) => ({ 
          filters: { ...state.filters, role, page: 1 } 
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

      // Filtrado local
      applyLocalFilters: () => {
        const state = get();
        const { allUsers, filters } = state;
        
        let filteredUsers = [...allUsers];
        
        // Filtro por búsqueda (nombre o email)
        if (filters.search && filters.search.trim() !== '') {
          const searchTerm = filters.search.toLowerCase().trim();
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
          );
        }
        
        // Filtro por rol
        if (filters.role && filters.role !== '') {
          const roleFilter = filters.role.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.role.toLowerCase() === roleFilter
          );
        }
        
        // Filtro por estado
        if (filters.status && filters.status !== '') {
          if (filters.status === 'active') {
            filteredUsers = filteredUsers.filter(user => user.is_active === 1);
          } else if (filters.status === 'inactive') {
            filteredUsers = filteredUsers.filter(user => user.is_active === 0);
          }
        }
        
        // Aplicar paginación local
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        // Crear paginación local
        const localPagination = {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
          hasNext: endIndex < filteredUsers.length,
          hasPrev: page > 1,
        };
        
        set({
          users: paginatedUsers,
          pagination: localPagination,
        });
      },
    }),
    {
      name: 'users-store',
    }
  )
);
