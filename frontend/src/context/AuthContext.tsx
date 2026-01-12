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

  const login = async (email: string, password: string) => {
    // We use the new loginWithPassword method in api.ts
    const response = await authService.loginWithPassword(email, password);
    if (response.success) {
      // The backend returns { user: ..., token: ... }
      // We store the whole object in user state or split it.
      // For simplicity in this demo, let's merge token into user object for localStorage
      const userWithToken = { ...response.data.user, token: response.data.token };
      setUser(userWithToken);
      localStorage.setItem("user", JSON.stringify(userWithToken));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData: User) => {
      // Merge new data with existing user data (preserving token if not present in update)
      const currentUser = user;
      const updatedUser = { ...currentUser, ...userData };
      
      // Ensure token persists if backend doesn't return it on update
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