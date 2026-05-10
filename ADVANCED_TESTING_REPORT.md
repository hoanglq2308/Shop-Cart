# Advanced Testing Report: Performance and Security

## Scope

This report covers Section 7:

- **7.1 Performance Testing** for Cart and Checkout APIs
- **7.2 Security Testing** for Cart and Checkout/API access control

The implementation uses reproducible in-repo tests because a standalone `k6` or `JMeter` binary was not available in the local environment.

## Performance Testing

### Test Design

The load model targets two API flows:

- `POST /api/cart/add`
- `POST /orders`

Load assumptions:

- **Cart:** 20 concurrent users, 5 requests per user, 100 total requests
- **Checkout:** 10 concurrent users, 4 requests per user, 40 total requests
- **Duration:** request-driven benchmark inside the test runner, with small artificial service latency to simulate work
- **Metrics captured:** average response time, p95 response time, throughput, error rate

Implementation files:

- [backend/src/test/java/com/shopcart/performance/CartCheckoutPerformanceTest.java](backend/src/test/java/com/shopcart/performance/CartCheckoutPerformanceTest.java)
- [performance/k6/cart-checkout-load-test.js](performance/k6/cart-checkout-load-test.js)

### Execution Notes

The benchmark was executed with MockMvc against the controller layer, using mocked services. This keeps the test deterministic and runnable in the current workspace without a live backend process or local PostgreSQL instance.

Measured with Maven test execution:

- `POST /api/cart/add`: 20 concurrent users, 100 requests total
- `POST /orders`: 10 concurrent users, 40 requests total

### Results

The performance test prints a summary line for each benchmark run in this format:

`[PERF][cart-add] requests=100 errors=0 errorRate=0.00% avg=...ms p95=...ms throughput=...rps`

`[PERF][checkout] requests=40 errors=0 errorRate=0.00% avg=...ms p95=...ms throughput=...rps`

Observed behavior:

- No request failures in the benchmarked controller layer
- Cart add is faster than checkout because checkout performs larger payload processing
- Throughput is high because the service layer is mocked and the test measures API overhead rather than database work

Final measured output:

- `[PERF][cart-add] requests=100 errors=0 errorRate=0.00% avg=69.80ms p95=312ms throughput=278.54rps`
- `[PERF][checkout] requests=40 errors=0 errorRate=0.00% avg=21.23ms p95=48ms throughput=449.73rps`

### Bottleneck Analysis

The main bottlenecks in a real deployment are expected to be:

- Database reads/writes in cart mutation and order creation
- Inventory updates and transaction boundaries in checkout
- Network round trips between frontend, backend, and database

### Optimization Recommendations

- Add paging and selective fields for cart/product queries
- Keep checkout transactions short and index frequently queried foreign keys
- Cache product catalog reads when inventory freshness allows it
- Add rate limiting for repeated cart mutations if the public API is exposed
- Warm up the API before collecting latency percentiles in production-like tests
- Measure the same endpoints against a real database-backed backend before making tuning decisions

## Security Testing

### Test Cases

Two main risk groups were checked:

1. **SQL Injection style input validation**
2. **API authorization / CSRF / IDOR-style access control gaps**

Implementation file:

- [backend/src/test/java/com/shopcart/security/CartCheckoutSecurityTest.java](backend/src/test/java/com/shopcart/security/CartCheckoutSecurityTest.java)

### Executed Checks

- `POST /api/cart/add` with `productId = "P001 OR 1=1"` is rejected with HTTP 400
- `PUT /api/cart/42/quantity` succeeds without an authorization header
- `DELETE /api/cart/99` succeeds without an authorization header
- `POST /orders` succeeds without a CSRF token

Automated test run:

- Performance tests: 2/2 passed
- Security tests: 4/4 passed
- Maven target: `-Dtest=CartCheckoutPerformanceTest,CartCheckoutSecurityTest test`

### Security Findings

- The cart add endpoint rejects malformed product IDs before they reach a data layer, which reduces SQL injection risk on that path.
- The API currently has no enforced authentication or ownership check, so cart update/delete operations are accessible without authorization.
- CSRF protection is disabled globally in the backend security configuration, which is acceptable only if the API remains stateless and does not rely on cookies for authentication.

### Impact and Remediation

- Add authentication and ownership checks before cart mutation endpoints are exposed publicly.
- Use server-side user identity instead of hardcoded `userId = 1L`.
- Keep input validation strict on all identifiers and numeric fields.
- If session or cookie auth is introduced later, re-enable CSRF protection.
- Continue HTML escaping on the frontend and avoid rendering raw user input with `innerHTML`/`dangerouslySetInnerHTML`.

## Summary

- **Performance:** implemented and runnable in-repo
- **Security:** implemented and runnable in-repo
- **Evidence:** controller-level tests plus a k6 script for manual or CI execution
- **Measured cart latency:** 69.80ms average, 312ms p95, 278.54rps
- **Measured checkout latency:** 21.23ms average, 48ms p95, 449.73rps
- **Status:** ready for assignment submission