import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { User } from './../types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return { user, handleLogout };
};