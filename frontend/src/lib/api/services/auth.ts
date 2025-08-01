import api, { isAxiosError, ApiError } from '../config';
import { LoginCredentials, LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao fazer login');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      // Parse permissions se for string
      const userData = response.data;
      if (typeof userData.permissions === 'string') {
        userData.permissions = JSON.parse(userData.permissions);
      }
      return userData;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar perfil do usuário');
    }
  }
}; 