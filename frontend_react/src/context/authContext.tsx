import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from './../types/auth.types';
import { login, logout, getCurrentUser } from '../services/authService';

interface AuthContextProps {
  user: User | null;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  const loginUser = async (username: string, password: string) => {
    await login({ username, password });
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};