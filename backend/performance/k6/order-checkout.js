import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const USER_ID = Number(__ENV.USER_ID || 1);
const PRODUCT_ID = Number(__ENV.PRODUCT_ID || 1);
const SHIPPING_FEE = Number(__ENV.SHIPPING_FEE || 15000);

export default function () {
  const payload = JSON.stringify({
    userId: USER_ID,
    shippingAddress: '123 Nguyen Trai, Quan 1',
    paymentMethod: 'COD',
    shippingFee: SHIPPING_FEE,
    items: [
      {
        productId: PRODUCT_ID,
        quantity: 1,
      },
    ],
  });

  const response = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'POST /api/orders' },
  });

  check(response, {
    'status is 201': (res) => res.status === 201,
    'order remains pending': (res) => safeJson(res, 'status') === 'PENDING',
    'totalPrice is positive': (res) => Number(safeJson(res, 'totalPrice')) > 0,
  });

  sleep(1);
}

function safeJson(response, path) {
  try {
    return response.json(path);
  } catch {
    return null;
  }
}
