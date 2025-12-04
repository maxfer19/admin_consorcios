// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3000/api', // Android emulator localhost
  // BASE_URL: 'http://localhost:3000/api', // iOS simulator
  // BASE_URL: 'http://YOUR_IP:3000/api', // Physical device (replace YOUR_IP)
  TIMEOUT: 30000,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@paddle_match:access_token',
  REFRESH_TOKEN: '@paddle_match:refresh_token',
  USER_DATA: '@paddle_match:user_data',
};
