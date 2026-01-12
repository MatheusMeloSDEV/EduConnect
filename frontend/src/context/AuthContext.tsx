
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { authService } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de contexto que gerencia o estado global de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Função para realizar login e salvar estado
  const login = async (email: string, password: string) => {
    // Usamos o novo método loginWithPassword no api.ts
    const response = await authService.loginWithPassword(email, password);
    if (response.success) {
      // O backend retorna { user: ..., token: ... }
      // Armazenamos o objeto completo no estado ou separamos.
      // Para simplicidade, mesclamos o token no objeto user para o localStorage
      const userWithToken = { ...response.data.user, token: response.data.token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
    }
  };

  // Função para realizar logout e limpar estado
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData: User) => {
      // Mesclar novos dados com dados existentes (preservando token se não estiver presente na atualização)
      const currentUser = user;
      const updatedUser = { ...currentUser, ...userData };
      
      // Garantir que o token persista se o backend não retorná-lo na atualização
      if (currentUser?.token && !updatedUser.token) {
          updatedUser.token = currentUser.token;
      }
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
