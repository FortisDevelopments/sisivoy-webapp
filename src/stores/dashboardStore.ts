import { create } from 'zustand';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  activeUsers: number;
  activeStores: number;
  usersByRole: { role: string; count: number }[];
  storesByType: { type: string; count: number }[];
  recentUsers: number;
  recentStores: number;
}

interface DashboardStore {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  isDataLoaded: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateStats: (stats: DashboardStats) => void;
  setDataLoaded: (loaded: boolean) => void;
  reset: () => void;
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  totalStores: 0,
  activeUsers: 0,
  activeStores: 0,
  usersByRole: [],
  storesByType: [],
  recentUsers: 0,
  recentStores: 0,
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: initialStats,
  loading: false,
  error: null,
  isDataLoaded: false,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateStats: (stats) => set({ stats, isDataLoaded: true }),
  setDataLoaded: (loaded) => set({ isDataLoaded: loaded }),
  reset: () => set({ 
    stats: initialStats, 
    loading: false, 
    error: null, 
    isDataLoaded: false 
  }),
}));
