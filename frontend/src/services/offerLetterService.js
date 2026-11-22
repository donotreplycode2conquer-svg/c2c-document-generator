import api from './api';

export const offerLetterService = {
  /**
   * Record generated offer letter in document history
   */
  async recordOfferLetter(data) {
    return api.post('/api/admin/offer-letters', data);
  },

  /**
   * Preview next Offer Letter ID
   */
  async getNextIdPreview() {
    return api.get('/api/admin/offer-letters/next-id');
  },

  /**
   * Retrieve document history
   */
  async getHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString();
    return api.get(`/api/admin/history${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieve dashboard statistics
   */
  async getDashboardStats() {
    return api.get('/api/admin/stats');
  },

  /**
   * Retrieve settings
   */
  async getSettings() {
    return api.get('/api/admin/settings');
  },

  /**
   * Update settings
   */
  async updateSettings(data) {
    return api.put('/api/admin/settings', data);
  },

  /**
   * Ping/test database connection
   */
  async testDbConnection() {
    return api.post('/api/admin/settings/test-db', {});
  },

  /**
   * Health status
   */
  async getHealth() {
    return api.get('/api/health');
  }
};
