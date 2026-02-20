import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
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

// 1. REMOVIDO o 'export' desta linha
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const response = await authService.loginWithPassword(email, password);
    if (response.success && response.data) {
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
      const currentUser = user;
      const updatedUser = { ...currentUser, ...userData };
      
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

// 2. ADICIONADO este Hook Customizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};