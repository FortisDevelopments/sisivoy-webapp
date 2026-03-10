// Configuración de la API
export const API_BASE_URL = 'https://api.sisivoy.com/';

// Endpoints
export const ENDPOINTS = {
  REGISTER: 'api/auth/register',
  LOGIN: 'api/auth/login',
  REFRESH: 'api/auth/refresh',
  ADMIN_USERS: 'api/admin/users',
  ADMIN_STORES: 'api/admin/stores',
  STORE_DETAILS: 'api/stores',
} as const;

// Tipos para el registro
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  birth_date: string;
  gender: string;
  phone: string;
}

export interface RegisterResponse {
  message: string;
}

// Tipos para el login
export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string; // Opcional ya que el servidor puede no devolverlo
}

// Tipos para la gestión de usuarios
export interface UserPermissions {
  scan: {
    redeem_coupons: number;
    register_visits: number;
  };
  coupon: {
    edit_coupons: number;
    pause_coupons: number;
    create_coupons: number;
    activate_coupons: number;
    finalize_coupons: number;
  };
  loyalty: {
    edit_loyalty_card: number;
    pause_loyalty_card: number;
    finalize_loyalty_card: number;
  };
  business: {
    edit_photo: number;
    edit_services: number;
    edit_business_hours: number;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture_url: string | null;
  phone: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  permissions: UserPermissions;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: UsersPagination;
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

// Tipos para la gestión de tiendas
export interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  store_type: string;
  website: string;
  phone_number: string;
  additional_data: Record<string, unknown>;
  average_consumption: number;
  description: string;
  size: string;
  available_services: Record<string, unknown>;
  social_media: Record<string, unknown>;
  business_hours: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  is_active: number;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  owner_is_active: boolean;
}

export interface StoresPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StoresResponse {
  stores: Store[];
  pagination: StoresPagination;
}

export interface StoresFilters {
  page?: number;
  limit?: number;
  search?: string;
  storeType?: string;
  status?: string;
}

// Interfaces para detalles de tienda con imágenes
export interface StoreImage {
  si_id: number;
  si_url: string;
  si_position: number;
}

export interface StoreDetails {
  s_id: number;
  s_name: string;
  s_address: string;
  s_latitude: number;
  s_longitude: number;
  s_store_type: string;
  s_website: string;
  s_phone_number: string;
  s_additional_data: string;
  s_average_consumption: string;
  s_description: string;
  s_size: string;
  s_available_services: Record<string, unknown>;
  s_social_media: Record<string, unknown>;
  s_business_hours: Record<string, unknown>;
  s_created_at: string;
  u_name: string;
}

export interface StoreDetailsResponse {
  store: StoreDetails;
  images: StoreImage[];
}
