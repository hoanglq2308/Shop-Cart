import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

export const options = {
  scenarios: {
    cart_add_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
      exec: 'cartAddFlow',
    },
    checkout_load: {
      executor: 'constant-vus',
      vus: 15,
      duration: '30s',
      exec: 'checkoutFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const addHeaders = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const orderPayload = {
  customer: {
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '12 Nguyễn Huệ',
    city: 'hcm',
    district: 'q1',
    cityLabel: 'Hồ Chí Minh',
    districtLabel: 'Quận 1',
  },
  items: [
    { productId: 1, quantity: 2 },
  ],
  total: 30050000,
};

export function cartAddFlow() {
  const payload = JSON.stringify({ productId: 'P001', quantity: 1 });
  const response = http.post(`${BASE_URL}/api/cart/add`, payload, addHeaders);

  check(response, {
    'cart add returns 200': (res) => res.status === 200,
    'cart add success flag is true': (res) => res.json('success') === true,
  });

  sleep(1);
}

export function checkoutFlow() {
  const response = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify(orderPayload),
    addHeaders,
  );

  check(response, {
    'checkout returns 201': (res) => res.status === 201,
    'checkout success flag is true': (res) => res.json('success') === true,
  });

  sleep(1);
}