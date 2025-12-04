import {api} from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@constants/config';
import {AuthResponse, User} from '@types/index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Save tokens
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      response.data.accessToken,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      response.data.refreshToken,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(response.data.user),
    );

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Save tokens
    await AsyncStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      response.data.accessToken,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      response.data.refreshToken,
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(response.data.user),
    );

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  },

  async getStoredUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(response.data),
    );
    return response.data;
  },
};
