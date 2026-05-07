# Purchase API Performance Test

## API được test

`POST /api/orders` đi qua gần đủ luồng checkout:

1. Validate request.
2. Lock và kiểm tra tồn kho.
3. Tính subtotal, discount, shipping fee, total.
4. Lưu order và order items.
5. Trừ tồn kho.

## Chuẩn bị dữ liệu

Trước khi chạy k6, start backend và bảo đảm database có:

- một user khớp `USER_ID`
- một product `ACTIVE` khớp `PRODUCT_ID`
- `stock_quantity` đủ lớn cho toàn bộ lượt request

Với script mặc định, nên chuẩn bị ít nhất 1,000 đơn vị tồn kho để lỗi không đến từ việc hết hàng đúng nghiệp vụ.

## Cách chạy

```bash
cd backend
BASE_URL=http://localhost:8080 USER_ID=1 PRODUCT_ID=1 k6 run performance/k6/order-checkout.js
```

## Kịch bản tải

- Ramp up lên 5 virtual users trong 30 giây.
- Giữ 10 virtual users trong 1 phút.
- Ramp down về 0 trong 30 giây.
- Mỗi virtual user gửi một checkout request rồi chờ 1 giây.

## Thresholds

- `http_req_failed < 1%`: tỉ lệ lỗi HTTP phải thấp.
- `p95(http_req_duration) < 500ms`: 95% request hoàn thành dưới 500ms trên môi trường local/dev.
- `checks > 95%`: phần lớn response phải là `201`, `PENDING`, và có `totalPrice > 0`.

## Metrics cần báo cáo

- Response time: average, p90, p95, max.
- Throughput: requests per second.
- Error rate: failed HTTP requests và failed checks.
- Inventory correctness: tồn kho giảm đúng bằng số order thành công.

## Phân tích bottleneck dự kiến

Bottleneck dễ gặp nhất là lock tồn kho trong `InventoryRepository.findByIdForUpdate`.
Đây là chủ ý thiết kế để đảm bảo correctness: hai checkout đồng thời không được bán cùng một đơn vị tồn kho.
Nếu p95 latency tăng khi tải cao, hãy so sánh:

- một product hot id với nhiều product id
- có coupon với không coupon
- tốc độ PostgreSQL local disk và connection pool size

Với performance test production thực tế, nên phân tán đơn qua nhiều product và user. Script hiện tại cố ý dùng một product để làm lock contention dễ quan sát và dễ giải thích.
