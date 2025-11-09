import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),

  register: (data: any) =>
    api.post('/auth/register', data),

  registerProvider: (data: any) =>
    api.post('/auth/register-provider', data),

  getCurrentUser: () =>
    api.get('/users/me'),
};

// Buildings API
export const buildingsApi = {
  getAll: () => api.get('/buildings'),
  getById: (id: number) => api.get(`/buildings/${id}`),
  create: (data: any) => api.post('/buildings', data),
  update: (id: number, data: any) => api.put(`/buildings/${id}`, data),
  getUnits: (id: number) => api.get(`/buildings/${id}/units`),
};

// Expenses API
export const expensesApi = {
  getByBuilding: (buildingId: number) => api.get(`/expenses/building/${buildingId}`),
  getMyExpenses: () => api.get('/expenses/my-expenses'),
  create: (data: any) => api.post('/expenses', data),
};

// Communications API
export const communicationsApi = {
  getByBuilding: (buildingId: number) => api.get(`/communications/building/${buildingId}`),
  create: (data: any) => api.post('/communications', data),
  markAsRead: (id: number) => api.post(`/communications/${id}/read`),
};
