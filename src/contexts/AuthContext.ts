import { createContext } from "react";
import { type User } from "../API";

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
