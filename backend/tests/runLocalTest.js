const http = require('http');
const app = require('../server');

const PORT = 5055;
let server;
let adminToken = '';
let passedTests = 0;
let totalTests = 0;

const logTest = (name, passed, detail = '') => {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  }
};

const makeRequest = (endpoint, options = {}) => {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path: endpoint,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

const run = async () => {
  server = app.listen(PORT, '127.0.0.1', async () => {
    console.log('\n======================================================');
    console.log('Code2Conquer Document Generator - API Test Suite');
    console.log('======================================================\n');

    try {
      // 1. Health Check
      console.log('1. Health Check & Public Endpoints:');
      const health = await makeRequest('/api/health');
      logTest('Health Check Status 200', health.status === 200);
      logTest('Service name returned', health.data.service && health.data.service.includes('Code2Conquer'));
      logTest('Database status reported', health.data.database && typeof health.data.database.connected === 'boolean');
      logTest('DB URI password masked', !health.data.database.uriMasked.includes('admin:') && !health.data.database.uriMasked.includes('@localhost'));

      // 2. Authentication & Authorization
      console.log('\n2. Administrator Authentication & Authorization:');
      const badLogin = await makeRequest('/api/admin/auth/login', {
        method: 'POST',
        body: { username: 'admin', password: 'wrongPassword123' }
      });
      logTest('Rejects invalid admin credentials with 401', badLogin.status === 401);

      const goodLogin = await makeRequest('/api/admin/auth/login', {
        method: 'POST',
        body: { username: 'admin', password: 'admin123' }
      });
      logTest('Authenticates valid admin with 200', goodLogin.status === 200);
      logTest('Returns valid JWT token', !!goodLogin.data.token);
      adminToken = goodLogin.data.token;

      const meRes = await makeRequest('/api/admin/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Verifies session token with 200', meRes.status === 200 && meRes.data.user?.username === 'admin');

      const unauthRes = await makeRequest('/api/admin/certificates');
      logTest('Rejects unauthenticated requests with 401', unauthRes.status === 401);

      // 3. Public Verification Endpoint Contract
      console.log('\n3. Public Verification Endpoint Contract (/api/certificates/verify/:id):');
      const notFoundRes = await makeRequest('/api/certificates/verify/C2C-INT-2026-99999');
      logTest('Returns 404 for non-existent certificate', notFoundRes.status === 404);
      logTest('Contract matches {"status": "NOT_FOUND"}', notFoundRes.data.status === 'NOT_FOUND');
      logTest('Does not leak internal DB errors or credentials', !notFoundRes.data.error && !notFoundRes.data._id);

      // 4. Request Validation
      console.log('\n4. Input Validation (Zod Middleware):');
      const invalidCert = await makeRequest('/api/admin/certificates', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { holderName: '' }
      });
      logTest('Rejects malformed certificate with 400', invalidCert.status === 400);
      logTest('Returns validation errors list', Array.isArray(invalidCert.data.errors) && invalidCert.data.errors.length > 0);

      // 5. Offer Letter ID Generation
      console.log('\n5. Sequential ID Generation & Document History:');
      const nextOfferId = await makeRequest('/api/admin/offer-letters/next-id', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Returns valid next Offer Letter ID format (C2C-OFF-YYYY-XXXXX)', /^C2C-OFF-\d{4}-\d{5}$/.test(nextOfferId.data?.nextOfferId));

      const nextCertId = await makeRequest('/api/admin/certificates/next-id', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('Returns valid next Certificate ID format (C2C-INT-YYYY-XXXXX)', /^C2C-INT-\d{4}-\d{5}$/.test(nextCertId.data?.nextCertificateId));

      // 6. Security Header Checks
      console.log('\n6. Security & Hardening:');
      logTest('Helmet security headers present (X-Content-Type-Options)', health.headers['x-content-type-options'] === 'nosniff');
      logTest('Rate limiter headers present', !!health.headers['ratelimit-limit'] || !!health.headers['x-ratelimit-limit']);

      console.log('\n======================================================');
      console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
      console.log('======================================================\n');
    } catch (err) {
      console.error('Test suite error:', err);
    } finally {
      server.close(() => {
        process.exit(passedTests === totalTests ? 0 : 1);
      });
    }
  });
};

run();
