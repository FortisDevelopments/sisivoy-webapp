import React, { useState, useEffect, type ReactNode } from "react";
import { type User } from "./API";
import { AuthContext, type AuthContextType } from "./contexts/AuthContext";
import { authService } from "./services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Verificar si hay datos de autenticación en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");

    if (storedUser && storedAccessToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccessToken);
        console.log("🔍 Sesión restaurada desde localStorage");
      } catch (error) {
        console.error("Error al parsear datos de sesión:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }
  }, []);

  const login = (
    userData: User,
    accessTokenData: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _refreshTokenData: string // No se usa - el refresh token está en cookie HttpOnly del servidor
  ) => {
    console.log("🔍 AuthProvider: Login exitoso");
    console.log(
      "🔍 Access token recibido:",
      accessTokenData ? "Presente" : "Ausente"
    );
    console.log("🔍 Refresh token: Enviado por el servidor en cookie HttpOnly");

    setUser(userData);
    setAccessToken(accessTokenData);

    // SOLO guardar accessToken en localStorage
    // El refreshToken está en la cookie HttpOnly establecida por el servidor
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessTokenData);

    console.log("✅ Access token guardado en localStorage");
    console.log(
      "✅ Refresh token manejado automáticamente por el servidor en cookie HttpOnly"
    );
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);

    // Limpiar localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const newAccessToken = await authService.refreshTokenIfNeeded();
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      logout();
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken: null, // No se maneja, está en cookie HttpOnly
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
