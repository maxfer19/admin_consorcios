import {api} from './api';
import {Match, PlayerLevel, MatchStatus} from '@types/index';

export interface MatchFilters {
  level?: PlayerLevel;
  startDate?: string;
  endDate?: string;
  city?: string;
  status?: MatchStatus;
}

export interface CreateMatchData {
  timeSlotId: string;
  spotsAvailable: number;
  requiredLevel?: PlayerLevel;
  notes?: string;
}

export const matchesService = {
  async getMatches(filters?: MatchFilters): Promise<Match[]> {
    const response = await api.get<Match[]>('/matches', {params: filters});
    return response.data;
  },

  async getMatch(id: string): Promise<Match> {
    const response = await api.get<Match>(`/matches/${id}`);
    return response.data;
  },

  async createMatch(data: CreateMatchData): Promise<Match> {
    const response = await api.post<Match>('/matches', data);
    return response.data;
  },

  async joinMatch(id: string): Promise<Match> {
    const response = await api.post<Match>(`/matches/${id}/join`);
    return response.data;
  },

  async leaveMatch(id: string): Promise<Match> {
    const response = await api.post<Match>(`/matches/${id}/leave`);
    return response.data;
  },

  async cancelMatch(id: string): Promise<Match> {
    const response = await api.delete<Match>(`/matches/${id}`);
    return response.data;
  },
};
