import axios from 'axios';

// Type guard para verificar se é um erro do Axios
export function isAxiosError(error: unknown): error is Error & { response?: { data: { error: string } } } {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

// Configuração base do axios
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  error: string;
}

export default api; 