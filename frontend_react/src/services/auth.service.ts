import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, LoginData, RegisterData, User } from '../types/auth.types';
import { REACT_APP_API_URL } from '../evn';
const API_URL = REACT_APP_API_URL;

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}usuarios/login/`, data);
  console.log(response.data);
  if (response.data.token && response.data) {
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};


export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Llamada al endpoint de registro en tu API
    const response = await axios.post<AuthResponse>(`${API_URL}usuarios/`, data);

    // Almacenar el token en localStorage si es necesario
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error; // Manejo de errores según lo necesites
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('token');
  
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<User>(token);
    return decoded;
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};