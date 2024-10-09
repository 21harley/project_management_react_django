export interface LoginData {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
  }

  // Datos necesarios para el registro
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// La respuesta de la API de autenticación
export interface AuthResponse {
  token: string;
}

