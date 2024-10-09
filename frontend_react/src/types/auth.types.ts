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