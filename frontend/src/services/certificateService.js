import api from './api';

export const certificateService = {
  /**
   * Register a new certificate in MongoDB Atlas
   * Sends idempotency key (clientRequestId) to guarantee safe retries
   */
  async registerCertificate(data) {
    return api.post('/api/admin/certificates', data);
  },

  /**
   * Retrieve issued certificates with search and filters
   */
  async getCertificates(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.qr && params.qr !== 'all') query.append('qr', params.qr);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);

    const qs = query.toString();
    return api.get(`/api/admin/certificates${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieve a specific certificate by ID
   */
  async getCertificateById(certificateId) {
    return api.get(`/api/admin/certificates/${encodeURIComponent(certificateId)}`);
  },

  /**
   * Revoke an issued certificate
   */
  async revokeCertificate(certificateId, reason = 'Revoked by administrator') {
    return api.patch(`/api/admin/certificates/${encodeURIComponent(certificateId)}/revoke`, { reason });
  },

  /**
   * Preview next sequential Certificate ID
   */
  async getNextIdPreview() {
    return api.get('/api/admin/certificates/next-id');
  },

  /**
   * Public verification endpoint test
   */
  async verifyCertificatePublic(certificateId) {
    return api.get(`/api/certificates/verify/${encodeURIComponent(certificateId)}`);
  }
};
