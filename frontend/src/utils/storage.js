const TOKEN_KEY = 'c2c_admin_token';
const SETTINGS_KEY = 'c2c_settings_cache';
const DRAFT_OFFER_KEY = 'c2c_draft_offer';
const DRAFT_CERT_KEY = 'c2c_draft_cert';
const OFFLINE_HISTORY_KEY = 'c2c_offline_history';

export const storage = {
  // Auth Token
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  // Settings
  getSettings: () => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setSettings: (settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not cache settings locally', e);
    }
  },

  // Drafts
  getDraftOffer: () => {
    try {
      const data = localStorage.getItem(DRAFT_OFFER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setDraftOffer: (data) => localStorage.setItem(DRAFT_OFFER_KEY, JSON.stringify(data)),
  clearDraftOffer: () => localStorage.removeItem(DRAFT_OFFER_KEY),

  getDraftCert: () => {
    try {
      const data = localStorage.getItem(DRAFT_CERT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setDraftCert: (data) => localStorage.setItem(DRAFT_CERT_KEY, JSON.stringify(data)),
  clearDraftCert: () => localStorage.removeItem(DRAFT_CERT_KEY),

  // Offline history records
  getOfflineHistory: () => {
    try {
      const data = localStorage.getItem(OFFLINE_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addOfflineHistory: (item) => {
    try {
      const existing = storage.getOfflineHistory();
      const updated = [item, ...existing].slice(0, 50);
      localStorage.setItem(OFFLINE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save offline history', e);
    }
  }
};
