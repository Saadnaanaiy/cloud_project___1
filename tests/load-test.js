import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const loginDuration = new Trend('login_duration', true);

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 30 },
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 50 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
    'error_rate': ['rate<0.01'],
    'login_duration': ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://empmanager.duckdns.org';

export default function () {
  let authToken = '';

  group('Authentication', function () {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: 'admin@company.com', password: 'Admin123!' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    loginDuration.add(Date.now() - start);

    const ok = check(res, {
      'login 200': (r) => r.status === 200 || r.status === 201,
      'has token': (r) => !!JSON.parse(r.body).access_token,
    });
    errorRate.add(!ok);
    if (ok) authToken = JSON.parse(res.body).access_token;
  });

  sleep(1);
  if (!authToken) return;

  const headers = { headers: { 'Authorization': `Bearer ${authToken}` } };

  group('Employee API', function () {
    const res = http.get(`${BASE_URL}/api/employees`, headers);
    errorRate.add(!check(res, { 'employees 200': (r) => r.status === 200 }));
  });

  sleep(0.5);

  group('Health Check', function () {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, { 'health 200': (r) => r.status === 200 });
  });

  sleep(1);
}
