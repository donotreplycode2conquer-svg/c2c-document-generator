import api from './api';
import { storage } from '../utils/storage';

export const authService = {
  async login(username, password) {
    const data = await api.post('/api/admin/auth/login', { username, password });
    if (data.token) {
      storage.setToken(data.token);
    }
    return data;
  },

  logout() {
    storage.removeToken();
  },

  async getMe() {
    return api.get('/api/admin/auth/me');
  },

  isAuthenticated() {
    return !!storage.getToken();
  }
};
