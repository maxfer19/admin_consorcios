import {api} from './api';
import {User, Profile} from '@types/index';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  level?: string;
  hand?: string;
  preferredPosition?: string;
  bio?: string;
  city?: string;
  preferredZones?: string[];
}

export const usersService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await api.put<Profile>('/users/me/profile', data);
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  async searchPlayers(query: any): Promise<User[]> {
    const response = await api.get<User[]>('/users/search', {params: query});
    return response.data;
  },
};
