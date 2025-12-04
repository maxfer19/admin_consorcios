import {create} from 'zustand';
import {Match, PlayerLevel} from '@types/index';
import {matchesService, MatchFilters} from '@services/matches.service';

interface MatchesState {
  matches: Match[];
  currentMatch: Match | null;
  isLoading: boolean;
  error: string | null;
  filters: MatchFilters;

  // Actions
  fetchMatches: (filters?: MatchFilters) => Promise<void>;
  fetchMatch: (id: string) => Promise<void>;
  joinMatch: (id: string) => Promise<void>;
  leaveMatch: (id: string) => Promise<void>;
  setFilters: (filters: MatchFilters) => void;
  clearError: () => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  currentMatch: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchMatches: async (filters) => {
    set({isLoading: true, error: null});
    try {
      const matches = await matchesService.getMatches(filters || get().filters);
      set({matches, isLoading: false});
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load matches',
        isLoading: false,
      });
    }
  },

  fetchMatch: async (id) => {
    set({isLoading: true, error: null});
    try {
      const match = await matchesService.getMatch(id);
      set({currentMatch: match, isLoading: false});
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load match',
        isLoading: false,
      });
    }
  },

  joinMatch: async (id) => {
    set({isLoading: true, error: null});
    try {
      const match = await matchesService.joinMatch(id);
      set({
        currentMatch: match,
        matches: get().matches.map(m => (m.id === id ? match : m)),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to join match',
        isLoading: false,
      });
      throw error;
    }
  },

  leaveMatch: async (id) => {
    set({isLoading: true, error: null});
    try {
      const match = await matchesService.leaveMatch(id);
      set({
        currentMatch: match,
        matches: get().matches.map(m => (m.id === id ? match : m)),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to leave match',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({filters});
  },

  clearError: () => set({error: null}),
}));
